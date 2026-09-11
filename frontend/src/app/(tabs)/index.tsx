import * as categoriesApi from "@/api/categories";
import * as marketsApi from "@/api/markets";
import { CategoryChip } from "@/components/CategoryChip";
import { MarketCard } from "@/components/MarketCard";
import { MarketHeroCard } from "@/components/MarketHeroCard";
import { MarketListItem } from "@/components/MarketListItem";
import { Divider } from "@/components/ui/Divider";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { opensThisWeekend } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";
import { useTheme } from "@/theme";
import type { MarketResponse } from "@/types/dto";
import { useRouter } from "expo-router";
import { RefreshControl, ScrollView, View } from "react-native";

export default function DiscoverScreen() {
  const theme = useTheme();
  const router = useRouter();

  const markets = useAsync(() => marketsApi.findAll({ size: 30 }), []);
  const categories = useAsync(() => categoriesApi.findAll(), []);

  const all = markets.data?.content.filter((market) => market.active) ?? [];
  const featured = all.find((market) => market.mainImage) ?? all[0];
  const rest = all.filter((market) => market.id !== featured?.id);
  const weekend = rest.filter(opensThisWeekend).slice(0, 6);
  const weekendIds = new Set(weekend.map((market) => market.id));
  const others = rest.filter((market) => !weekendIds.has(market.id));

  const openMarket = (market: MarketResponse) => router.push(`/mercado/${market.id}`);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.huge }}
        refreshControl={
          <RefreshControl
            refreshing={markets.loading && markets.data !== null}
            onRefresh={markets.reload}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
          />
        }
      >
        <Masthead onOpenNotifications={() => router.push("/perfil")} />

        {markets.loading && !markets.data ? (
          <DiscoverSkeleton />
        ) : markets.error ? (
          <EmptyState
            icon="wifi-off"
            title="No hemos podido cargar los mercados"
            message="Comprueba tu conexión e inténtalo de nuevo."
            actionLabel="Reintentar"
            onAction={markets.reload}
          />
        ) : !featured ? (
          <EmptyState
            title="Todavía no hay mercados publicados"
            message="En cuanto se publique el primero, aparecerá aquí."
          />
        ) : (
          <>
            <View style={{ paddingHorizontal: theme.screenPadding, gap: theme.spacing.md }}>
              <Text variant="overline" color="accent">
                Destacado
              </Text>
              <MarketHeroCard market={featured} onPress={() => openMarket(featured)} />
            </View>

            {categories.data && categories.data.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: theme.screenPadding,
                  gap: theme.spacing.sm,
                  paddingVertical: theme.spacing.xxl,
                }}
              >
                {categories.data.map((category) => (
                  <CategoryChip
                    key={category.id}
                    label={category.name}
                    onPress={() => router.push(`/buscar?categoria=${category.id}`)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={{ height: theme.spacing.xxxl }} />
            )}

            {weekend.length > 0 ? (
              <View style={{ marginBottom: theme.spacing.xxxl }}>
                <SectionHeader eyebrow="Agenda" title="Este fin de semana" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: theme.screenPadding,
                    gap: theme.spacing.lg,
                  }}
                >
                  {weekend.map((market) => (
                    <MarketCard key={market.id} market={market} onPress={() => openMarket(market)} />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {others.length > 0 ? (
              <View>
                <SectionHeader
                  eyebrow="Directorio"
                  title="Todos los mercados"
                  actionLabel="Buscar"
                  onAction={() => router.push("/buscar")}
                />
                <View style={{ paddingHorizontal: theme.screenPadding }}>
                  {others.map((market, index) => (
                    <View key={market.id}>
                      {index > 0 ? <Divider /> : null}
                      <MarketListItem market={market} onPress={() => openMarket(market)} />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function Masthead({ onOpenNotifications }: { onOpenNotifications: () => void }) {
  const theme = useTheme();

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingHorizontal: theme.screenPadding,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.lg,
        }}
      >
        <View style={{ gap: 4 }}>
          <Text variant="display" style={{ letterSpacing: -1 }}>
            Rastrix
          </Text>
          <Text variant="overline" color="inkFaint">
            Mercados de antigüedades
          </Text>
        </View>

        <IconButton
          name="bell"
          variant="surface"
          accessibilityLabel="Notificaciones"
          onPress={onOpenNotifications}
        />
      </View>

      <Divider style={{ marginHorizontal: theme.screenPadding, marginBottom: theme.spacing.xxl }} />
    </>
  );
}

function DiscoverSkeleton() {
  const theme = useTheme();

  return (
    <View style={{ paddingHorizontal: theme.screenPadding, gap: theme.spacing.xxl }}>
      <View style={{ gap: theme.spacing.md }}>
        <Skeleton width={90} height={11} />
        <Skeleton height={380} radius={theme.radius.xl} />
      </View>

      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} width={104} height={36} radius={theme.radius.full} />
        ))}
      </View>

      <View style={{ gap: theme.spacing.lg }}>
        {[0, 1, 2].map((key) => (
          <View key={key} style={{ flexDirection: "row", gap: theme.spacing.lg }}>
            <Skeleton width={88} height={88} radius={theme.radius.md} />
            <View style={{ flex: 1, gap: theme.spacing.sm, justifyContent: "center" }}>
              <Skeleton width={70} height={10} />
              <Skeleton width="80%" height={17} />
              <Skeleton width="55%" height={13} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
