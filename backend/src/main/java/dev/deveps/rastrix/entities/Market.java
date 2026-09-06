package dev.deveps.rastrix.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "mercados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Market extends BaseEntity {

    @Column(name = "nombre", length = 150, nullable = false)
    private String name;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String description;

    @Column(name = "direccion", length = 255)
    private String address;

    @Column(name = "ciudad", length = 100)
    private String city;

    @Column(name = "provincia", length = 100)
    private String province;

    @Column(name = "codigo_postal", length = 10)
    private String postalCode;

    @Column(name = "latitud", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitud", precision = 11, scale = 8)
    private BigDecimal longitude;

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

    @Column(name = "imagen_principal", length = 255)
    private String mainImage;

    @Column(name = "organizador", length = 150)
    private String organizer;

    @Column(name = "contacto_telefono", length = 20)
    private String contactPhone;

    @Column(name = "contacto_email", length = 150)
    private String contactEmail;

    @Column(name = "sitio_web", length = 255)
    private String website;

    @Column(name = "activo")
    private boolean active;

}
