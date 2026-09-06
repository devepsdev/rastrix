package dev.deveps.rastrix.controllers;

import dev.deveps.rastrix.dto.request.NotificationRequest;
import dev.deveps.rastrix.dto.response.NotificationResponse;
import dev.deveps.rastrix.security.UserPrincipal;
import dev.deveps.rastrix.services.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    public List<NotificationResponse> findMine(@AuthenticationPrincipal UserPrincipal principal) {
        return notificationService.findByUserId(principal.getId());
    }

    @GetMapping("/me/unread")
    public List<NotificationResponse> findMyUnread(@AuthenticationPrincipal UserPrincipal principal) {
        return notificationService.findUnreadByUserId(principal.getId());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationResponse> create(@Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.create(request));
    }

    @PutMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        requireOwnerOrAdmin(notificationService.findById(id).userId(), principal);
        return notificationService.markAsRead(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        requireOwnerOrAdmin(notificationService.findById(id).userId(), principal);
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void requireOwnerOrAdmin(Long ownerId, UserPrincipal principal) {
        if (!principal.isSelfOrAdmin(ownerId)) {
            throw new AccessDeniedException("No tienes permiso para acceder a esta notificación");
        }
    }

}
