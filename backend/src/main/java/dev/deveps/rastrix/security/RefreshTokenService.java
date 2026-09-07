package dev.deveps.rastrix.security;

import dev.deveps.rastrix.entities.RefreshToken;
import dev.deveps.rastrix.exception.InvalidRefreshTokenException;
import dev.deveps.rastrix.repositories.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Genera y valida los refresh tokens que permiten renovar el JWT de acceso
 * sin volver a hacer login. Se guardan en BD solo como hash SHA-256 (son
 * valores de alta entropía generados por nosotros, no contraseñas elegidas
 * por una persona, así que no hace falta un hash lento con sal como BCrypt;
 * lo importante es no guardarlos en claro por si la base de datos se filtra).
 *
 * Rotación: cada vez que se usa un refresh token para renovar, ese token se
 * marca como revocado y se emite uno nuevo. Así, si un refresh token robado
 * se llega a usar, el legítimo deja de funcionar (señal de que algo raro pasó)
 * en vez de quedar ambos indefinidamente válidos.
 */
@Component
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${security.jwt.refresh-expiration-ms:2592000000}")
    private long refreshExpirationMs;

    @Transactional
    public String createRefreshToken(Long userId) {
        String rawToken = generateRawToken();
        RefreshToken entity = RefreshToken.builder()
                .userId(userId)
                .tokenHash(hash(rawToken))
                .expiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshExpirationMs)))
                .revoked(false)
                .build();
        refreshTokenRepository.save(entity);
        return rawToken;
    }

    /**
     * Valida el refresh token recibido, lo revoca (rotación) y devuelve la
     * entidad para que el llamante pueda emitir uno nuevo para el mismo usuario.
     */
    @Transactional
    public RefreshToken consumeAndRotate(String rawToken) {
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new InvalidRefreshTokenException("El refresh token no es válido"));

        if (existing.isRevoked()) {
            throw new InvalidRefreshTokenException("Este refresh token ya no es válido, vuelve a iniciar sesión");
        }
        if (existing.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidRefreshTokenException("El refresh token ha caducado, vuelve a iniciar sesión");
        }

        existing.setRevoked(true);
        refreshTokenRepository.save(existing);
        return existing;
    }

    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken))
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    @Transactional
    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Scheduled(fixedRate = 24 * 60 * 60 * 1000)
    @Transactional
    public void cleanupExpiredOrRevoked() {
        refreshTokenRepository.deleteByExpiresAtBeforeOrRevokedTrue(LocalDateTime.now());
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible en esta JVM", e);
        }
    }

}
