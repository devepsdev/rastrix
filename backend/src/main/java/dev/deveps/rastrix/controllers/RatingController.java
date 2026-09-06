package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.request.RatingRequest;
import dev.deveps.rastrix.dto.response.RatingResponse;
import dev.deveps.rastrix.security.UserPrincipal;
import dev.deveps.rastrix.services.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @GetMapping("/{id}")
    public RatingResponse findById(@PathVariable Long id) {
        return ratingService.findById(id);
    }

    @GetMapping("/market/{marketId}")
    public List<RatingResponse> findByMarketId(@PathVariable Long marketId) {
        return ratingService.findByMarketId(marketId);
    }

    @PostMapping
    public ResponseEntity<RatingResponse> create(
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        // El userId del cuerpo se ignora: un usuario solo puede valorar en su propio nombre.
        RatingRequest ownRequest = new RatingRequest(
                principal.getId(), request.marketId(), request.score(), request.comment());
        return ResponseEntity.status(HttpStatus.CREATED).body(ratingService.create(ownRequest));
    }

    @PutMapping("/{id}")
    public RatingResponse update(
            @PathVariable Long id,
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        requireOwnerOrAdmin(ratingService.findById(id).userId(), principal);
        return ratingService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        requireOwnerOrAdmin(ratingService.findById(id).userId(), principal);
        ratingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void requireOwnerOrAdmin(Long ownerId, UserPrincipal principal) {
        if (!principal.isSelfOrAdmin(ownerId)) {
            throw new AccessDeniedException("No tienes permiso para modificar esta valoración");
        }
    }

}
