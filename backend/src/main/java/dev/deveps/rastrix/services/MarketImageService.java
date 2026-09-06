package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.MarketImageRequest;
import dev.deveps.rastrix.dto.response.MarketImageResponse;

import java.util.List;

public interface MarketImageService {

    MarketImageResponse create(MarketImageRequest request);

    MarketImageResponse update(Long id, MarketImageRequest request);

    void delete(Long id);

    MarketImageResponse findById(Long id);

    List<MarketImageResponse> findByMarketId(Long marketId);

}
