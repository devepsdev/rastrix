package dev.deveps.rastrix.services;

import dev.deveps.rastrix.dto.request.FavoriteRequest;
import dev.deveps.rastrix.dto.response.FavoriteResponse;

import java.util.List;

public interface FavoriteService {

    FavoriteResponse create(FavoriteRequest request);

    void delete(Long id);

    FavoriteResponse findById(Long id);

    List<FavoriteResponse> findByUserId(Long userId);

}
