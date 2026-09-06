package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.MarketImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarketImageRepository extends JpaRepository<MarketImage, Long> {

    Optional<MarketImage> findByUuid(String uuid);

    List<MarketImage> findByMarketIdOrderByOrderAsc(Long marketId);

}
