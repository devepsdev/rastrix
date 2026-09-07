package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.Market;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarketRepository extends JpaRepository<Market, Long> {

    Optional<Market> findByUuid(String uuid);

    Page<Market> findByCity(String city, Pageable pageable);

    Page<Market> findByProvince(String province, Pageable pageable);

    long countByActiveTrue();

}
