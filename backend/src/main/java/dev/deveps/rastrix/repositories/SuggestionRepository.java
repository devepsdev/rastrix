package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.Suggestion;
import dev.deveps.rastrix.entities.SuggestionOrigin;
import dev.deveps.rastrix.entities.SuggestionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {

    List<Suggestion> findByUserIdOrderByFechaCreacionDesc(Long userId);

    Page<Suggestion> findByStatus(SuggestionStatus status, Pageable pageable);

    long countByUserIdAndStatus(Long userId, SuggestionStatus status);

    long countByStatus(SuggestionStatus status);

    /**
     * Si ya hay una sugerencia de ese origen con el mismo nombre y ciudad, en
     * cualquier estado. Incluye las rechazadas a propósito: lo que se rechazó
     * no debe volver a entrar en la bandeja cada semana.
     */
    @Query("""
            SELECT COUNT(s) > 0 FROM Suggestion s
            WHERE s.origin = :origin
              AND LOWER(s.name) = LOWER(:name)
              AND LOWER(s.city) = LOWER(:city)
            """)
    boolean existsByOriginAndNameAndCity(
            @Param("origin") SuggestionOrigin origin,
            @Param("name") String name,
            @Param("city") String city);

}
