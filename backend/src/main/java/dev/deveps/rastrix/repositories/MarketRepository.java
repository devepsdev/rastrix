package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.Market;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarketRepository extends JpaRepository<Market, Long> {

    Optional<Market> findByUuid(String uuid);

    List<Market> findByCity(String city);

    List<Market> findByProvince(String province);

    long countByActiveTrue();

}
