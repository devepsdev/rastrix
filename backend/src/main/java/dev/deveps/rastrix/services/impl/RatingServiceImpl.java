package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.RatingRequest;
import dev.deveps.rastrix.dto.response.RatingResponse;
import dev.deveps.rastrix.entities.Rating;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.repositories.RatingRepository;
import dev.deveps.rastrix.repositories.UserRepository;
import dev.deveps.rastrix.services.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final MarketRepository marketRepository;

    @Override
    public RatingResponse create(RatingRequest request) {
        if (!userRepository.existsById(request.userId())) {
            throw new ResourceNotFoundException("No existe ningún usuario con id: " + request.userId());
        }
        if (!marketRepository.existsById(request.marketId())) {
            throw new ResourceNotFoundException("No existe ningún mercado con id: " + request.marketId());
        }
        if (ratingRepository.existsByUserIdAndMarketId(request.userId(), request.marketId())) {
            throw new DuplicateResourceException("El usuario ya ha valorado ese mercado");
        }
        Rating rating = Rating.builder()
                .userId(request.userId())
                .marketId(request.marketId())
                .score(request.score())
                .comment(request.comment())
                .build();
        return toResponse(ratingRepository.save(rating));
    }

    @Override
    public RatingResponse update(Long id, RatingRequest request) {
        Rating rating = findEntityById(id);
        rating.setScore(request.score());
        rating.setComment(request.comment());
        return toResponse(ratingRepository.save(rating));
    }

    @Override
    public void delete(Long id) {
        ratingRepository.delete(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public RatingResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RatingResponse> findByMarketId(Long marketId) {
        return ratingRepository.findByMarketId(marketId).stream()
                .map(this::toResponse)
                .toList();
    }

    private Rating findEntityById(Long id) {
        return ratingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna valoración con id: " + id));
    }

    private RatingResponse toResponse(Rating rating) {
        return new RatingResponse(
                rating.getId(),
                rating.getUuid(),
                rating.getUserId(),
                rating.getMarketId(),
                rating.getScore(),
                rating.getComment(),
                rating.getFechaCreacion(),
                rating.getFechaActualizacion()
        );
    }

}
