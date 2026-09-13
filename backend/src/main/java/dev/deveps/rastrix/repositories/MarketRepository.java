package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.Market;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MarketRepository extends JpaRepository<Market, Long> {

    // Consultas públicas: solo mercados publicados. Un mercado oculto (pendiente
    // de revisión o retirado a mano) no debe llegar a la app.
    Optional<Market> findByIdAndActiveTrue(Long id);

    Optional<Market> findByUuidAndActiveTrue(String uuid);

    Page<Market> findByActiveTrue(Pageable pageable);

    Page<Market> findByCityAndActiveTrue(String city, Pageable pageable);

    Page<Market> findByProvinceAndActiveTrue(String province, Pageable pageable);

    /**
     * Listado del panel de administración: ve también los ocultos. Ambos filtros
     * son opcionales; el texto se busca en nombre, ciudad y provincia.
     */
    @Query("""
            SELECT m FROM Market m
            WHERE (:active IS NULL OR m.active = :active)
              AND (:query IS NULL
                   OR LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%'))
                   OR LOWER(m.city) LIKE LOWER(CONCAT('%', :query, '%'))
                   OR LOWER(m.province) LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    Page<Market> searchForAdmin(@Param("active") Boolean active, @Param("query") String query, Pageable pageable);

    /**
     * Busca por la clave natural del mercado (nombre + ciudad), que es lo que
     * usa el importador para decidir si crea o actualiza. Se escribe a mano
     * porque una consulta derivada compararía la ciudad con "= null" cuando
     * viene vacía, y eso no casa nunca con las filas que la tienen a NULL.
     */
    @Query("""
            SELECT m FROM Market m
            WHERE LOWER(m.name) = LOWER(:name)
              AND ((:city IS NULL AND m.city IS NULL) OR LOWER(m.city) = LOWER(:city))
            """)
    Optional<Market> findByNameAndCity(@Param("name") String name, @Param("city") String city);

    long countByActiveTrue();

}
