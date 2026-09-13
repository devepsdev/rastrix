package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.SuggestionRequest;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.dto.response.SuggestionResponse;
import dev.deveps.rastrix.entities.SuggestionStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SuggestionService {

    SuggestionResponse create(Long userId, SuggestionRequest request);

    List<SuggestionResponse> findByUser(Long userId);

    PageResponse<SuggestionResponse> findByStatus(SuggestionStatus status, Pageable pageable);

    SuggestionResponse findById(Long id);

    /** Marca la sugerencia como aprobada y la vincula con el mercado dado de alta a partir de ella. */
    SuggestionResponse approve(Long id, Long marketId);

    SuggestionResponse reject(Long id, String reason);

}
