package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.NotificationRequest;
import dev.deveps.rastrix.dto.response.NotificationResponse;
import dev.deveps.rastrix.entities.Notification;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.repositories.NotificationRepository;
import dev.deveps.rastrix.repositories.UserRepository;
import dev.deveps.rastrix.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MarketRepository marketRepository;

    @Override
    public NotificationResponse create(NotificationRequest request) {
        if (!userRepository.existsById(request.userId())) {
            throw new ResourceNotFoundException("No existe ningún usuario con id: " + request.userId());
        }
        if (request.marketId() != null && !marketRepository.existsById(request.marketId())) {
            throw new ResourceNotFoundException("No existe ningún mercado con id: " + request.marketId());
        }
        Notification notification = Notification.builder()
                .userId(request.userId())
                .marketId(request.marketId())
                .title(request.title())
                .message(request.message())
                .read(request.read())
                .build();
        return toResponse(notificationRepository.save(notification));
    }

    @Override
    public void delete(Long id) {
        notificationRepository.delete(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> findByUserId(Long userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> findUnreadByUserId(Long userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public NotificationResponse markAsRead(Long id) {
        Notification notification = findEntityById(id);
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    private Notification findEntityById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna notificación con id: " + id));
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUuid(),
                notification.getUserId(),
                notification.getMarketId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getFechaCreacion(),
                notification.getFechaActualizacion()
        );
    }

}
