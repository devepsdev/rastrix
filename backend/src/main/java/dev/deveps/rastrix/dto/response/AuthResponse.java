package dev.deveps.rastrix.dto.response;

public record AuthResponse(

        String token,
        String type,
        Long userId,
        String uuid,
        String name,
        String email

) {
}
