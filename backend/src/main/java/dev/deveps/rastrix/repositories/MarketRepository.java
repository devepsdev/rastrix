package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.Market;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MarketRepository extends JpaRepository<Market, Long> {

    Optional<Market> findByUuid(String uuid);

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

    Page<Market> findByCity(String city, Pageable pageable);

    Page<Market> findByProvince(String province, Pageable pageable);

    long countByActiveTrue();

}
