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
@Table(name = "imagenes_mercado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MarketImage extends BaseEntity {

    @Column(name = "mercado_id", nullable = false)
    private Long marketId;

    @Column(name = "url_imagen", length = 255, nullable = false)
    private String imageUrl;

    @Column(name = "orden")
    private Integer order;

}
