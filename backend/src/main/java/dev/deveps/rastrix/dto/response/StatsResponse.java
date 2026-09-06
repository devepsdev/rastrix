package dev.deveps.rastrix.dto.response;

public record StatsResponse(

        long totalUsers,
        long totalAdmins,
        long totalMarkets,
        long activeMarkets,
        long totalCategories,
        long totalExhibitors,
        long totalMarketImages,
        long totalFavorites,
        long totalRatings,
        Double averageRating,
        long totalNotifications,
        long unreadNotifications

) {
}
