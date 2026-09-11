-- =====================================================================
-- Unicidad de mercados por nombre + ciudad.
--
-- Motivo: hasta ahora nada impedía insertar el mismo mercado dos veces,
-- así que el importador automático habría duplicado el catálogo en cada
-- pasada semanal.
--
-- Antes de aplicarlo, comprueba que no haya duplicados ya en la tabla:
--
--   SELECT nombre, ciudad, COUNT(*)
--   FROM mercados
--   GROUP BY nombre, ciudad
--   HAVING COUNT(*) > 1;
--
-- Si devuelve filas, hay que fusionarlas o borrarlas primero: el ALTER
-- fallará con error 1062 mientras existan.
--
-- Uso:  mysql -u root rastrix < db/migraciones/2026-09-11-unicidad-mercados.sql
-- =====================================================================

ALTER TABLE mercados
    ADD UNIQUE KEY unico_mercado_ciudad (nombre, ciudad);
