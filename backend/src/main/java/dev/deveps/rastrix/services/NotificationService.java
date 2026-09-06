package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.NotificationRequest;
import dev.deveps.rastrix.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    NotificationResponse create(NotificationRequest request);

    void delete(Long id);

    NotificationResponse findById(Long id);

    List<NotificationResponse> findByUserId(Long userId);

    List<NotificationResponse> findUnreadByUserId(Long userId);

    NotificationResponse markAsRead(Long id);

}
