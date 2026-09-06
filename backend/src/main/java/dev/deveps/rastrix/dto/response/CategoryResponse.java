package dev.deveps.rastrix.dto.response;

import java.time.LocalDateTime;

public record CategoryResponse(

        Long id,
        String uuid,
        String name,
        String description,
        String icon,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion

) {
}
