package dev.deveps.rastrix.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record MarketImageRequest(

        @NotNull
        Long marketId,

        @NotBlank
        @Size(max = 255)
        String imageUrl,

        @PositiveOrZero
        Integer order

) {
}
