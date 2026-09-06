package dev.deveps.rastrix.dto.response;

import java.time.LocalDateTime;

public record FavoriteResponse(

        Long id,
        String uuid,
        Long userId,
        Long marketId,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion

) {
}
