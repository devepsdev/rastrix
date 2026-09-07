package dev.deveps.rastrix.security;

import dev.deveps.rastrix.entities.PasswordResetToken;
import dev.deveps.rastrix.exception.InvalidDataException;
import dev.deveps.rastrix.repositories.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * Genera y valida los códigos de 6 dígitos para recuperar la contraseña.
 *
 * Un código de 6 dígitos tiene mucha menos entropía que un refresh token
 * (1 millón de combinaciones frente a 2^256), así que aquí la seguridad no
 * viene del propio código sino de limitarlo por todos los lados: caduca
 * pronto (15 min por defecto), solo hay un código activo por usuario a la
 * vez (pedir uno nuevo invalida el anterior) y se bloquea tras unos pocos
 * intentos fallidos de verificación.
 */
@Component
@RequiredArgsConstructor
public class PasswordResetService {

    private static final int MAX_ATTEMPTS = 5;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${security.password-reset.expiration-minutes:15}")
    private long expirationMinutes;

    @Transactional
    public String createResetCode(Long userId) {
        // Solo puede haber un código activo por usuario: pedir uno nuevo
        // invalida cualquiera anterior sin usar.
        passwordResetTokenRepository.deleteByUserId(userId);

        String rawCode = generateCode();
        PasswordResetToken entity = PasswordResetToken.builder()
                .userId(userId)
                .codeHash(HashUtils.sha256(rawCode))
                .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                .used(false)
                .attempts(0)
                .build();
        passwordResetTokenRepository.save(entity);
        return rawCode;
    }

    /**
     * Valida el código para el usuario indicado y lo marca como usado.
     * Deliberadamente lanza el mismo mensaje genérico tanto si el código no
     * existe, ha caducado, se han agotado los intentos o simplemente no
     * coincide, para no dar pistas de cuál fue el motivo exacto.
     */
    @Transactional
    public void verifyCode(Long userId, String rawCode) {
        PasswordResetToken token = passwordResetTokenRepository.findByUserIdAndUsedFalse(userId)
                .orElseThrow(this::invalidCode);

        if (token.getExpiresAt().isBefore(LocalDateTime.now()) || token.getAttempts() >= MAX_ATTEMPTS) {
            passwordResetTokenRepository.delete(token);
            throw invalidCode();
        }

        if (!HashUtils.sha256(rawCode).equals(token.getCodeHash())) {
            token.setAttempts(token.getAttempts() + 1);
            passwordResetTokenRepository.save(token);
            throw invalidCode();
        }

        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    @Scheduled(fixedRate = 24 * 60 * 60 * 1000)
    @Transactional
    public void cleanupExpiredOrUsed() {
        passwordResetTokenRepository.deleteByExpiresAtBeforeOrUsedTrue(LocalDateTime.now());
    }

    private String generateCode() {
        int code = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", code);
    }

    private InvalidDataException invalidCode() {
        return new InvalidDataException("El código no es válido o ha caducado");
    }

}
