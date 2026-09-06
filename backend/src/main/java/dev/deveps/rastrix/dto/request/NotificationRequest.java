package dev.deveps.rastrix.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NotificationRequest(

        @NotNull
        Long userId,

        Long marketId,

        @NotBlank
        @Size(max = 150)
        String title,

        String message,

        boolean read

) {
}
