package dev.deveps.rastrix.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PasswordResetToken extends BaseEntity {

    @Column(name = "usuario_id", nullable = false)
    private Long userId;

    @Column(name = "code_hash", nullable = false, length = 64)
    private String codeHash;

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "usado", nullable = false)
    private boolean used;

    @Column(name = "intentos", nullable = false)
    private int attempts;

}
