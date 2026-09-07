package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.ExhibitorRequest;
import dev.deveps.rastrix.dto.response.ExhibitorResponse;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.entities.Exhibitor;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.ExhibitorRepository;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.services.ExhibitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExhibitorServiceImpl implements ExhibitorService {

    private final ExhibitorRepository exhibitorRepository;
    private final MarketRepository marketRepository;

    @Override
    public ExhibitorResponse create(ExhibitorRequest request) {
        validateMarketExists(request.marketId());
        Exhibitor exhibitor = Exhibitor.builder()
                .marketId(request.marketId())
                .name(request.name())
                .specialty(request.specialty())
                .description(request.description())
                .contact(request.contact())
                .build();
        return toResponse(exhibitorRepository.save(exhibitor));
    }

    @Override
    public ExhibitorResponse update(Long id, ExhibitorRequest request) {
        Exhibitor exhibitor = findEntityById(id);
        validateMarketExists(request.marketId());
        exhibitor.setMarketId(request.marketId());
        exhibitor.setName(request.name());
        exhibitor.setSpecialty(request.specialty());
        exhibitor.setDescription(request.description());
        exhibitor.setContact(request.contact());
        return toResponse(exhibitorRepository.save(exhibitor));
    }

    @Override
    public void delete(Long id) {
        exhibitorRepository.delete(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public ExhibitorResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExhibitorResponse> findByMarketId(Long marketId) {
        return exhibitorRepository.findByMarketId(marketId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExhibitorResponse> findAll(Pageable pageable) {
        return PageResponse.from(exhibitorRepository.findAll(pageable).map(this::toResponse));
    }

    private void validateMarketExists(Long marketId) {
        if (marketId != null && !marketRepository.existsById(marketId)) {
            throw new ResourceNotFoundException("No existe ningún mercado con id: " + marketId);
        }
    }

    private Exhibitor findEntityById(Long id) {
        return exhibitorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ningún expositor con id: " + id));
    }

    private ExhibitorResponse toResponse(Exhibitor exhibitor) {
        return new ExhibitorResponse(
                exhibitor.getId(),
                exhibitor.getUuid(),
                exhibitor.getMarketId(),
                exhibitor.getName(),
                exhibitor.getSpecialty(),
                exhibitor.getDescription(),
                exhibitor.getContact(),
                exhibitor.getFechaCreacion(),
                exhibitor.getFechaActualizacion()
        );
    }

}
