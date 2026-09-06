package dev.deveps.rastrix.dto.response;

import java.time.LocalDateTime;

public record MarketImageResponse(

        Long id,
        String uuid,
        Long marketId,
        String imageUrl,
        Integer order,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion

) {
}
