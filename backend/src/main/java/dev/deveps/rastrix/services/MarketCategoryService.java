package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.MarketCategoryRequest;
import dev.deveps.rastrix.dto.response.MarketCategoryResponse;

import java.util.List;

public interface MarketCategoryService {

    MarketCategoryResponse create(MarketCategoryRequest request);

    void delete(Long id);

    MarketCategoryResponse findById(Long id);

    List<MarketCategoryResponse> findByMarketId(Long marketId);

    List<MarketCategoryResponse> findByCategoryId(Long categoryId);

}
