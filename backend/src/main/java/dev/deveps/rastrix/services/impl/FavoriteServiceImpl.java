package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.FavoriteRequest;
import dev.deveps.rastrix.dto.response.FavoriteResponse;
import dev.deveps.rastrix.entities.Favorite;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.FavoriteRepository;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.repositories.UserRepository;
import dev.deveps.rastrix.services.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final MarketRepository marketRepository;

    @Override
    public FavoriteResponse create(FavoriteRequest request) {
        if (!userRepository.existsById(request.userId())) {
            throw new ResourceNotFoundException("No existe ningún usuario con id: " + request.userId());
        }
        if (!marketRepository.existsById(request.marketId())) {
            throw new ResourceNotFoundException("No existe ningún mercado con id: " + request.marketId());
        }
        if (favoriteRepository.existsByUserIdAndMarketId(request.userId(), request.marketId())) {
            throw new DuplicateResourceException("Ese mercado ya está en los favoritos del usuario");
        }
        Favorite favorite = Favorite.builder()
                .userId(request.userId())
                .marketId(request.marketId())
                .build();
        return toResponse(favoriteRepository.save(favorite));
    }

    @Override
    public void delete(Long id) {
        favoriteRepository.delete(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public FavoriteResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FavoriteResponse> findByUserId(Long userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    private Favorite findEntityById(Long id) {
        return favoriteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ningún favorito con id: " + id));
    }

    private FavoriteResponse toResponse(Favorite favorite) {
        return new FavoriteResponse(
                favorite.getId(),
                favorite.getUuid(),
                favorite.getUserId(),
                favorite.getMarketId(),
                favorite.getFechaCreacion(),
                favorite.getFechaActualizacion()
        );
    }

}
