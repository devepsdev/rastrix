package dev.deveps.rastrix.dto.response;

import java.time.LocalDateTime;

public record RatingResponse(

        Long id,
        String uuid,
        Long userId,
        Long marketId,
        Integer score,
        String comment,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion

) {
}
