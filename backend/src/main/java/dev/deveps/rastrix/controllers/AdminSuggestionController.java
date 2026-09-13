package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.request.ApproveSuggestionRequest;
import dev.deveps.rastrix.dto.request.RejectSuggestionRequest;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.dto.response.SuggestionResponse;
import dev.deveps.rastrix.entities.SuggestionStatus;
import dev.deveps.rastrix.services.SuggestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/suggestions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSuggestionController {

    private final SuggestionService suggestionService;

    @GetMapping
    public PageResponse<SuggestionResponse> findAll(
            @RequestParam(required = false) SuggestionStatus status,
            Pageable pageable) {
        return suggestionService.findByStatus(status, pageable);
    }

    @GetMapping("/{id}")
    public SuggestionResponse findById(@PathVariable Long id) {
        return suggestionService.findById(id);
    }

    @PutMapping("/{id}/approve")
    public SuggestionResponse approve(@PathVariable Long id, @Valid @RequestBody ApproveSuggestionRequest request) {
        return suggestionService.approve(id, request.marketId());
    }

    @PutMapping("/{id}/reject")
    public SuggestionResponse reject(@PathVariable Long id, @Valid @RequestBody RejectSuggestionRequest request) {
        return suggestionService.reject(id, request.reason());
    }

}
