package dev.deveps.rastrix.dto.response;

import java.time.LocalDateTime;

public record MarketCategoryResponse(

        Long id,
        String uuid,
        Long marketId,
        Long categoryId,
        LocalDateTime fechaCreacion

) {
}
