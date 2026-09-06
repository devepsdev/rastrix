package dev.deveps.rastrix.security;

import dev.deveps.rastrix.exception.TooManyRequestsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Limita los intentos de login fallidos, tanto por email (evita fuerza bruta
 * contra una cuenta concreta) como por IP (evita que un mismo origen pruebe
 * muchas cuentas distintas). En memoria: válido para un único servidor como
 * el actual; si algún día hay varias instancias detrás de un balanceador,
 * habría que mover esto a un almacén compartido (Redis).
 */
@Component
public class LoginRateLimiter {

    @Value("${security.rate-limit.login.max-attempts-per-email:5}")
    private int maxAttemptsPerEmail;

    @Value("${security.rate-limit.login.max-attempts-per-ip:20}")
    private int maxAttemptsPerIp;

    @Value("${security.rate-limit.login.window-minutes:15}")
    private long windowMinutes;

    private final Map<String, Attempt> attemptsByEmail = new ConcurrentHashMap<>();
    private final Map<String, Attempt> attemptsByIp = new ConcurrentHashMap<>();

    public void checkAllowed(String email, String ip) {
        checkAndThrow(attemptsByEmail, normalizeEmail(email), maxAttemptsPerEmail);
        checkAndThrow(attemptsByIp, ip, maxAttemptsPerIp);
    }

    public void recordFailure(String email, String ip) {
        increment(attemptsByEmail, normalizeEmail(email));
        increment(attemptsByIp, ip);
    }

    public void recordSuccess(String email, String ip) {
        attemptsByEmail.remove(normalizeEmail(email));
        attemptsByIp.remove(ip);
    }

    private void checkAndThrow(Map<String, Attempt> store, String key, int max) {
        Attempt attempt = store.get(key);
        if (attempt == null) {
            return;
        }
        if (attempt.isExpired(windowDuration())) {
            store.remove(key, attempt);
            return;
        }
        if (attempt.count.get() >= max) {
            long retryAfterSeconds = attempt.secondsUntilExpiry(windowDuration());
            throw new TooManyRequestsException(
                    "Demasiados intentos fallidos. Vuelve a intentarlo en " + formatDuration(retryAfterSeconds) + ".",
                    retryAfterSeconds);
        }
    }

    private void increment(Map<String, Attempt> store, String key) {
        store.compute(key, (k, existing) -> {
            if (existing == null || existing.isExpired(windowDuration())) {
                return new Attempt();
            }
            existing.count.incrementAndGet();
            return existing;
        });
    }

    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void cleanup() {
        purgeExpired(attemptsByEmail);
        purgeExpired(attemptsByIp);
    }

    private void purgeExpired(Map<String, Attempt> store) {
        Duration window = windowDuration();
        store.entrySet().removeIf(entry -> entry.getValue().isExpired(window));
    }

    private Duration windowDuration() {
        return Duration.ofMinutes(windowMinutes);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String formatDuration(long totalSeconds) {
        long minutes = totalSeconds / 60;
        long seconds = totalSeconds % 60;
        if (minutes > 0) {
            return minutes + " min" + (seconds > 0 ? " " + seconds + " s" : "");
        }
        return seconds + " s";
    }

    private static final class Attempt {
        final AtomicInteger count = new AtomicInteger(1);
        final Instant windowStart = Instant.now();

        boolean isExpired(Duration window) {
            return Instant.now().isAfter(windowStart.plus(window));
        }

        long secondsUntilExpiry(Duration window) {
            long secondsLeft = Duration.between(Instant.now(), windowStart.plus(window)).getSeconds();
            return Math.max(secondsLeft, 1);
        }
    }

}
