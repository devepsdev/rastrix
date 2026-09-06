package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.request.FavoriteRequest;
import dev.deveps.rastrix.dto.response.FavoriteResponse;
import dev.deveps.rastrix.security.UserPrincipal;
import dev.deveps.rastrix.services.FavoriteService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping("/me")
    public List<FavoriteResponse> findMine(@AuthenticationPrincipal UserPrincipal principal) {
        return favoriteService.findByUserId(principal.getId());
    }

    @GetMapping("/{id}")
    public FavoriteResponse findById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        FavoriteResponse favorite = favoriteService.findById(id);
        requireOwnerOrAdmin(favorite.userId(), principal);
        return favorite;
    }

    @PostMapping
    public ResponseEntity<FavoriteResponse> create(
            @Valid @RequestBody FavoriteRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        // El userId del cuerpo se ignora: un usuario solo puede crear favoritos para sí mismo.
        FavoriteRequest ownRequest = new FavoriteRequest(principal.getId(), request.marketId());
        return ResponseEntity.status(HttpStatus.CREATED).body(favoriteService.create(ownRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        FavoriteResponse favorite = favoriteService.findById(id);
        requireOwnerOrAdmin(favorite.userId(), principal);
        favoriteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void requireOwnerOrAdmin(Long ownerId, UserPrincipal principal) {
        if (!principal.isSelfOrAdmin(ownerId)) {
            throw new AccessDeniedException("No tienes permiso para acceder a este favorito");
        }
    }

}
