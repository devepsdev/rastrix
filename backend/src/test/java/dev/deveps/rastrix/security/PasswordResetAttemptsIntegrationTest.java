package dev.deveps.rastrix.security;

import dev.deveps.rastrix.dto.request.ResetPasswordRequest;
import dev.deveps.rastrix.entities.PasswordResetToken;
import dev.deveps.rastrix.entities.Role;
import dev.deveps.rastrix.entities.User;
import dev.deveps.rastrix.exception.InvalidDataException;
import dev.deveps.rastrix.exception.TooManyRequestsException;
import dev.deveps.rastrix.repositories.PasswordResetTokenRepository;
import dev.deveps.rastrix.repositories.UserRepository;
import dev.deveps.rastrix.services.AuthService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Comprueba el contador de intentos con transacciones reales, a través de
 * AuthService como en producción. Con mocks no se ve: el fallo era que la
 * excepción por código incorrecto deshacía también el incremento, así que el
 * bloqueo tras cinco fallos nunca llegaba a activarse.
 *
 * Usa la base de datos configurada (la local de desarrollo), igual que
 * RastrixApplicationTests, y deja todo como estaba al terminar.
 */
@SpringBootTest
class PasswordResetAttemptsIntegrationTest {

    private static final String EMAIL = "reset-attempts-test@example.test";

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginRateLimiter loginRateLimiter;

    private Long userId;

    @BeforeEach
    void setUp() {
        userRepository.findByEmail(EMAIL).ifPresent(userRepository::delete);
        userId = userRepository.save(User.builder()
                .name("Prueba de intentos")
                .email(EMAIL)
                .password("{noop}sin-uso")
                .active(true)
                .role(Role.USER)
                .build()).getId();
        loginRateLimiter.recordSuccess("reset-verify:" + EMAIL, "reset-verify:test");
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteById(userId);
        loginRateLimiter.recordSuccess("reset-verify:" + EMAIL, "reset-verify:test");
    }

    @Test
    void aWrongCodeIsCountedEvenThoughTheRequestFails() {
        String code = passwordResetService.createResetCode(userId);

        assertThatThrownBy(() -> resetWith(wrongCode(code)))
                .isInstanceOf(InvalidDataException.class);

        assertThat(storedToken().getAttempts()).isEqualTo(1);
    }

    @Test
    void theCodeStopsWorkingAfterFiveWrongAttempts() {
        String code = passwordResetService.createResetCode(userId);
        for (int i = 0; i < 5; i++) {
            assertThatThrownBy(() -> passwordResetService.verifyCode(userId, wrongCode(code)))
                    .isInstanceOf(InvalidDataException.class);
        }

        // Ni siquiera el código correcto sirve ya.
        assertThatThrownBy(() -> passwordResetService.verifyCode(userId, code))
                .isInstanceOf(InvalidDataException.class);
    }

    @Test
    void chainingNewCodesIsStoppedByTheRateLimit() {
        for (int i = 0; i < 5; i++) {
            String code = passwordResetService.createResetCode(userId);
            assertThatThrownBy(() -> resetWith(wrongCode(code))).isInstanceOf(InvalidDataException.class);
        }

        String fresh = passwordResetService.createResetCode(userId);
        assertThatThrownBy(() -> resetWith(fresh)).isInstanceOf(TooManyRequestsException.class);
    }

    private void resetWith(String code) {
        authService.resetPassword(new ResetPasswordRequest(EMAIL, code, "nueva-clave-segura"), "test");
    }

    private PasswordResetToken storedToken() {
        return passwordResetTokenRepository.findByUserIdAndUsedFalse(userId).orElseThrow();
    }

    private static String wrongCode(String code) {
        return code.equals("000000") ? "000001" : "000000";
    }

}
