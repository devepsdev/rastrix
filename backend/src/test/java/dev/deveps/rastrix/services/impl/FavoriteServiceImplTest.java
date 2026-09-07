package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.FavoriteRequest;
import dev.deveps.rastrix.dto.response.FavoriteResponse;
import dev.deveps.rastrix.entities.Favorite;
import dev.deveps.rastrix.exception.DuplicateResourceException;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.FavoriteRepository;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceImplTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MarketRepository marketRepository;

    @InjectMocks
    private FavoriteServiceImpl favoriteService;

    @Test
    void createThrowsWhenUserDoesNotExist() {
        FavoriteRequest request = new FavoriteRequest(1L, 2L);
        when(userRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> favoriteService.create(request))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(favoriteRepository);
    }

    @Test
    void createThrowsWhenMarketDoesNotExist() {
        FavoriteRequest request = new FavoriteRequest(1L, 2L);
        when(userRepository.existsById(1L)).thenReturn(true);
        when(marketRepository.existsById(2L)).thenReturn(false);

        assertThatThrownBy(() -> favoriteService.create(request))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(favoriteRepository);
    }

    @Test
    void createThrowsWhenAlreadyFavorited() {
        FavoriteRequest request = new FavoriteRequest(1L, 2L);
        when(userRepository.existsById(1L)).thenReturn(true);
        when(marketRepository.existsById(2L)).thenReturn(true);
        when(favoriteRepository.existsByUserIdAndMarketId(1L, 2L)).thenReturn(true);

        assertThatThrownBy(() -> favoriteService.create(request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(favoriteRepository, never()).save(any());
    }

    @Test
    void createSavesFavoriteWhenValid() {
        FavoriteRequest request = new FavoriteRequest(1L, 2L);
        when(userRepository.existsById(1L)).thenReturn(true);
        when(marketRepository.existsById(2L)).thenReturn(true);
        when(favoriteRepository.existsByUserIdAndMarketId(1L, 2L)).thenReturn(false);
        when(favoriteRepository.save(any(Favorite.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FavoriteResponse response = favoriteService.create(request);

        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.marketId()).isEqualTo(2L);
    }

}
