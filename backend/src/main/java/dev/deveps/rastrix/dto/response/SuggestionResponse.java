package dev.deveps.rastrix.dto.response;

import dev.deveps.rastrix.entities.SuggestionOrigin;
import dev.deveps.rastrix.entities.SuggestionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record SuggestionResponse(

        Long id,
        String uuid,
        Long userId,
        String userName,
        String userEmail,
        SuggestionOrigin origin,
        String sourceUrl,
        String name,
        String city,
        String province,
        String address,
        String frequency,
        String dayOfWeek,
        LocalDate startDate,
        LocalDate endDate,
        LocalTime startTime,
        LocalTime endTime,
        String description,
        String contact,
        String comment,
        SuggestionStatus status,
        Long marketId,
        String rejectionReason,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion

) {
}
