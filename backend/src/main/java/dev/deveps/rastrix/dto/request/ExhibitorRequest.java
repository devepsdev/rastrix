package dev.deveps.rastrix.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ExhibitorRequest(

        Long marketId,

        @NotBlank
        @Size(max = 150)
        String name,

        @Size(max = 150)
        String specialty,

        String description,

        @Size(max = 150)
        String contact

) {
}
