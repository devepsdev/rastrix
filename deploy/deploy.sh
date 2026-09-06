#!/usr/bin/env bash
#
# Despliegue de Rastrix en un servidor Ubuntu Server con MySQL.
#
# Pide las credenciales de la base de datos y del usuario administrador,
# las guarda en /etc/rastrix/rastrix.env (solo legibles por root y el
# usuario de servicio), compila el backend y lo deja corriendo como
# servicio systemd (rastrix.service), que se reinicia solo si el proceso
# muere o el servidor arranca.
#
# Uso: sudo ./deploy/deploy.sh   (ejecutar desde una copia del repositorio)
#
# Es seguro volver a ejecutarlo para redesplegar: reutiliza las credenciales
# ya guardadas como valor por defecto (basta con pulsar Intro para
# mantenerlas) y solo aplica el esquema de base de datos si no existe ya.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
SCHEMA_FILE="$REPO_ROOT/db/rastrix.sql"

ENV_FILE="/etc/rastrix/rastrix.env"
INSTALL_DIR="/opt/rastrix"
SERVICE_FILE="/etc/systemd/system/rastrix.service"
SERVICE_USER="rastrix"
DB_NAME="rastrix"

# ---------------------------------------------------------------------------
# Comprobaciones previas
# ---------------------------------------------------------------------------

if [[ $EUID -ne 0 ]]; then
    echo "Este script necesita permisos de administrador. Ejecuta: sudo $0" >&2
    exit 1
fi

for cmd in mysql java javac openssl useradd systemctl; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Falta el comando '$cmd'. Instálalo antes de continuar (recuerda que hace falta un JDK completo, no solo un JRE, para compilar)." >&2
        exit 1
    fi
done

if [[ ! -f "$BACKEND_DIR/pom.xml" || ! -f "$BACKEND_DIR/mvnw" ]]; then
    echo "No se encuentra $BACKEND_DIR/pom.xml o $BACKEND_DIR/mvnw. Ejecuta este script desde una copia del repositorio." >&2
    exit 1
fi

JAVA_VERSION="$(java -version 2>&1 | head -n1 | grep -oE '"[0-9]+' | tr -d '"' || true)"
if [[ -n "$JAVA_VERSION" && "$JAVA_VERSION" -lt 25 ]]; then
    echo "Aviso: se ha detectado Java $JAVA_VERSION, pero el proyecto está compilado para Java 25 o superior." >&2
fi

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

get_env_value() {
    local key=$1
    if [[ -f "$ENV_FILE" ]]; then
        grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d'=' -f2- || true
    fi
}

prompt() {
    # prompt <variable> <mensaje> <valor_por_defecto>
    local __resultvar=$1 __message=$2 __default=${3:-}
    local __input
    if [[ -n "$__default" ]]; then
        read -rp "$__message [$__default]: " __input
        __input="${__input:-$__default}"
    else
        read -rp "$__message: " __input
    fi
    printf -v "$__resultvar" '%s' "$__input"
}

prompt_secret() {
    # prompt_secret <variable> <mensaje>
    local __resultvar=$1 __message=$2
    local __input
    read -rsp "$__message: " __input
    echo
    printf -v "$__resultvar" '%s' "$__input"
}

run_mysql() {
    MYSQL_PWD="$DB_PASSWORD" mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" "$@"
}

# ---------------------------------------------------------------------------
# Cargar valores de un despliegue anterior (si existen) como defaults
# ---------------------------------------------------------------------------

SERVER_PORT="$(get_env_value SERVER_PORT)"
DB_HOST="$(get_env_value DB_HOST)"
DB_PORT="$(get_env_value DB_PORT)"
DB_USERNAME="$(get_env_value DB_USERNAME)"
DB_PASSWORD="$(get_env_value DB_PASSWORD)"
JWT_SECRET="$(get_env_value JWT_SECRET)"
ADMIN_NAME="$(get_env_value ADMIN_NAME)"
ADMIN_EMAIL="$(get_env_value ADMIN_EMAIL)"
ADMIN_PASSWORD="$(get_env_value ADMIN_PASSWORD)"

# ---------------------------------------------------------------------------
# Puerto de la aplicación
# ---------------------------------------------------------------------------

echo "== Aplicación =="
prompt SERVER_PORT "Puerto en el que escuchará Rastrix (detrás del proxy inverso)" "${SERVER_PORT:-8080}"

# ---------------------------------------------------------------------------
# Credenciales de la base de datos
# ---------------------------------------------------------------------------

echo
echo "== Base de datos MySQL =="
prompt DB_HOST "Host de MySQL" "${DB_HOST:-localhost}"
prompt DB_PORT "Puerto de MySQL" "${DB_PORT:-3306}"
prompt DB_USERNAME "Usuario de MySQL" "${DB_USERNAME:-root}"

while true; do
    db_pw_message="Contraseña de MySQL para '$DB_USERNAME'"
    [[ -n "$DB_PASSWORD" ]] && db_pw_message="$db_pw_message (deja en blanco para mantener la actual)"
    prompt_secret DB_PASSWORD_INPUT "$db_pw_message"
    if [[ -n "$DB_PASSWORD_INPUT" ]]; then
        DB_PASSWORD="$DB_PASSWORD_INPUT"
        break
    elif [[ -n "$DB_PASSWORD" ]]; then
        break
    else
        echo "La contraseña no puede estar vacía."
    fi
done

echo "Comprobando conexión con MySQL..."
if ! run_mysql -e "SELECT 1;" >/dev/null 2>&1; then
    echo "No se ha podido conectar a MySQL en $DB_HOST:$DB_PORT con el usuario '$DB_USERNAME'." >&2
    exit 1
