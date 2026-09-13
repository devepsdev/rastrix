package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.request.RatingRequest;
import dev.deveps.rastrix.dto.response.RatingResponse;
import dev.deveps.rastrix.entities.Rating;
import dev.deveps.rastrix.entities.User;
import dev.deveps.rastrix.exception.ResourceNotFoundException;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.repositories.RatingRepository;
import dev.deveps.rastrix.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceImplTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MarketRepository marketRepository;

    @InjectMocks
    private RatingServiceImpl ratingService;

    @Test
    void createRejectsHiddenMarkets() {
        when(userRepository.existsById(1L)).thenReturn(true);
        when(marketRepository.findByIdAndActiveTrue(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ratingService.create(new RatingRequest(1L, 2L, 5, null)))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(ratingRepository);
    }

    @Test
    void findByMarketIdIncludesAuthorNamesNewestFirst() {
        Rating older = rating(10L, 1L, LocalDateTime.of(2026, 9, 1, 10, 0));
        Rating newer = rating(11L, 2L, LocalDateTime.of(2026, 9, 10, 10, 0));
        Rating orphan = rating(12L, 3L, LocalDateTime.of(2026, 8, 1, 10, 0));
        when(ratingRepository.findByMarketId(7L)).thenReturn(List.of(older, newer, orphan));
        when(userRepository.findAllById(anyList())).thenReturn(List.of(user(1L, "Ana"), user(2L, "Luis")));

        List<RatingResponse> result = ratingService.findByMarketId(7L);

        assertThat(result).extracting(RatingResponse::id).containsExactly(11L, 10L, 12L);
        assertThat(result).extracting(RatingResponse::userName).containsExactly("Luis", "Ana", null);
    }

    private static Rating rating(Long id, Long userId, LocalDateTime createdAt) {
        return Rating.builder().id(id).userId(userId).marketId(7L).score(4).fechaCreacion(createdAt).build();
    }

    private static User user(Long id, String name) {
        return User.builder().id(id).name(name).build();
    }

}
