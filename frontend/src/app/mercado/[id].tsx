import * as categoriesApi from "@/api/categories";
import * as exhibitorsApi from "@/api/exhibitors";
import * as favoritesApi from "@/api/favorites";
import * as marketCategoriesApi from "@/api/marketCategories";
import * as marketImagesApi from "@/api/marketImages";
import * as marketsApi from "@/api/markets";
import * as ratingsApi from "@/api/ratings";
import { useAuth } from "@/auth/AuthContext";
import { MarketPhoto } from "@/components/MarketPhoto";
import { Divider } from "@/components/ui/Divider";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { RatingStars } from "@/components/ui/RatingStars";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { formatFullAddress, formatLocation, formatSchedule, formatTimeRange } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";
import { useTheme, type Theme } from "@/theme";
import type { MarketResponse } from "@/types/dto";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HERO_HEIGHT = 340;

export default function MarketDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const marketId = Number(id);

  const market = useAsync(() => marketsApi.findById(marketId), [marketId]);
  const ratings = useAsync(() => ratingsApi.findByMarketId(marketId), [marketId]);
  const exhibitors = useAsync(() => exhibitorsApi.findByMarketId(marketId), [marketId]);
  const images = useAsync(() => marketImagesApi.findByMarketId(marketId), [marketId]);
  const marketCategories = useAsync(() => marketCategoriesApi.findByMarketId(marketId), [marketId]);
  const categories = useAsync(() => categoriesApi.findAll(), []);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  // La barra superior aparece cuando la foto deja de cubrir el texto.
  const topBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HERO_HEIGHT - 160, HERO_HEIGHT - 70],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const categoryNames = (marketCategories.data ?? [])
    .map((link) => categories.data?.find((category) => category.id === link.categoryId)?.name)
    .filter((name): name is string => Boolean(name));

  const scores = ratings.data?.map((rating) => rating.score) ?? [];
  const average = scores.length
    ? scores.reduce((total, score) => total + score, 0) / scores.length
    : null;

  if (market.loading && !market.data) {
    return <DetailSkeleton />;
  }

  if (market.error || !market.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: "center" }}>
        <EmptyState
          icon="alert-circle"
          title="No hemos podido cargar el mercado"
          message="Puede que ya no esté disponible."
          actionLabel="Volver"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const data = market.data;
  const timeRange = formatTimeRange(data.startTime, data.endTime);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <View style={{ height: HERO_HEIGHT }}>
          <MarketPhoto uri={data.mainImage} style={{ flex: 1 }} />
          <LinearGradient
            colors={["rgba(20,15,10,0.55)", "rgba(20,15,10,0)"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 140 }}
          />
        </View>

        <View
          style={{
            marginTop: -theme.spacing.xxl,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            backgroundColor: theme.colors.background,
            paddingHorizontal: theme.screenPadding,
            paddingTop: theme.spacing.xxl,
            gap: theme.spacing.xxl,
          }}
        >
          <View style={{ gap: theme.spacing.md }}>
            <Text variant="overline" color="accent">
              {formatSchedule(data)}
            </Text>

            <Text variant="display">{data.name}</Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Feather name="map-pin" size={13} color={theme.colors.inkFaint} />
              <Text variant="captionMedium" color="inkMuted">
                {formatLocation(data)}
              </Text>
            </View>

            <RatingStars value={average} count={scores.length || undefined} size={15} />
          </View>

          {categoryNames.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
              {categoryNames.map((name) => (
                <Tag key={name} label={name} tone="support" />
              ))}
            </View>
          ) : null}

          <InfoCard market={data} timeRange={timeRange} />

          {data.description ? (
            <Section title="Sobre el mercado">
              <Text variant="body" color="inkMuted">
                {data.description}
              </Text>
            </Section>
          ) : null}

          {images.data && images.data.length > 0 ? (
            <Section title="Galería">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: theme.spacing.md }}
                style={{ marginHorizontal: -theme.screenPadding }}
                contentInset={{ left: theme.screenPadding }}
              >
                <View style={{ width: theme.screenPadding }} />
                {images.data.map((image) => (
                  <MarketPhoto
                    key={image.id}
                    uri={image.imageUrl}
                    radius={theme.radius.md}
                    style={{ width: 168, height: 124 }}
                  />
                ))}
                <View style={{ width: theme.screenPadding }} />
              </ScrollView>
            </Section>
          ) : null}

          {exhibitors.data && exhibitors.data.length > 0 ? (
            <Section title="Expositores">
              <View style={{ gap: theme.spacing.md }}>
                {exhibitors.data.map((exhibitor) => (
                  <View key={exhibitor.id} style={{ gap: 2 }}>
                    <Text variant="bodyMedium">{exhibitor.name}</Text>
                    {exhibitor.specialty ? (
                      <Text variant="caption" color="inkMuted">
                        {exhibitor.specialty}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          <Section title={`Valoraciones${scores.length ? ` (${scores.length})` : ""}`}>
            {ratings.data && ratings.data.length > 0 ? (
              <View style={{ gap: theme.spacing.lg }}>
                {ratings.data.slice(0, 5).map((rating) => (
                  <View key={rating.id} style={{ gap: 6 }}>
                    <RatingStars value={rating.score} showValue={false} size={13} />
                    {rating.comment ? (
                      <Text variant="body" color="inkMuted">
                        {rating.comment}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="body" color="inkFaint">
                Este mercado todavía no tiene valoraciones.
              </Text>
            )}
          </Section>

          <ContactBlock market={data} />
        </View>
      </Animated.ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: insets.top + 56,
            backgroundColor: theme.colors.background,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            justifyContent: "flex-end",
            paddingBottom: theme.spacing.md,
            paddingHorizontal: 72,
          },
          topBarStyle,
        ]}
      >
        <Text variant="title3" center numberOfLines={1}>
          {data.name}
        </Text>
      </Animated.View>

      <View
        style={{
          position: "absolute",
          top: insets.top + theme.spacing.sm,
          left: theme.screenPadding,
          right: theme.screenPadding,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <IconButton
          name="arrow-left"
          variant="floating"
          accessibilityLabel="Volver"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        />
        <FavoriteButton marketId={marketId} />
      </View>
    </View>
  );
}

function FavoriteButton({ marketId }: { marketId: number }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const favorites = useAsync(
    () => (isAuthenticated ? favoritesApi.findMine() : Promise.resolve([])),
    [isAuthenticated]
  );
  const [busy, setBusy] = useState(false);

  const favorite = favorites.data?.find((item) => item.marketId === marketId);

  const toggle = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert(
        "Inicia sesión",
        "Crea una cuenta gratuita para guardar mercados en tus favoritos.",
        [
          { text: "Ahora no", style: "cancel" },
          { text: "Iniciar sesión", onPress: () => router.push("/acceso") },
        ]
      );
      return;
    }

    setBusy(true);
    try {
      if (favorite) {
        await favoritesApi.remove(favorite.id);
      } else {
        await favoritesApi.create({ userId: user.id, marketId });
      }
      favorites.reload();
    } catch {
      Alert.alert("No se ha podido guardar", "Inténtalo de nuevo en unos segundos.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <IconButton
      name="bookmark"
      variant="floating"
      color={favorite ? "#B4532A" : "#1C1917"}
      accessibilityLabel={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
      onPress={busy ? undefined : toggle}
    />
  );
}

function InfoCard({ market, timeRange }: { market: MarketResponse; timeRange: string | null }) {
  const theme = useTheme();
  const address = formatFullAddress(market);

  const openInMaps = () => {
    const query =
      market.latitude !== null && market.longitude !== null
        ? `${market.latitude},${market.longitude}`
        : address || market.name;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
  };

  return (
    <View
      style={{
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        overflow: "hidden",
      }}
    >
      {/* La periodicidad ya se muestra como antetítulo, aquí solo el horario. */}
      <InfoRow
        theme={theme}
        icon="clock"
        label="Horario"
        value={timeRange ?? "Horario por confirmar"}
      />

      {address ? (
        <>
          <Divider />
          <InfoRow theme={theme} icon="map-pin" label="Dónde" value={address}>
            <Pressable
              onPress={openInMaps}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginTop: theme.spacing.sm,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Feather name="navigation" size={13} color={theme.colors.accent} />
              <Text variant="captionMedium" color="accent">
                Abrir en Google Maps
              </Text>
            </Pressable>
          </InfoRow>
        </>
      ) : null}
    </View>
  );
}

function InfoRow({
  theme,
  icon,
  label,
  value,
  detail,
  children,
}: {
  theme: Theme;
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  detail?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <View style={{ flexDirection: "row", gap: theme.spacing.md, padding: theme.spacing.lg }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: theme.radius.full,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.surfaceSunken,
        }}
      >
        <Feather name={icon} size={15} color={theme.colors.inkMuted} />
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="overline" color="inkFaint">
          {label}
        </Text>
        <Text variant="bodyMedium">{value}</Text>
        {detail ? (
          <Text variant="caption" color="inkMuted">
            {detail}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}

function ContactBlock({ market }: { market: MarketResponse }) {
  const theme = useTheme();
  const links = [
    market.contactPhone && {
      icon: "phone" as const,
      label: market.contactPhone,
      url: `tel:${market.contactPhone}`,
    },
    market.contactEmail && {
      icon: "mail" as const,
      label: market.contactEmail,
      url: `mailto:${market.contactEmail}`,
    },
    market.website && {
      icon: "globe" as const,
      label: market.website.replace(/^https?:\/\//, ""),
      url: market.website,
    },
  ].filter(Boolean) as { icon: "phone" | "mail" | "globe"; label: string; url: string }[];

  if (links.length === 0 && !market.organizer) return null;

  return (
    <Section title="Contacto">
      <View style={{ gap: theme.spacing.md }}>
        {market.organizer ? (
          <Text variant="body" color="inkMuted">
            Organiza {market.organizer}
          </Text>
        ) : null}

        {links.map((link) => (
          <Pressable
            key={link.url}
            onPress={() => Linking.openURL(link.url)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.md,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Feather name={link.icon} size={15} color={theme.colors.accent} />
            <Text variant="body" color="accent">
              {link.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="title2">{title}</Text>
      {children}
    </View>
  );
}

function DetailSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Skeleton height={HERO_HEIGHT} radius={0} />
      <View style={{ padding: theme.screenPadding, gap: theme.spacing.md }}>
        <Skeleton width={110} height={11} />
        <Skeleton width="85%" height={32} />
        <Skeleton width="45%" height={14} />
        <Skeleton height={150} radius={theme.radius.lg} style={{ marginTop: theme.spacing.lg }} />
      </View>
    </View>
  );
}
