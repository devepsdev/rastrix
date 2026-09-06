package dev.deveps.rastrix.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record MarketRequest(

        @NotBlank
        @Size(max = 150)
        String name,

        String description,

        @Size(max = 255)
        String address,

        @Size(max = 100)
        String city,

        @Size(max = 100)
        String province,

        @Size(max = 10)
        String postalCode,

        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        BigDecimal latitude,

        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        BigDecimal longitude,

        @NotBlank
        @Pattern(regexp = "diario|semanal|quincenal|mensual|puntual")
        String frequency,

        @Pattern(regexp = "lunes|martes|miercoles|jueves|viernes|sabado|domingo")
        String dayOfWeek,

        LocalDate startDate,

        LocalDate endDate,

        LocalTime startTime,

        LocalTime endTime,

        @Size(max = 255)
        String mainImage,

        @Size(max = 150)
        String organizer,

        @Size(max = 20)
        String contactPhone,

        @Email
        @Size(max = 150)
        String contactEmail,

        @Size(max = 255)
        String website,

        boolean active

) {
}
