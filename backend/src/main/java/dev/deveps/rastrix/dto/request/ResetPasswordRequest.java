package dev.deveps.rastrix.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Pattern(regexp = "\\d{6}", message = "debe tener 6 dígitos")
        String code,

        @NotBlank
        @Size(min = 8, max = 100)
        String newPassword

) {
}
