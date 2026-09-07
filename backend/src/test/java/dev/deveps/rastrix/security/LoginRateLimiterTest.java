package dev.deveps.rastrix.security;

import dev.deveps.rastrix.exception.TooManyRequestsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatNoException;

class LoginRateLimiterTest {

    private LoginRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new LoginRateLimiter();
        ReflectionTestUtils.setField(rateLimiter, "maxAttemptsPerEmail", 3);
        ReflectionTestUtils.setField(rateLimiter, "maxAttemptsPerIp", 100);
        ReflectionTestUtils.setField(rateLimiter, "windowMinutes", 15L);
    }

    @Test
    void allowsAttemptsUnderTheLimit() {
        assertThatNoException().isThrownBy(() -> {
            for (int i = 0; i < 3; i++) {
                rateLimiter.checkAllowed("user@example.com", "1.2.3.4");
                rateLimiter.recordFailure("user@example.com", "1.2.3.4");
            }
        });
    }

    @Test
    void blocksAfterReachingTheLimit() {
        for (int i = 0; i < 3; i++) {
            rateLimiter.checkAllowed("user@example.com", "1.2.3.4");
            rateLimiter.recordFailure("user@example.com", "1.2.3.4");
        }

        assertThatThrownBy(() -> rateLimiter.checkAllowed("user@example.com", "1.2.3.4"))
                .isInstanceOf(TooManyRequestsException.class);
    }

    @Test
    void successfulLoginResetsTheCounter() {
        rateLimiter.checkAllowed("user@example.com", "1.2.3.4");
        rateLimiter.recordFailure("user@example.com", "1.2.3.4");
        rateLimiter.recordSuccess("user@example.com", "1.2.3.4");

        // Tras el reset puede volver a fallar hasta el máximo sin ser bloqueado.
        assertThatNoException().isThrownBy(() -> {
            for (int i = 0; i < 3; i++) {
                rateLimiter.checkAllowed("user@example.com", "1.2.3.4");
                rateLimiter.recordFailure("user@example.com", "1.2.3.4");
            }
        });
        assertThatThrownBy(() -> rateLimiter.checkAllowed("user@example.com", "1.2.3.4"))
                .isInstanceOf(TooManyRequestsException.class);
    }

    @Test
    void limitIsIndependentPerEmail() {
        for (int i = 0; i < 3; i++) {
            rateLimiter.checkAllowed("a@example.com", "1.2.3.4");
            rateLimiter.recordFailure("a@example.com", "1.2.3.4");
        }
        assertThatThrownBy(() -> rateLimiter.checkAllowed("a@example.com", "1.2.3.4"))
                .isInstanceOf(TooManyRequestsException.class);

        // Otro email desde la misma IP no se ve afectado (el límite por IP es 100).
        assertThatNoException().isThrownBy(() -> rateLimiter.checkAllowed("b@example.com", "1.2.3.4"));
    }

    @Test
    void emailIsNormalizedCaseInsensitively() {
        for (int i = 0; i < 3; i++) {
            rateLimiter.checkAllowed("User@Example.com", "1.2.3.4");
            rateLimiter.recordFailure("USER@EXAMPLE.COM", "1.2.3.4");
        }

        assertThatThrownBy(() -> rateLimiter.checkAllowed("user@example.com", "9.9.9.9"))
                .isInstanceOf(TooManyRequestsException.class);
    }

}
