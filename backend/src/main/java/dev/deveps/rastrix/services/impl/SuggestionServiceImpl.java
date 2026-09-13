package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.SuggestionRequest;
import dev.deveps.rastrix.dto.response.PageResponse;
import dev.deveps.rastrix.dto.response.SuggestionResponse;
import dev.deveps.rastrix.entities.Role;
import dev.deveps.rastrix.entities.Suggestion;
import dev.deveps.rastrix.entities.SuggestionOrigin;
import dev.deveps.rastrix.entities.SuggestionStatus;
import dev.deveps.rastrix.entities.User;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.exception.InvalidDataException;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.repositories.SuggestionRepository;
import dev.deveps.rastrix.repositories.UserRepository;
import dev.deveps.rastrix.services.SuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SuggestionServiceImpl implements SuggestionService {

    /**
     * Tope de sugerencias sin revisar por usuario: frena el spam sin molestar a
     * quien aporta de buena fe, que rara vez tendrá tantas esperando a la vez.
     */
    static final int MAX_PENDING_PER_USER = 10;

    /**
     * Tope de seguridad para el scraper: es alto porque una pasada puede traer
     * muchos mercados, pero existe para que un fallo del bot no inunde la bandeja.
     */
    static final int MAX_PENDING_FOR_SCRAPER = 300;

    private final SuggestionRepository suggestionRepository;
    private final UserRepository userRepository;
    private final MarketRepository marketRepository;

    @Override
    public SuggestionResponse create(Long userId, Role role, SuggestionRequest request) {
        boolean fromScraper = role == Role.SCRAPER;
        int cap = fromScraper ? MAX_PENDING_FOR_SCRAPER : MAX_PENDING_PER_USER;
        if (suggestionRepository.countByUserIdAndStatus(userId, SuggestionStatus.PENDIENTE) >= cap) {
            throw new InvalidDataException(fromScraper
                    ? "El scraper ya tiene " + cap + " sugerencias pendientes. Revísalas antes de la próxima pasada."
                    : "Ya tienes " + cap + " sugerencias pendientes de revisar. "
                            + "Espera a que las revisemos antes de enviar más.");
        }

        String name = normalize(request.name());
        String city = normalize(request.city());
        if (fromScraper) {
            requireUnknownToScraper(name, city);
        }

        Suggestion suggestion = Suggestion.builder()
                .userId(userId)
                .origin(fromScraper ? SuggestionOrigin.SCRAPER : SuggestionOrigin.USUARIO)
                // Un usuario no puede hacer pasar su sugerencia por automática poniendo una URL.
                .sourceUrl(fromScraper ? normalize(request.sourceUrl()) : null)
                .name(name)
                .city(city)
                .province(request.province())
                .address(request.address())
                .frequency(request.frequency())
                .dayOfWeek(request.dayOfWeek())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .description(request.description())
                .contact(request.contact())
                .comment(request.comment())
                .status(SuggestionStatus.PENDIENTE)
                .build();
        return toResponse(suggestionRepository.save(suggestion));
    }

    /**
     * El scraper vuelve a leer las mismas páginas cada semana: solo debe proponer
     * lo que no está ya en el catálogo ni se le ha propuesto antes (aunque se
     * rechazara). Para un usuario no se aplica, porque volver a sugerir algo
     * que ya existe no rompe nada y puede traer datos nuevos.
     */
    private void requireUnknownToScraper(String name, String city) {
        if (marketRepository.findByNameAndCity(name, city).isPresent()) {
            throw new DuplicateResourceException("Ese mercado ya está en el catálogo: " + name + " (" + city + ")");
        }
        if (suggestionRepository.existsByOriginAndNameAndCity(SuggestionOrigin.SCRAPER, name, city)) {
            throw new DuplicateResourceException("El scraper ya sugirió ese mercado: " + name + " (" + city + ")");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuggestionResponse> findByUser(Long userId) {
        return suggestionRepository.findByUserIdOrderByFechaCreacionDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SuggestionResponse> findByStatus(SuggestionStatus status, Pageable pageable) {
        var page = status == null
                ? suggestionRepository.findAll(pageable)
                : suggestionRepository.findByStatus(status, pageable);
        return PageResponse.from(page.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public SuggestionResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    public SuggestionResponse approve(Long id, Long marketId) {
        Suggestion suggestion = findPendingById(id);
        if (!marketRepository.existsById(marketId)) {
            throw new ResourceNotFoundException("No existe ningún mercado con id: " + marketId);
        }
        suggestion.setStatus(SuggestionStatus.APROBADA);
        suggestion.setMarketId(marketId);
        suggestion.setRejectionReason(null);
        return toResponse(suggestionRepository.save(suggestion));
    }

    @Override
    public SuggestionResponse reject(Long id, String reason) {
        Suggestion suggestion = findPendingById(id);
        suggestion.setStatus(SuggestionStatus.RECHAZADA);
        suggestion.setRejectionReason(reason == null || reason.isBlank() ? null : reason.trim());
        return toResponse(suggestionRepository.save(suggestion));
    }

    private Suggestion findEntityById(Long id) {
        return suggestionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna sugerencia con id: " + id));
    }

    /** Aprobar o rechazar solo tiene sentido una vez: una sugerencia ya resuelta no se reabre. */
    private Suggestion findPendingById(Long id) {
        Suggestion suggestion = findEntityById(id);
        if (suggestion.getStatus() != SuggestionStatus.PENDIENTE) {
            throw new InvalidDataException("La sugerencia ya está " + suggestion.getStatus().name().toLowerCase());
        }
        return suggestion;
    }

    private SuggestionResponse toResponse(Suggestion suggestion) {
        User author = userRepository.findById(suggestion.getUserId()).orElse(null);
        return new SuggestionResponse(
                suggestion.getId(),
                suggestion.getUuid(),
                suggestion.getUserId(),
                author != null ? author.getName() : null,
                author != null ? author.getEmail() : null,
                suggestion.getOrigin(),
                suggestion.getSourceUrl(),
                suggestion.getName(),
                suggestion.getCity(),
                suggestion.getProvince(),
                suggestion.getAddress(),
                suggestion.getFrequency(),
                suggestion.getDayOfWeek(),
                suggestion.getStartDate(),
                suggestion.getEndDate(),
                suggestion.getStartTime(),
                suggestion.getEndTime(),
                suggestion.getDescription(),
                suggestion.getContact(),
                suggestion.getComment(),
                suggestion.getStatus(),
                suggestion.getMarketId(),
                suggestion.getRejectionReason(),
                suggestion.getFechaCreacion(),
                suggestion.getFechaActualizacion()
        );
    }

    /** Recorta y colapsa espacios, igual que los mercados, para que la deduplicación sea fiable. */
    private static String normalize(String value) {
        if (value == null) {
            return null;
        }
        String collapsed = value.trim().replaceAll("\\s+", " ");
        return collapsed.isEmpty() ? null : collapsed;
    }

}
