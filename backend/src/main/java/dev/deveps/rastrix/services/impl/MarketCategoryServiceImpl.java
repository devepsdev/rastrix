package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.MarketCategoryRequest;
import dev.deveps.rastrix.dto.response.MarketCategoryResponse;
import dev.deveps.rastrix.entities.MarketCategory;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.CategoryRepository;
import dev.deveps.rastrix.repositories.MarketCategoryRepository;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.services.MarketCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MarketCategoryServiceImpl implements MarketCategoryService {

    private final MarketCategoryRepository marketCategoryRepository;
    private final MarketRepository marketRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public MarketCategoryResponse create(MarketCategoryRequest request) {
        if (!marketRepository.existsById(request.marketId())) {
            throw new ResourceNotFoundException("No existe ningún mercado con id: " + request.marketId());
        }
        if (!categoryRepository.existsById(request.categoryId())) {
            throw new ResourceNotFoundException("No existe ninguna categoría con id: " + request.categoryId());
        }
        if (marketCategoryRepository.existsByMarketIdAndCategoryId(request.marketId(), request.categoryId())) {
            throw new DuplicateResourceException("El mercado ya tiene asignada esa categoría");
        }
        MarketCategory marketCategory = MarketCategory.builder()
                .marketId(request.marketId())
                .categoryId(request.categoryId())
                .build();
        return toResponse(marketCategoryRepository.save(marketCategory));
    }

    @Override
    public void delete(Long id) {
        marketCategoryRepository.delete(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public MarketCategoryResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarketCategoryResponse> findByMarketId(Long marketId) {
        return marketCategoryRepository.findByMarketId(marketId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarketCategoryResponse> findByCategoryId(Long categoryId) {
        return marketCategoryRepository.findByCategoryId(categoryId).stream()
                .map(this::toResponse)
                .toList();
    }

    private MarketCategory findEntityById(Long id) {
        return marketCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna relación mercado-categoría con id: " + id));
    }

    private MarketCategoryResponse toResponse(MarketCategory marketCategory) {
        return new MarketCategoryResponse(
                marketCategory.getId(),
                marketCategory.getUuid(),
                marketCategory.getMarketId(),
                marketCategory.getCategoryId(),
                marketCategory.getFechaCreacion()
        );
    }

}
