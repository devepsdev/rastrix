package dev.deveps.rastrix.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record MarketResponse(

        Long id,
        String uuid,
        String name,
        String description,
        String address,
        String city,
        String province,
        String postalCode,
        BigDecimal latitude,
        BigDecimal longitude,
        String frequency,
        String dayOfWeek,
        LocalDate startDate,
        LocalDate endDate,
        LocalTime startTime,
        LocalTime endTime,
        String mainImage,
        String organizer,
        String contactPhone,
        String contactEmail,
        String website,
        boolean active,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion

) {
}
