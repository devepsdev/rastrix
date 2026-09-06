package dev.deveps.rastrix.dto.request;

import jakarta.validation.constraints.NotNull;

public record MarketCategoryRequest(

        @NotNull
        Long marketId,

        @NotNull
        Long categoryId

) {
}
