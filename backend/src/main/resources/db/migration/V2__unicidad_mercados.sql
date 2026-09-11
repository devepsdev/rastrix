-- Unicidad de mercados por nombre + ciudad.
--
-- Hasta ahora nada impedía insertar el mismo mercado dos veces, así que el
-- importador automático habría duplicado el catálogo en cada pasada semanal.
-- La colación utf8mb4_unicode_ci hace la comparación insensible a mayúsculas
-- (no a acentos).
--
-- Si la tabla ya tuviera duplicados, esta migración falla con error 1062 y la
-- aplicación no arranca. Para localizarlos:
--   SELECT nombre, ciudad, COUNT(*) FROM mercados
--   GROUP BY nombre, ciudad HAVING COUNT(*) > 1;

ALTER TABLE mercados
    ADD UNIQUE KEY unico_mercado_ciudad (nombre, ciudad);
