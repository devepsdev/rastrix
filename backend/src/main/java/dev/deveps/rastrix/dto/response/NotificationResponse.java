package dev.deveps.rastrix.dto.response;

import java.time.LocalDateTime;

public record NotificationResponse(

        Long id,
        String uuid,
        Long userId,
        Long marketId,
        String title,
        String message,
        boolean read,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion

) {
}
