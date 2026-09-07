package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.MarketRequest;
import dev.deveps.rastrix.dto.response.MarketResponse;
import dev.deveps.rastrix.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface MarketService {

    MarketResponse create(MarketRequest request);

    MarketResponse update(Long id, MarketRequest request);

    void delete(Long id);

    MarketResponse findById(Long id);

    MarketResponse findByUuid(String uuid);

    PageResponse<MarketResponse> findAll(Pageable pageable);

    PageResponse<MarketResponse> findByCity(String city, Pageable pageable);

    PageResponse<MarketResponse> findByProvince(String province, Pageable pageable);

}
