package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.Exhibitor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExhibitorRepository extends JpaRepository<Exhibitor, Long> {

    Optional<Exhibitor> findByUuid(String uuid);

    List<Exhibitor> findByMarketId(Long marketId);

}
