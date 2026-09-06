package dev.deveps.rastrix.repositories;

import dev.deveps.rastrix.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByUuid(String uuid);

    Optional<Category> findByName(String name);

    boolean existsByName(String name);

}
