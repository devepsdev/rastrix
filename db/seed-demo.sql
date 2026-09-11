-- =====================================================================
-- Datos de DEMOSTRACIÓN para desarrollo local.
--
-- No forma parte del esquema (db/rastrix.sql) ni debe ejecutarse en
-- producción: borra y reescribe el catálogo completo de mercados.
-- Las fotos son de Unsplash y sirven solo como marcador de posición.
--
-- Uso:  mysql -u root rastrix < db/seed-demo.sql
-- =====================================================================

USE rastrix;

-- El catálogo se regenera entero para que el script sea repetible.
-- No se tocan usuarios, favoritos ni valoraciones.
DELETE FROM mercado_categorias;
DELETE FROM imagenes_mercado;
DELETE FROM expositores;
DELETE FROM mercados;
DELETE FROM categorias;

ALTER TABLE mercados AUTO_INCREMENT = 1;
ALTER TABLE categorias AUTO_INCREMENT = 1;

-- ---------------------------------------------------------------------
-- Categorías
-- ---------------------------------------------------------------------
INSERT INTO categorias (uuid, nombre, descripcion, icono) VALUES
(UUID(), 'Muebles',          'Mobiliario antiguo y restaurado',            'archive'),
(UUID(), 'Cerámica y vidrio','Loza, porcelana, cristal y azulejería',      'coffee'),
(UUID(), 'Monedas y sellos', 'Numismática y filatelia',                    'disc'),
(UUID(), 'Relojes',          'Relojería de bolsillo, pared y pulsera',     'clock'),
(UUID(), 'Libros y grabados','Libro antiguo, mapas, carteles y grabados',  'book-open'),
(UUID(), 'Vinilos',          'Discos, tocadiscos y equipos de sonido',     'music'),
(UUID(), 'Joyería',          'Joyas de época y bisutería de colección',    'star'),
(UUID(), 'Textil y moda',    'Ropa vintage, encajes y complementos',       'scissors'),
(UUID(), 'Juguetes',         'Juguetería antigua, hojalata y muñecas',     'gift'),
(UUID(), 'Arte',             'Pintura, escultura y artes decorativas',     'image');

-- ---------------------------------------------------------------------
-- Mercados
-- ---------------------------------------------------------------------
INSERT INTO mercados
(uuid, nombre, descripcion, direccion, ciudad, provincia, codigo_postal, latitud, longitud,
 periodicidad, dia_semana, fecha_inicio, fecha_fin, hora_inicio, hora_fin,
 imagen_principal, organizador, contacto_telefono, contacto_email, sitio_web, activo)
VALUES
(UUID(), 'El Rastro',
 'El mercado al aire libre más conocido de España. Cada domingo, cientos de puestos ocupan la Ribera de Curtidores y las calles adyacentes con muebles, grabados, ropa vintage y objetos de coleccionismo. Conviene llegar temprano: lo bueno vuela antes de las once.',
 'Calle de la Ribera de Curtidores', 'Madrid', 'Madrid', '28005', 40.40750000, -3.70750000,
 'semanal', 'domingo', NULL, NULL, '09:00:00', '15:00:00',
 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=1200&q=80',
 'Ayuntamiento de Madrid', '915 298 210', 'info@elrastro.example', 'https://www.esmadrid.com', 1),

(UUID(), 'Mercat dels Encants',
 'Uno de los mercados más antiguos de Europa, con más de setecientos años de historia. Bajo su célebre cubierta de espejos se subastan y venden antigüedades, mobiliario industrial y objetos de segunda mano.',
 'Carrer dels Castillejos, 158', 'Barcelona', 'Barcelona', '08013', 41.39950000, 2.18580000,
 'semanal', 'sabado', NULL, NULL, '09:00:00', '20:00:00',
 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80',
 'Mercats de Barcelona', '932 463 030', 'encants@example.com', 'https://encantsbarcelona.com', 1),

(UUID(), 'Mercado de Motores',
 'Mercado mensual en las naves del Museo del Ferrocarril, entre locomotoras históricas. Combina anticuarios, diseño, vinilo y gastronomía, con conciertos en directo durante todo el fin de semana.',
 'Paseo de las Delicias, 61', 'Madrid', 'Madrid', '28045', 40.39560000, -3.69340000,
 'mensual', 'sabado', NULL, NULL, '11:00:00', '22:00:00',
 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80',
 'Mercado de Motores', '902 228 822', 'hola@mercadodemotores.example', NULL, 1),