fi
echo "Conexión correcta."

SCHEMA_PRESENT="$(run_mysql -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}' AND table_name='usuarios';")"

if [[ "$SCHEMA_PRESENT" -eq 0 ]]; then
    echo "La base de datos '$DB_NAME' no tiene el esquema de Rastrix todavía. Aplicando $SCHEMA_FILE..."
    run_mysql < "$SCHEMA_FILE"
    echo "Esquema aplicado."
else
    echo "El esquema ya existe en '$DB_NAME'; no se modifica."
fi

# ---------------------------------------------------------------------------
# JWT secret
# ---------------------------------------------------------------------------

echo
echo "== Firma de tokens JWT =="
if [[ -n "$JWT_SECRET" ]]; then
    read -rp "Ya hay un JWT_SECRET guardado. ¿Generar uno nuevo? Esto cerrará la sesión de todos los usuarios [s/N]: " ROTATE_JWT
    if [[ "$ROTATE_JWT" =~ ^[sS]$ ]]; then
        JWT_SECRET="$(openssl rand -base64 32)"
        echo "Nuevo JWT_SECRET generado."
    else
        echo "Se mantiene el JWT_SECRET existente."
    fi
else
    JWT_SECRET="$(openssl rand -base64 32)"
    echo "JWT_SECRET generado."
fi

# ---------------------------------------------------------------------------
# Credenciales del administrador
# ---------------------------------------------------------------------------

echo
echo "== Usuario administrador =="
prompt ADMIN_NAME "Nombre del administrador" "${ADMIN_NAME:-Administrador}"

while true; do
    prompt ADMIN_EMAIL "Email del administrador" "${ADMIN_EMAIL:-}"
    [[ -n "$ADMIN_EMAIL" ]] && break
    echo "El email no puede estar vacío."
done

while true; do
    admin_pw_message="Contraseña del administrador"
    [[ -n "$ADMIN_PASSWORD" ]] && admin_pw_message="$admin_pw_message (deja en blanco para mantener la actual)"
    prompt_secret ADMIN_PASSWORD_INPUT "$admin_pw_message"
    if [[ -z "$ADMIN_PASSWORD_INPUT" && -n "$ADMIN_PASSWORD" ]]; then
        break
    fi
    if [[ ${#ADMIN_PASSWORD_INPUT} -lt 8 ]]; then
        echo "La contraseña debe tener al menos 8 caracteres."
        continue
    fi
    prompt_secret ADMIN_PASSWORD_CONFIRM "Repite la contraseña"
    if [[ "$ADMIN_PASSWORD_INPUT" != "$ADMIN_PASSWORD_CONFIRM" ]]; then
        echo "Las contraseñas no coinciden, inténtalo de nuevo."
        continue
    fi
    ADMIN_PASSWORD="$ADMIN_PASSWORD_INPUT"
    break
done

# ---------------------------------------------------------------------------
# Guardar credenciales
# ---------------------------------------------------------------------------

echo
echo "Guardando credenciales en $ENV_FILE..."
mkdir -p "$(dirname "$ENV_FILE")"
umask 077
cat > "$ENV_FILE" <<EOF
# Generado por deploy.sh el $(date -Iseconds). No compartir ni versionar este fichero.
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=$SERVER_PORT
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
ADMIN_NAME=$ADMIN_NAME
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF

if ! id "$SERVICE_USER" >/dev/null 2>&1; then
    echo "Creando usuario de sistema '$SERVICE_USER'..."
    useradd --system --no-create-home --shell /usr/sbin/nologin "$SERVICE_USER"
fi
chown root:"$SERVICE_USER" "$ENV_FILE"
chmod 640 "$ENV_FILE"

# ---------------------------------------------------------------------------
# Compilar el backend
# ---------------------------------------------------------------------------

echo
echo "Compilando el backend (puede tardar unos minutos)..."
(cd "$BACKEND_DIR" && bash mvnw -q clean package -DskipTests)

JAR_FILE="$(find "$BACKEND_DIR/target" -maxdepth 1 -name '*.jar' ! -name '*.original' | head -n 1)"
if [[ -z "$JAR_FILE" ]]; then
    echo "No se ha encontrado el .jar generado en $BACKEND_DIR/target" >&2
    exit 1
fi

echo "Instalando en $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"
cp "$JAR_FILE" "$INSTALL_DIR/rastrix.jar"
chown -R "$SERVICE_USER":"$SERVICE_USER" "$INSTALL_DIR"

# ---------------------------------------------------------------------------
# Servicio systemd
# ---------------------------------------------------------------------------

echo "Configurando el servicio systemd..."
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Rastrix backend
After=network.target mysql.service

[Service]
Type=simple
User=$SERVICE_USER
EnvironmentFile=$ENV_FILE
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/java -jar $INSTALL_DIR/rastrix.jar
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable rastrix >/dev/null
systemctl restart rastrix

echo
echo "Esperando a que el servicio arranque..."
sleep 8

if systemctl is-active --quiet rastrix; then
    echo "Rastrix está corriendo correctamente."
    systemctl status rastrix --no-pager -l | head -n 10
else
    echo "El servicio no ha arrancado correctamente. Últimas líneas del log:" >&2
    journalctl -u rastrix -n 40 --no-pager >&2
    exit 1
fi

echo
echo "Despliegue completado."
echo "Credenciales guardadas en: $ENV_FILE (permisos 640, propietario root:$SERVICE_USER)"
echo "Ver logs con: journalctl -u rastrix -f"
