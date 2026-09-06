package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUuid(String uuid);

    List<Favorite> findByUserId(Long userId);

    Optional<Favorite> findByUserIdAndMarketId(Long userId, Long marketId);

    boolean existsByUserIdAndMarketId(Long userId, Long marketId);

}