(UUID(), 'Mercat d''Antiguitats de Vic',
 'Mercado de anticuarios en la plaza porticada de Vic, uno de los conjuntos medievales mejor conservados de Cataluña. Especializado en mobiliario rústico, cerámica y herramientas de oficio.',
 'Plaça Major', 'Vic', 'Barcelona', '08500', 41.93010000, 2.25480000,
 'semanal', 'sabado', NULL, NULL, '09:00:00', '14:00:00',
 'https://images.unsplash.com/photo-1611486212355-d276af4581c0?w=1200&q=80',
 'Ajuntament de Vic', '938 862 100', NULL, NULL, 1),

(UUID(), 'Rastro de la Plaza Nueva',
 'Cada domingo los soportales de la Plaza Nueva del Casco Viejo se llenan de puestos de libro antiguo, filatelia, numismática y pequeñas antigüedades. Ambiente tranquilo y muy de barrio.',
 'Plaza Nueva', 'Bilbao', 'Bizkaia', '48005', 43.25680000, -2.92380000,
 'semanal', 'domingo', NULL, NULL, '09:00:00', '14:00:00',
 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&q=80',
 'Bilbao Turismo', '944 795 760', NULL, NULL, 1),

(UUID(), 'Feria de Almoneda',
 'Feria de antigüedades, galerías y coleccionismo con piezas certificadas. Reúne a más de doscientos anticuarios profesionales de toda Europa durante nueve días.',
 'IFEMA, Avenida del Partenón, 5', 'Madrid', 'Madrid', '28042', 40.46540000, -3.61630000,
 'puntual', NULL, '2026-09-18', '2026-09-27', '12:00:00', '21:00:00',
 'https://images.unsplash.com/photo-1507643179773-3e975d7ac515?w=1200&q=80',
 'IFEMA Madrid', '917 221 180', 'almoneda@example.com', 'https://www.ifema.es', 1),

(UUID(), 'Mercadillo del Cabanyal',
 'Mercado de barrio marinero con puestos de antigüedades, azulejo valenciano, ropa vintage y vinilos. Muy fotogénico por las fachadas modernistas de la zona.',
 'Carrer de la Reina', 'Valencia', 'Valencia', '46011', 39.46590000, -0.32580000,
 'semanal', 'domingo', NULL, NULL, '08:00:00', '14:00:00',
 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&q=80',
 'Associació de Comerciants del Cabanyal', NULL, NULL, NULL, 1),

(UUID(), 'Fira de Brocanters de Cardedeu',
 'Feria mensual de brocanters en el centro histórico. Destaca por la cerámica catalana, el mobiliario de payés y las herramientas agrícolas restauradas.',
 'Plaça de Sant Joan', 'Cardedeu', 'Barcelona', '08440', 41.63970000, 2.35750000,
 'mensual', 'domingo', NULL, NULL, '09:00:00', '15:00:00',
 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80',
 'Ajuntament de Cardedeu', '938 444 004', NULL, NULL, 1),

(UUID(), 'Mercadillo de la Plaza San Bruno',
 'Junto a La Seo, reúne cada domingo a coleccionistas de moneda, sello, postal antigua y pin. Pequeño pero muy especializado.',
 'Plaza de San Bruno', 'Zaragoza', 'Zaragoza', '50001', 41.65540000, -0.87610000,
 'semanal', 'domingo', NULL, NULL, '09:00:00', '14:00:00',
 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80',
 'Ayuntamiento de Zaragoza', NULL, NULL, NULL, 1),

(UUID(), 'Mercadillo de la Alameda',
 'Mercado de antigüedades y coleccionismo en la Alameda de Hércules. Libros, discos, cámaras y mobiliario, con las terrazas del entorno como sobremesa.',
 'Alameda de Hércules', 'Sevilla', 'Sevilla', '41002', 37.39860000, -5.99560000,
 'semanal', 'jueves', NULL, NULL, '09:00:00', '14:30:00',
 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80',
 'Distrito Casco Antiguo', NULL, NULL, NULL, 1),

(UUID(), 'Feria del Libro Antiguo y de Ocasión',
 'Casetas de librerías de viejo con primeras ediciones, mapas, grabados y cartelería. Se celebra en el Paseo de Recoletos a finales de otoño.',
 'Paseo de Recoletos', 'Madrid', 'Madrid', '28001', 40.42250000, -3.69240000,
 'puntual', NULL, '2026-11-06', '2026-11-22', '11:00:00', '20:30:00',
 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=1200&q=80',
 'Gremio de Libreros de Viejo', NULL, 'libro@example.com', NULL, 1),

