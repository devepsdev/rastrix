package dev.deveps.rastrix.dto.response;

import java.time.LocalDateTime;

public record UserResponse(

        Long id,
        String uuid,
        String name,
        String email,
        String avatarUrl,
        boolean active,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion

) {
}
