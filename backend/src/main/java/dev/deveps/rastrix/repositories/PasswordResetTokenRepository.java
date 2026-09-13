package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByUserIdAndUsedFalse(Long userId);

    void deleteByUserId(Long userId);

    /**
     * Gasta un intento de forma atómica si quedan. Devuelve 0 cuando ya se han
     * agotado. Hacerlo en una sola sentencia evita que varias peticiones en
     * paralelo lean el mismo contador y prueben más códigos de los permitidos.
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("UPDATE PasswordResetToken t SET t.attempts = t.attempts + 1 WHERE t.id = :id AND t.attempts < :maxAttempts")
    int consumeAttempt(@Param("id") Long id, @Param("maxAttempts") int maxAttempts);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.id = :id")
    void markUsed(@Param("id") Long id);

    void deleteByExpiresAtBeforeOrUsedTrue(LocalDateTime cutoff);

}
