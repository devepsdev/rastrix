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
@Table(name = "expositores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Exhibitor extends BaseEntity {

    @Column(name = "mercado_id")
    private Long marketId;

    @Column(name = "nombre", length = 150, nullable = false)
    private String name;

    @Column(name = "especialidad", length = 150)
    private String specialty;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String description;

    @Column(name = "contacto", length = 150)
    private String contact;

}
