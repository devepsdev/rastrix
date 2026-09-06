package dev.deveps.rastrix.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "notificaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Notification extends BaseEntity {

    @Column(name = "usuario_id", nullable = false)
    private Long userId;

    @Column(name = "mercado_id")
    private Long marketId;

    @Column(name = "titulo", length = 150, nullable = false)
    private String title;

    @Column(name = "mensaje", columnDefinition = "TEXT")
    private String message;

    @Column(name = "leida")
    private boolean read;

}
