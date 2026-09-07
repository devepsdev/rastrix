package dev.deveps.rastrix.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Envoltorio propio para respuestas paginadas, en vez de devolver
 * org.springframework.data.domain.Page directamente: así el JSON de la API
 * tiene una forma estable y no depende de cómo Spring Data serialice Page
 * en cada versión.
 */
public record PageResponse<T>(

        List<T> content,
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean last

) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
