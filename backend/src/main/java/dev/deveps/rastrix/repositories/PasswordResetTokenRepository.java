package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByUserIdAndUsedFalse(Long userId);

    void deleteByUserId(Long userId);

    void deleteByExpiresAtBeforeOrUsedTrue(LocalDateTime cutoff);

}
