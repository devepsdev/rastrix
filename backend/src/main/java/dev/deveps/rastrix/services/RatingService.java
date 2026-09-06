package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.RatingRequest;
import dev.deveps.rastrix.dto.response.RatingResponse;

import java.util.List;

public interface RatingService {

    RatingResponse create(RatingRequest request);

    RatingResponse update(Long id, RatingRequest request);

    void delete(Long id);

    RatingResponse findById(Long id);

    List<RatingResponse> findByMarketId(Long marketId);

}
