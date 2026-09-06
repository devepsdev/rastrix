-- =====================================================================
-- Script de creación de base de datos
-- Proyecto: App Android - Rastrix
-- Motor: MySQL (compatible con XAMPP / phpMyAdmin)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS rastrix
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE rastrix;

-- ---------------------------------------------------------------------
-- Tabla: usuarios
-- Usuarios registrados en la app (para login, favoritos, valoraciones)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: categorias
-- Tipos de artículos que se pueden encontrar en un mercado
-- (muebles, monedas, relojes, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255) DEFAULT NULL,
    icono VARCHAR(100) DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: mercados
-- Información principal de cada mercado de antigüedades
-- ---------------------------------------------------------------------
CREATE TABLE mercados (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    codigo_postal VARCHAR(10),
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    periodicidad ENUM('diario','semanal','quincenal','mensual','puntual') DEFAULT 'semanal',
    dia_semana ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') DEFAULT NULL,
    fecha_inicio DATE DEFAULT NULL,
    fecha_fin DATE DEFAULT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    imagen_principal VARCHAR(255) DEFAULT NULL,
    organizador VARCHAR(150) DEFAULT NULL,
    contacto_telefono VARCHAR(20) DEFAULT NULL,
    contacto_email VARCHAR(150) DEFAULT NULL,
    sitio_web VARCHAR(255) DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ciudad (ciudad),
    INDEX idx_provincia (provincia),
    INDEX idx_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: mercado_categorias (relación N:M entre mercados y categorías)
-- ---------------------------------------------------------------------
CREATE TABLE mercado_categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    mercado_id BIGINT NOT NULL,
    categoria_id BIGINT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unico_mercado_categoria (mercado_id, categoria_id),
    FOREIGN KEY (mercado_id) REFERENCES mercados(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: imagenes_mercado
-- Galería de fotos de cada mercado
-- ---------------------------------------------------------------------
CREATE TABLE imagenes_mercado (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    mercado_id BIGINT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    orden INT DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mercado_id) REFERENCES mercados(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: expositores
-- Vendedores/puestos que participan en los mercados
-- ---------------------------------------------------------------------
CREATE TABLE expositores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    mercado_id BIGINT DEFAULT NULL,
    nombre VARCHAR(150) NOT NULL,
    especialidad VARCHAR(150) DEFAULT NULL,
    descripcion TEXT,
    contacto VARCHAR(150) DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mercado_id) REFERENCES mercados(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: favoritos
-- Mercados marcados como favoritos por cada usuario
-- ---------------------------------------------------------------------
CREATE TABLE favoritos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    usuario_id BIGINT NOT NULL,
    mercado_id BIGINT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unico_favorito (usuario_id, mercado_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (mercado_id) REFERENCES mercados(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: valoraciones
-- Puntuaciones y comentarios de usuarios sobre un mercado
-- ---------------------------------------------------------------------
CREATE TABLE valoraciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    usuario_id BIGINT NOT NULL,
    mercado_id BIGINT NOT NULL,
    puntuacion INT NOT NULL,
    comentario TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unica_valoracion (usuario_id, mercado_id),
    CHECK (puntuacion BETWEEN 1 AND 5),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (mercado_id) REFERENCES mercados(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: notificaciones
-- Avisos enviados a los usuarios (nuevo mercado, recordatorio, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE notificaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    usuario_id BIGINT NOT NULL,
    mercado_id BIGINT DEFAULT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT,
    leida TINYINT(1) DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (mercado_id) REFERENCES mercados(id) ON DELETE SET NULL
) ENGINE=InnoDB;
