package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.SuggestionRequest;
import dev.deveps.rastrix.dto.response.SuggestionResponse;
import dev.deveps.rastrix.entities.Suggestion;
import dev.deveps.rastrix.entities.SuggestionStatus;
import dev.deveps.rastrix.exception.InvalidDataException;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.repositories.SuggestionRepository;
import dev.deveps.rastrix.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SuggestionServiceImplTest {

    @Mock
    private SuggestionRepository suggestionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MarketRepository marketRepository;

    @InjectMocks
    private SuggestionServiceImpl suggestionService;

    private static SuggestionRequest request() {
        return new SuggestionRequest("Rastro de Cuenca", "Cuenca", null, null, "mensual", "sabado",
                null, null, null, null, "Cada primer sábado", "600 000 000", null);
    }

    private static Suggestion suggestion(SuggestionStatus status) {
        Suggestion suggestion = Suggestion.builder()
                .userId(5L)
                .name("Rastro de Cuenca")
                .city("Cuenca")
                .status(status)
                .build();
        suggestion.setId(1L);
        return suggestion;
    }

    @Test
    void createStoresSuggestionAsPending() {
        when(suggestionRepository.countByUserIdAndStatus(5L, SuggestionStatus.PENDIENTE)).thenReturn(0L);
        when(suggestionRepository.save(any(Suggestion.class))).thenAnswer(call -> call.getArgument(0));

        SuggestionResponse response = suggestionService.create(5L, request());

        assertThat(response.status()).isEqualTo(SuggestionStatus.PENDIENTE);
        assertThat(response.userId()).isEqualTo(5L);
    }

    @Test
    void createRejectsWhenUserHasTooManyPending() {
        when(suggestionRepository.countByUserIdAndStatus(5L, SuggestionStatus.PENDIENTE))
                .thenReturn((long) SuggestionServiceImpl.MAX_PENDING_PER_USER);

        assertThatThrownBy(() -> suggestionService.create(5L, request()))
                .isInstanceOf(InvalidDataException.class);

        verify(suggestionRepository, never()).save(any());
    }

    @Test
    void approveLinksTheMarketAndMarksItApproved() {
        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion(SuggestionStatus.PENDIENTE)));
        when(marketRepository.existsById(40L)).thenReturn(true);
        when(suggestionRepository.save(any(Suggestion.class))).thenAnswer(call -> call.getArgument(0));

        SuggestionResponse response = suggestionService.approve(1L, 40L);

        assertThat(response.status()).isEqualTo(SuggestionStatus.APROBADA);
        assertThat(response.marketId()).isEqualTo(40L);
    }

    @Test
    void approveFailsWhenMarketDoesNotExist() {
        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion(SuggestionStatus.PENDIENTE)));
        when(marketRepository.existsById(40L)).thenReturn(false);

        assertThatThrownBy(() -> suggestionService.approve(1L, 40L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    /** Una sugerencia ya resuelta no se puede volver a aprobar ni rechazar. */
    @Test
    void resolvedSuggestionCannotBeResolvedAgain() {
        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion(SuggestionStatus.RECHAZADA)));

        assertThatThrownBy(() -> suggestionService.approve(1L, 40L)).isInstanceOf(InvalidDataException.class);
        assertThatThrownBy(() -> suggestionService.reject(1L, "otra vez")).isInstanceOf(InvalidDataException.class);

        verify(suggestionRepository, never()).save(any());
    }

    @Test
    void rejectStoresTheReason() {
        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion(SuggestionStatus.PENDIENTE)));
        when(suggestionRepository.save(any(Suggestion.class))).thenAnswer(call -> call.getArgument(0));

        SuggestionResponse response = suggestionService.reject(1L, "  Ya existe en el catálogo  ");

        assertThat(response.status()).isEqualTo(SuggestionStatus.RECHAZADA);
        assertThat(response.rejectionReason()).isEqualTo("Ya existe en el catálogo");
    }
}
