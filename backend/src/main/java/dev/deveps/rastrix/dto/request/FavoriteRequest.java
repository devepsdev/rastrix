package dev.deveps.rastrix.dto.request;

import jakarta.validation.constraints.NotNull;

public record FavoriteRequest(

        @NotNull
        Long userId,

        @NotNull
        Long marketId

) {
}
