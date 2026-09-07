package dev.deveps.rastrix.dto.response;

public record AuthResponse(

        String accessToken,
        String refreshToken,
        String type,
        Long userId,
        String uuid,
        String name,
        String email

) {
}
