import * as favoritesApi from "@/api/favorites";
import * as marketsApi from "@/api/markets";
import { useAuth } from "@/auth/AuthContext";
import { MarketListItem } from "@/components/MarketListItem";
import { Divider } from "@/components/ui/Divider";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Screen } from "@/components/ui/Screen";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { useAsync } from "@/lib/useAsync";
import { useTheme } from "@/theme";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, View } from "react-native";

export default function FavoritesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const favorites = useAsync(
    () => (isAuthenticated ? favoritesApi.findMine() : Promise.resolve([])),
    [isAuthenticated]
  );
  const markets = useAsync(() => marketsApi.findAll({ size: 100 }), []);

  // Al volver del detalle, el mercado puede haberse añadido o quitado allí.
  const reloadFavorites = favorites.reload;
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) reloadFavorites();
    }, [isAuthenticated, reloadFavorites])
  );

  const favoriteMarkets = (favorites.data ?? [])
    .map((favorite) => ({
      favorite,
      market: markets.data?.content.find((item) => item.id === favorite.marketId),
    }))
    .filter((entry): entry is { favorite: (typeof entry)["favorite"]; market: NonNullable<(typeof entry)["market"]> } =>
      Boolean(entry.market)
    );

  const removeFavorite = async (favoriteId: number) => {
    await favoritesApi.remove(favoriteId);
    favorites.reload();
  };

  return (
    <Screen>
      <View style={{ paddingHorizontal: theme.screenPadding, paddingBottom: theme.spacing.lg }}>
        <Text variant="display">Favoritos</Text>
      </View>

      {!isAuthenticated ? (
        <EmptyState
          icon="bookmark"
          title="Guarda tus mercados"
          message="Crea una cuenta gratuita para guardar los mercados que no te quieres perder."
          actionLabel="Iniciar sesión"
          onAction={() => router.push("/acceso")}
        />
      ) : favorites.loading && !favorites.data ? (
        <View style={{ paddingHorizontal: theme.screenPadding, gap: theme.spacing.xl }}>
          {[0, 1, 2].map((key) => (
            <View key={key} style={{ flexDirection: "row", gap: theme.spacing.lg }}>
              <Skeleton width={88} height={88} radius={theme.radius.md} />
              <View style={{ flex: 1, gap: theme.spacing.sm, justifyContent: "center" }}>
                <Skeleton width={70} height={10} />
                <Skeleton width="80%" height={17} />
              </View>
            </View>
          ))}
        </View>
      ) : favoriteMarkets.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="Todavía no has guardado nada"
          message="Pulsa el marcador en cualquier mercado para tenerlo siempre a mano."
          actionLabel="Descubrir mercados"
          onAction={() => router.push("/")}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.screenPadding,
            paddingBottom: theme.spacing.huge,
          }}
        >
          {favoriteMarkets.map(({ favorite, market }, index) => (
            <View key={favorite.id}>
              {index > 0 ? <Divider /> : null}
              <MarketListItem
                market={market}
                onPress={() => router.push(`/mercado/${market.id}`)}
                trailing={
                  <IconButton
                    name="x"
                    size={17}
                    accessibilityLabel={`Quitar ${market.name} de favoritos`}
                    onPress={() => removeFavorite(favorite.id)}
                  />
                }
              />
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
