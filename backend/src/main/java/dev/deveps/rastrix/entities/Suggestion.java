package dev.deveps.rastrix.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "sugerencias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Suggestion extends BaseEntity {

    @Column(name = "usuario_id", nullable = false)
    private Long userId;

    @Column(name = "nombre", length = 150, nullable = false)
    private String name;

    @Column(name = "ciudad", length = 100, nullable = false)
    private String city;

    @Column(name = "provincia", length = 100)
    private String province;

    @Column(name = "direccion", length = 255)
    private String address;

    @Column(name = "periodicidad", length = 20)
    private String frequency;

    @Column(name = "dia_semana", length = 20)
    private String dayOfWeek;

    @Column(name = "fecha_inicio")
    private LocalDate startDate;

    @Column(name = "fecha_fin")
    private LocalDate endDate;

    @Column(name = "hora_inicio")
    private LocalTime startTime;

    @Column(name = "hora_fin")
    private LocalTime endTime;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String description;

    @Column(name = "contacto", length = 255)
    private String contact;

    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20, nullable = false)
    private SuggestionStatus status;

    @Column(name = "mercado_id")
    private Long marketId;

    @Column(name = "motivo_rechazo", length = 255)
    private String rejectionReason;

}
