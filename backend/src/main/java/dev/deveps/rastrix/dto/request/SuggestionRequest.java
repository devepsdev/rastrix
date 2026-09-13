package dev.deveps.rastrix.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record SuggestionRequest(

        @NotBlank
        @Size(max = 150)
        String name,

        @NotBlank
        @Size(max = 100)
        String city,

        @Size(max = 100)
        String province,

        @Size(max = 255)
        String address,

        @Pattern(regexp = "diario|semanal|quincenal|mensual|puntual")
        String frequency,

        @Pattern(regexp = "lunes|martes|miercoles|jueves|viernes|sabado|domingo")
        String dayOfWeek,

        LocalDate startDate,

        LocalDate endDate,

        LocalTime startTime,

        LocalTime endTime,

        @Size(max = 2000)
        String description,

        @Size(max = 255)
        String contact,

        @Size(max = 1000)
        String comment

) {
}
