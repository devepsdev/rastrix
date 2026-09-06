package dev.deveps.rastrix.dto.response;

import java.time.LocalDateTime;

public record ExhibitorResponse(

        Long id,
        String uuid,
        Long marketId,
        String name,
        String specialty,
        String description,
        String contact,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion

) {
}
