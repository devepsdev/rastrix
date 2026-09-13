package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.Suggestion;
import dev.deveps.rastrix.entities.SuggestionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {

    List<Suggestion> findByUserIdOrderByFechaCreacionDesc(Long userId);

    Page<Suggestion> findByStatus(SuggestionStatus status, Pageable pageable);

    long countByUserIdAndStatus(Long userId, SuggestionStatus status);

    long countByStatus(SuggestionStatus status);

}
