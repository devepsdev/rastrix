package dev.deveps.rastrix.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "valoraciones", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "mercado_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Rating extends BaseEntity {

    @Column(name = "usuario_id", nullable = false)
    private Long userId;

    @Column(name = "mercado_id", nullable = false)
    private Long marketId;

    @Column(name = "puntuacion", nullable = false)
    private Integer score;

    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comment;

}