(UUID(), 'Mercado de Antigüedades de Santa Cruz',
 'Mercado de anticuarios bajo los laureles de la plaza, con relojería, joyería de época y platería canaria.',
 'Plaza del Príncipe', 'Santa Cruz de Tenerife', 'Santa Cruz de Tenerife', '38003', 28.46830000, -16.25460000,
 'quincenal', 'sabado', NULL, NULL, '10:00:00', '15:00:00',
 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=1200&q=80',
 'Ayuntamiento de Santa Cruz', NULL, NULL, NULL, 1);

-- ---------------------------------------------------------------------
-- Relación mercado <-> categoría
-- ---------------------------------------------------------------------
INSERT INTO mercado_categorias (uuid, mercado_id, categoria_id)
SELECT UUID(), m.id, c.id
FROM mercados m
JOIN categorias c
WHERE (m.nombre = 'El Rastro'                                AND c.nombre IN ('Muebles', 'Libros y grabados', 'Textil y moda', 'Vinilos'))
   OR (m.nombre = 'Mercat dels Encants'                      AND c.nombre IN ('Muebles', 'Cerámica y vidrio', 'Arte'))
   OR (m.nombre = 'Mercado de Motores'                       AND c.nombre IN ('Vinilos', 'Textil y moda', 'Juguetes'))
   OR (m.nombre = 'Mercat d''Antiguitats de Vic'             AND c.nombre IN ('Muebles', 'Cerámica y vidrio'))
   OR (m.nombre = 'Rastro de la Plaza Nueva'                 AND c.nombre IN ('Monedas y sellos', 'Libros y grabados'))
   OR (m.nombre = 'Feria de Almoneda'                        AND c.nombre IN ('Arte', 'Joyería', 'Muebles', 'Relojes'))
   OR (m.nombre = 'Mercadillo del Cabanyal'                  AND c.nombre IN ('Cerámica y vidrio', 'Vinilos', 'Textil y moda'))
   OR (m.nombre = 'Fira de Brocanters de Cardedeu'           AND c.nombre IN ('Cerámica y vidrio', 'Muebles'))
   OR (m.nombre = 'Mercadillo de la Plaza San Bruno'         AND c.nombre IN ('Monedas y sellos'))
   OR (m.nombre = 'Mercadillo de la Alameda'                 AND c.nombre IN ('Libros y grabados', 'Vinilos', 'Arte'))
   OR (m.nombre = 'Feria del Libro Antiguo y de Ocasión'     AND c.nombre IN ('Libros y grabados', 'Arte'))
   OR (m.nombre = 'Mercado de Antigüedades de Santa Cruz'    AND c.nombre IN ('Relojes', 'Joyería'));

-- ---------------------------------------------------------------------
-- Galería
-- ---------------------------------------------------------------------
INSERT INTO imagenes_mercado (uuid, mercado_id, url_imagen, orden)
SELECT UUID(), m.id, v.url, v.orden
FROM mercados m
JOIN (
    SELECT 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80' AS url, 0 AS orden
    UNION ALL SELECT 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=800&q=80', 1
    UNION ALL SELECT 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=800&q=80', 2
) v
WHERE m.nombre IN ('El Rastro', 'Mercat dels Encants', 'Mercado de Motores', 'Feria de Almoneda');

-- ---------------------------------------------------------------------
-- Expositores
-- ---------------------------------------------------------------------
INSERT INTO expositores (uuid, mercado_id, nombre, especialidad, descripcion, contacto)
SELECT UUID(), m.id, v.nombre, v.especialidad, v.descripcion, v.contacto
FROM mercados m
JOIN (
    SELECT 'Antigüedades Lavapiés' AS nombre, 'Mobiliario castellano' AS especialidad,
           'Tres generaciones restaurando arcones, bargueños y sillería.' AS descripcion,
           'lavapies@example.com' AS contacto
    UNION ALL SELECT 'El Cajón de Sastre', 'Textil y encajes', 'Mantelerías, mantones y ropa de época seleccionada.', NULL
    UNION ALL SELECT 'Numismática Ribera', 'Moneda y medalla', 'Moneda española desde el siglo XVI y medallística militar.', '600 123 456'
) v
WHERE m.nombre = 'El Rastro';

INSERT INTO expositores (uuid, mercado_id, nombre, especialidad, descripcion, contacto)
SELECT UUID(), m.id, v.nombre, v.especialidad, NULL, NULL
FROM mercados m
JOIN (
    SELECT 'Vinils del Poblenou' AS nombre, 'Vinilo y alta fidelidad' AS especialidad
    UNION ALL SELECT 'Ferro i Fusta', 'Mobiliario industrial'
) v
WHERE m.nombre = 'Mercat dels Encants';
