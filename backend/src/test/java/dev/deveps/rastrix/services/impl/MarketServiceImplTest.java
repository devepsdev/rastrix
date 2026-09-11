package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.MarketRequest;
import dev.deveps.rastrix.dto.response.MarketImportResponse;
import dev.deveps.rastrix.entities.Market;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.repositories.MarketRepository;
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
class MarketServiceImplTest {

    @Mock
    private MarketRepository marketRepository;

    @InjectMocks
    private MarketServiceImpl marketService;

    private static MarketRequest request(String name, String city, boolean active) {
        return new MarketRequest(
                name, "descripcion", "direccion", city, "Madrid", "28005",
                null, null, "semanal", "domingo",
                null, null, null, null,
                "imagen.jpg", "organizador", null, null, null, active);
    }

    private static Market existing(Long id, String name, String city, boolean active) {
        Market market = new Market();
        market.setId(id);
        market.setName(name);
        market.setCity(city);
        market.setActive(active);
        return market;
    }

    @Test
    void createRejectsMarketWithSameNameAndCity() {
        when(marketRepository.findByNameAndCity("El Rastro", "Madrid"))
                .thenReturn(Optional.of(existing(1L, "El Rastro", "Madrid", true)));

        assertThatThrownBy(() -> marketService.create(request("El Rastro", "Madrid", true)))
                .isInstanceOf(DuplicateResourceException.class);

        verify(marketRepository, never()).save(any());
    }

    @Test
    void createNormalizesWhitespaceBeforeCheckingDuplicates() {
        when(marketRepository.findByNameAndCity("El Rastro", "Madrid"))
                .thenReturn(Optional.of(existing(1L, "El Rastro", "Madrid", true)));

        assertThatThrownBy(() -> marketService.create(request("  El   Rastro ", " Madrid ", true)))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void updateAllowsKeepingItsOwnNameAndCity() {
        Market market = existing(7L, "El Rastro", "Madrid", true);
        when(marketRepository.findById(7L)).thenReturn(Optional.of(market));
        when(marketRepository.findByNameAndCity("El Rastro", "Madrid")).thenReturn(Optional.of(market));
        when(marketRepository.save(any(Market.class))).thenAnswer(call -> call.getArgument(0));

        assertThat(marketService.update(7L, request("El Rastro", "Madrid", true)).name())
                .isEqualTo("El Rastro");
    }

    @Test
    void updateRejectsTakingTheNameOfAnotherMarket() {
        when(marketRepository.findById(7L)).thenReturn(Optional.of(existing(7L, "Otro", "Madrid", true)));
        when(marketRepository.findByNameAndCity("El Rastro", "Madrid"))
                .thenReturn(Optional.of(existing(1L, "El Rastro", "Madrid", true)));

        assertThatThrownBy(() -> marketService.update(7L, request("El Rastro", "Madrid", true)))
                .isInstanceOf(DuplicateResourceException.class);

        verify(marketRepository, never()).save(any());
    }

    @Test
    void upsertCreatesWhenMarketIsNew() {
        when(marketRepository.findByNameAndCity("El Rastro", "Madrid")).thenReturn(Optional.empty());
        when(marketRepository.save(any(Market.class))).thenAnswer(call -> call.getArgument(0));

        MarketImportResponse result = marketService.upsert(request("El Rastro", "Madrid", true));

        assertThat(result.created()).isTrue();
        assertThat(result.market().name()).isEqualTo("El Rastro");
    }

    @Test
    void upsertUpdatesInsteadOfDuplicatingWhenMarketAlreadyExists() {
        Market market = existing(1L, "El Rastro", "Madrid", true);
        when(marketRepository.findByNameAndCity("El Rastro", "Madrid")).thenReturn(Optional.of(market));
        when(marketRepository.save(any(Market.class))).thenAnswer(call -> call.getArgument(0));

        MarketImportResponse result = marketService.upsert(request("El Rastro", "Madrid", true));

        assertThat(result.created()).isFalse();
        assertThat(result.market().id()).isEqualTo(1L);
        assertThat(result.market().organizer()).isEqualTo("organizador");
    }

    /** Un mercado ocultado a mano no debe reaparecer en la siguiente importación. */
    @Test
    void upsertDoesNotRepublishAMarketHiddenByAnAdmin() {
        Market hidden = existing(1L, "El Rastro", "Madrid", false);
        when(marketRepository.findByNameAndCity("El Rastro", "Madrid")).thenReturn(Optional.of(hidden));
        when(marketRepository.save(any(Market.class))).thenAnswer(call -> call.getArgument(0));

        MarketImportResponse result = marketService.upsert(request("El Rastro", "Madrid", true));

        assertThat(result.market().active()).isFalse();
    }

    @Test
    void upsertAppliesActiveWhenCreating() {
        when(marketRepository.findByNameAndCity("Feria nueva", "Vic")).thenReturn(Optional.empty());
        when(marketRepository.save(any(Market.class))).thenAnswer(call -> call.getArgument(0));

        MarketImportResponse result = marketService.upsert(request("Feria nueva", "Vic", false));

        assertThat(result.created()).isTrue();
        assertThat(result.market().active()).isFalse();
    }
}
