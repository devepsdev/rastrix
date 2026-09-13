package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.request.SuggestionRequest;
import dev.deveps.rastrix.dto.response.SuggestionResponse;
import dev.deveps.rastrix.security.UserPrincipal;
import dev.deveps.rastrix.services.SuggestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Sugerencias desde la app: cualquier usuario registrado puede proponer mercados. */
@RestController
@RequestMapping("/api/suggestions")
@RequiredArgsConstructor
public class SuggestionController {

    private final SuggestionService suggestionService;

    @PostMapping
    public ResponseEntity<SuggestionResponse> create(
            @Valid @RequestBody SuggestionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(suggestionService.create(principal.getId(), principal.getRole(), request));
    }

    @GetMapping("/me")
    public List<SuggestionResponse> findMine(@AuthenticationPrincipal UserPrincipal principal) {
        return suggestionService.findByUser(principal.getId());
    }

}
