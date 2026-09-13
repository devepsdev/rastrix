package dev.deveps.rastrix.dto.request;

import jakarta.validation.constraints.NotNull;

/** Mercado (nuevo o ya existente) con el que se da por resuelta la sugerencia. */
public record ApproveSuggestionRequest(

        @NotNull
        Long marketId

) {
}
