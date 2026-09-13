package dev.deveps.rastrix.dto.response;

import java.time.LocalDateTime;

public record RatingResponse(

        Long id,
        String uuid,
        Long userId,
        /** Nombre público del autor; null si la cuenta ya no existe. */
        String userName,
        Long marketId,
        Integer score,
        String comment,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion

) {
}
