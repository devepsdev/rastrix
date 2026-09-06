package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.CategoryRequest;
import dev.deveps.rastrix.dto.response.CategoryResponse;
import dev.deveps.rastrix.entities.Category;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.CategoryRepository;
import dev.deveps.rastrix.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Ya existe una categoría con el nombre: " + request.name());
        }
        Category category = Category.builder()
                .name(request.name())
                .description(request.description())
                .icon(request.icon())
                .build();
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findEntityById(id);
        if (!category.getName().equalsIgnoreCase(request.name()) && categoryRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Ya existe una categoría con el nombre: " + request.name());
        }
        category.setName(request.name());
        category.setDescription(request.description());
        category.setIcon(request.icon());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public void delete(Long id) {
        categoryRepository.delete(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse findByUuid(String uuid) {
        return categoryRepository.findByUuid(uuid)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna categoría con uuid: " + uuid));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private Category findEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna categoría con id: " + id));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getUuid(),
                category.getName(),
                category.getDescription(),
                category.getIcon(),
                category.getFechaCreacion(),
                category.getFechaActualizacion()
        );
    }

}
