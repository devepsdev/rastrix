-- Sugerencias automáticas del scraper.
--
-- El scraper entra en la API con una cuenta propia de rol SCRAPER: tiene los
-- mismos permisos limitados que un usuario, pero sus sugerencias se marcan con
-- su origen y la URL de donde salieron, para poder revisarlas con contexto.

ALTER TABLE usuarios
    MODIFY role ENUM('USER','ADMIN','SCRAPER') NOT NULL DEFAULT 'USER';

ALTER TABLE sugerencias
    ADD COLUMN origen VARCHAR(20) NOT NULL DEFAULT 'USUARIO' AFTER usuario_id,
    ADD COLUMN url_fuente VARCHAR(500) DEFAULT NULL AFTER origen;
