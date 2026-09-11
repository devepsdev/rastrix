package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.MarketRequest;
import dev.deveps.rastrix.dto.response.MarketImportResponse;
import dev.deveps.rastrix.dto.response.MarketResponse;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.entities.Market;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.services.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MarketServiceImpl implements MarketService {

    private final MarketRepository marketRepository;

    @Override
    public MarketResponse create(MarketRequest request) {
        requireNoDuplicate(request, null);
        Market market = new Market();
        applyRequest(market, request, true);
        return toResponse(marketRepository.save(market));
    }

    @Override
    public MarketResponse update(Long id, MarketRequest request) {
        Market market = findEntityById(id);
        requireNoDuplicate(request, id);
        applyRequest(market, request, true);
        return toResponse(marketRepository.save(market));
    }

    @Override
    public MarketImportResponse upsert(MarketRequest request) {
        Market existing = marketRepository
                .findByNameAndCity(normalize(request.name()), normalize(request.city()))
                .orElse(null);

        if (existing == null) {
            Market market = new Market();
            applyRequest(market, request, true);
            return new MarketImportResponse(toResponse(marketRepository.save(market)), true);
        }

        // El estado de publicación no se toca: si alguien ocultó el mercado a
        // mano, una importación posterior no debe devolverlo a la app.
        applyRequest(existing, request, false);
        return new MarketImportResponse(toResponse(marketRepository.save(existing)), false);
    }

    @Override
    public void delete(Long id) {
        marketRepository.delete(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public MarketResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public MarketResponse findByUuid(String uuid) {
        return marketRepository.findByUuid(uuid)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ningún mercado con uuid: " + uuid));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketResponse> findAll(Pageable pageable) {
        return toPageResponse(marketRepository.findAll(pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketResponse> findByCity(String city, Pageable pageable) {
        return toPageResponse(marketRepository.findByCity(city, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketResponse> findByProvince(String province, Pageable pageable) {
        return toPageResponse(marketRepository.findByProvince(province, pageable));
    }

    private Market findEntityById(Long id) {
        return marketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ningún mercado con id: " + id));
    }

    /**
     * Vuelca la petición sobre la entidad. {@code applyActive} permite dejar
     * fuera el estado de publicación en las importaciones.
     */
    private void applyRequest(Market market, MarketRequest request, boolean applyActive) {
        market.setName(normalize(request.name()));
        market.setDescription(request.description());
        market.setAddress(request.address());
        market.setCity(normalize(request.city()));
        market.setProvince(normalize(request.province()));
        market.setPostalCode(request.postalCode());
        market.setLatitude(request.latitude());
        market.setLongitude(request.longitude());
        market.setFrequency(request.frequency());
        market.setDayOfWeek(request.dayOfWeek());
        market.setStartDate(request.startDate());
        market.setEndDate(request.endDate());
        market.setStartTime(request.startTime());
        market.setEndTime(request.endTime());
        market.setMainImage(request.mainImage());
        market.setOrganizer(request.organizer());
        market.setContactPhone(request.contactPhone());
        market.setContactEmail(request.contactEmail());
        market.setWebsite(request.website());
        if (applyActive) {
            market.setActive(request.active());
        }
    }

    private void requireNoDuplicate(MarketRequest request, Long idToExclude) {
        String name = normalize(request.name());
        String city = normalize(request.city());

        marketRepository.findByNameAndCity(name, city).ifPresent(existing -> {
            if (!existing.getId().equals(idToExclude)) {
                throw new DuplicateResourceException(
                        "Ya existe un mercado llamado \"" + name + "\""
                                + (city != null ? " en " + city : "")
                                + ". Edítalo en lugar de crear otro.");
            }
        });
    }

    /**
     * Recorta y colapsa espacios: "El  Rastro " y "El Rastro" son el mismo
     * mercado y deben chocar entre sí al comprobar duplicados.
     */
    private static String normalize(String value) {
        if (value == null) {
            return null;
        }
        String collapsed = value.trim().replaceAll("\\s+", " ");
        return collapsed.isEmpty() ? null : collapsed;
    }

    private MarketResponse toResponse(Market market) {
        return new MarketResponse(
                market.getId(),
                market.getUuid(),
                market.getName(),
                market.getDescription(),
                market.getAddress(),
                market.getCity(),
                market.getProvince(),
                market.getPostalCode(),
                market.getLatitude(),
                market.getLongitude(),
                market.getFrequency(),
                market.getDayOfWeek(),
                market.getStartDate(),
                market.getEndDate(),
                market.getStartTime(),
                market.getEndTime(),
                market.getMainImage(),
                market.getOrganizer(),
                market.getContactPhone(),
                market.getContactEmail(),
                market.getWebsite(),
                market.isActive(),
                market.getFechaCreacion(),
                market.getFechaActualizacion()
        );
    }

    private PageResponse<MarketResponse> toPageResponse(Page<Market> page) {
        return PageResponse.from(page.map(this::toResponse));
    }

}
