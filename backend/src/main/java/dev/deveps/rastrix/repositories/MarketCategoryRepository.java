package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.MarketCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarketCategoryRepository extends JpaRepository<MarketCategory, Long> {

    Optional<MarketCategory> findByUuid(String uuid);

    List<MarketCategory> findByMarketId(Long marketId);

    List<MarketCategory> findByCategoryId(Long categoryId);

    Optional<MarketCategory> findByMarketIdAndCategoryId(Long marketId, Long categoryId);

    boolean existsByMarketIdAndCategoryId(Long marketId, Long categoryId);

}
