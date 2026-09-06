package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.MarketImageRequest;
import dev.deveps.rastrix.dto.response.MarketImageResponse;
import dev.deveps.rastrix.entities.MarketImage;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.MarketImageRepository;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.services.MarketImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MarketImageServiceImpl implements MarketImageService {

    private final MarketImageRepository marketImageRepository;
    private final MarketRepository marketRepository;

    @Override
    public MarketImageResponse create(MarketImageRequest request) {
        if (!marketRepository.existsById(request.marketId())) {
            throw new ResourceNotFoundException("No existe ningún mercado con id: " + request.marketId());
        }
        MarketImage marketImage = MarketImage.builder()
                .marketId(request.marketId())
                .imageUrl(request.imageUrl())
                .order(request.order())
                .build();
        return toResponse(marketImageRepository.save(marketImage));
    }

    @Override
    public MarketImageResponse update(Long id, MarketImageRequest request) {
        MarketImage marketImage = findEntityById(id);
        if (!marketRepository.existsById(request.marketId())) {
            throw new ResourceNotFoundException("No existe ningún mercado con id: " + request.marketId());
        }
        marketImage.setMarketId(request.marketId());
        marketImage.setImageUrl(request.imageUrl());
        marketImage.setOrder(request.order());
        return toResponse(marketImageRepository.save(marketImage));
    }

    @Override
    public void delete(Long id) {
        marketImageRepository.delete(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public MarketImageResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarketImageResponse> findByMarketId(Long marketId) {
        return marketImageRepository.findByMarketIdOrderByOrderAsc(marketId).stream()
                .map(this::toResponse)
                .toList();
    }

    private MarketImage findEntityById(Long id) {
        return marketImageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna imagen con id: " + id));
    }

    private MarketImageResponse toResponse(MarketImage marketImage) {
        return new MarketImageResponse(
                marketImage.getId(),
                marketImage.getUuid(),
                marketImage.getMarketId(),
                marketImage.getImageUrl(),
                marketImage.getOrder(),
                marketImage.getFechaCreacion(),
                marketImage.getFechaActualizacion()
        );
    }

}
