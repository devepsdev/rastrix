package dev.deveps.rastrix.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank
        @Size(max = 80)
        String name,

        @Size(max = 255)
        String description,

        @Size(max = 100)
        String icon

) {
}
