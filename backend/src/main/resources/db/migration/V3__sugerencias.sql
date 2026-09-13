-- Sugerencias de mercados enviadas por usuarios de la app.
--
-- No escriben directamente en "mercados": un administrador las revisa y, si
-- son buenas, crea el mercado desde el panel y vincula la sugerencia con él.
-- Así ningún usuario normal tiene permiso de escritura sobre el catálogo.

CREATE TABLE sugerencias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    usuario_id BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) DEFAULT NULL,
    direccion VARCHAR(255) DEFAULT NULL,
    periodicidad VARCHAR(20) DEFAULT NULL,
    dia_semana VARCHAR(20) DEFAULT NULL,
    fecha_inicio DATE DEFAULT NULL,
    fecha_fin DATE DEFAULT NULL,
    hora_inicio TIME DEFAULT NULL,
    hora_fin TIME DEFAULT NULL,
    descripcion TEXT,
    contacto VARCHAR(255) DEFAULT NULL,
    comentario TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    mercado_id BIGINT DEFAULT NULL,
    motivo_rechazo VARCHAR(255) DEFAULT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sugerencias_estado (estado),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (mercado_id) REFERENCES mercados(id) ON DELETE SET NULL
) ENGINE=InnoDB;
