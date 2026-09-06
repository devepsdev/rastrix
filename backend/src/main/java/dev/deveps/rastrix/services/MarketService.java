package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.MarketRequest;
import dev.deveps.rastrix.dto.response.MarketResponse;

import java.util.List;

public interface MarketService {

    MarketResponse create(MarketRequest request);

    MarketResponse update(Long id, MarketRequest request);

    void delete(Long id);

    MarketResponse findById(Long id);

    MarketResponse findByUuid(String uuid);

    List<MarketResponse> findAll();

    List<MarketResponse> findByCity(String city);

    List<MarketResponse> findByProvince(String province);

}
