package dev.deveps.rastrix.dto.response;

import dev.deveps.rastrix.entities.Role;

import java.time.LocalDateTime;

public record UserResponse(

        Long id,
        String uuid,
        String name,
        String email,
        String avatarUrl,
        boolean active,
        Role role,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion

) {
}
