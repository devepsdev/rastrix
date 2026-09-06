package dev.deveps.rastrix.services.impl;

import dev.deveps.rastrix.dto.response.StatsResponse;
import dev.deveps.rastrix.entities.Role;
import dev.deveps.rastrix.repositories.CategoryRepository;
import dev.deveps.rastrix.repositories.ExhibitorRepository;
import dev.deveps.rastrix.repositories.FavoriteRepository;
import dev.deveps.rastrix.repositories.MarketImageRepository;
import dev.deveps.rastrix.repositories.MarketRepository;
import dev.deveps.rastrix.repositories.NotificationRepository;
import dev.deveps.rastrix.repositories.RatingRepository;
import dev.deveps.rastrix.repositories.UserRepository;
import dev.deveps.rastrix.services.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsServiceImpl implements StatsService {

    private final UserRepository userRepository;
    private final MarketRepository marketRepository;
    private final CategoryRepository categoryRepository;
    private final ExhibitorRepository exhibitorRepository;
    private final MarketImageRepository marketImageRepository;
    private final FavoriteRepository favoriteRepository;
    private final RatingRepository ratingRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public StatsResponse getStats() {
        return new StatsResponse(
                userRepository.count(),
                userRepository.countByRole(Role.ADMIN),
                marketRepository.count(),
                marketRepository.countByActiveTrue(),
                categoryRepository.count(),
                exhibitorRepository.count(),
                marketImageRepository.count(),
                favoriteRepository.count(),
                ratingRepository.count(),
                ratingRepository.findAverageScore(),
                notificationRepository.count(),
                notificationRepository.countByReadFalse()
        );
    }

}
