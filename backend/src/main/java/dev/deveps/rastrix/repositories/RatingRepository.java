package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByUuid(String uuid);

    List<Rating> findByMarketId(Long marketId);

    Optional<Rating> findByUserIdAndMarketId(Long userId, Long marketId);

    boolean existsByUserIdAndMarketId(Long userId, Long marketId);

}
