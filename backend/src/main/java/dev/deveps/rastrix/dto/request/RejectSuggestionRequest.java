package dev.deveps.rastrix.dto.request;

import jakarta.validation.constraints.Size;

public record RejectSuggestionRequest(

        @Size(max = 255)
        String reason

) {
}
