#!/usr/bin/env bash
#
# Backup de la base de datos de Rastrix. Pensado para ejecutarse como root vía
# el temporizador systemd rastrix-backup.timer (instalado por deploy.sh), pero
# se puede lanzar a mano en cualquier momento: sudo /opt/apps/rastrix/backup-db.sh
#
# Lee las credenciales del mismo fichero que usa la aplicación
# (/opt/apps/rastrix/rastrix.env) y vuelca la base de datos comprimida en
# /var/backups/rastrix/, con rotación automática (se conservan los últimos
# BACKUP_RETENTION_DAYS días, 14 por defecto).
#
# Aviso: esto guarda las copias en el mismo servidor que la base de datos.
# Protege de un DROP/borrado accidental o de una migración que sale mal, pero
# NO de que el disco o el servidor entero se destruya. Para eso hace falta
# copiar además estas copias a otro sitio (otro servidor, un bucket S3-like,
# etc.) — no está incluido aquí.

set -euo pipefail

ENV_FILE="/opt/apps/rastrix/rastrix.env"
BACKUP_DIR="/var/backups/rastrix"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

if [[ $EUID -ne 0 ]]; then
    echo "Este script necesita permisos de administrador. Ejecuta: sudo $0" >&2
    exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
    echo "No se encuentra $ENV_FILE. ¿Se ha desplegado Rastrix con deploy.sh?" >&2
    exit 1
fi

for cmd in mysqldump gzip; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Falta el comando '$cmd'. Instálalo antes de continuar (mysqldump suele venir con mysql-client)." >&2
        exit 1
    fi
done

get_env_value() {
    grep -E "^$1=" "$ENV_FILE" | tail -n1 | cut -d'=' -f2-
}

DB_HOST="$(get_env_value DB_HOST)"
DB_PORT="$(get_env_value DB_PORT)"
DB_NAME="$(get_env_value DB_NAME)"
DB_USERNAME="$(get_env_value DB_USERNAME)"
DB_PASSWORD="$(get_env_value DB_PASSWORD)"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
TARGET_FILE="$BACKUP_DIR/rastrix-$TIMESTAMP.sql.gz"
TMP_FILE="$TARGET_FILE.tmp"

trap 'rm -f "$TMP_FILE"' ERR

echo "Volcando '$DB_NAME' de $DB_HOST:$DB_PORT..."
MYSQL_PWD="$DB_PASSWORD" mysqldump \
    -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" \
    --single-transaction --routines --triggers \
    "$DB_NAME" | gzip > "$TMP_FILE"

mv "$TMP_FILE" "$TARGET_FILE"
chmod 600 "$TARGET_FILE"
echo "Backup guardado en $TARGET_FILE ($(du -h "$TARGET_FILE" | cut -f1))"

echo "Eliminando backups de más de $RETENTION_DAYS días..."
find "$BACKUP_DIR" -name 'rastrix-*.sql.gz' -mtime "+$RETENTION_DAYS" -print -delete

REMAINING="$(find "$BACKUP_DIR" -name 'rastrix-*.sql.gz' | wc -l)"
echo "Backup completado. $REMAINING copia(s) conservada(s) en $BACKUP_DIR."
