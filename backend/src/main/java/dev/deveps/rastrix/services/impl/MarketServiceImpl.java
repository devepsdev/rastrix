package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.MarketRequest;
import dev.deveps.rastrix.dto.response.MarketResponse;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.entities.Market;
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
        Market market = Market.builder()
                .name(request.name())
                .description(request.description())
                .address(request.address())
                .city(request.city())
                .province(request.province())
                .postalCode(request.postalCode())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .frequency(request.frequency())
                .dayOfWeek(request.dayOfWeek())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .mainImage(request.mainImage())
                .organizer(request.organizer())
                .contactPhone(request.contactPhone())
                .contactEmail(request.contactEmail())
                .website(request.website())
                .active(request.active())
                .build();
        return toResponse(marketRepository.save(market));
    }

    @Override
    public MarketResponse update(Long id, MarketRequest request) {
        Market market = findEntityById(id);
        market.setName(request.name());
        market.setDescription(request.description());
        market.setAddress(request.address());
        market.setCity(request.city());
        market.setProvince(request.province());
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
        market.setActive(request.active());
        return toResponse(marketRepository.save(market));
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
