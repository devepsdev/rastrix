import * as marketCategoriesApi from "@/api/marketCategories";
import * as categoriesApi from "@/api/categories";
import * as marketsApi from "@/api/markets";
import { CategoryChip } from "@/components/CategoryChip";
import { MarketListItem } from "@/components/MarketListItem";
import { Divider } from "@/components/ui/Divider";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { useAsync } from "@/lib/useAsync";
import { useTheme } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ categoria?: string }>();

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(
    params.categoria ? Number(params.categoria) : null
  );

  const markets = useAsync(() => marketsApi.findAll({ size: 100 }), []);
  const categories = useAsync(() => categoriesApi.findAll(), []);
  const categoryLinks = useAsync(
    () =>
      categoryId === null
        ? Promise.resolve(null)
        : marketCategoriesApi.findByCategoryId(categoryId),
    [categoryId]
  );

  const allowedIds = categoryLinks.data
    ? new Set(categoryLinks.data.map((link) => link.marketId))
    : null;

  const normalized = query.trim().toLowerCase();
  const results = (markets.data?.content ?? [])
    .filter((market) => market.active)
    .filter((market) => (allowedIds ? allowedIds.has(market.id) : true))
    .filter((market) =>
      normalized.length === 0
        ? true
        : [market.name, market.city, market.province]
            .filter(Boolean)
            .some((field) => field!.toLowerCase().includes(normalized))
    );

  return (
    <Screen>
      <View style={{ paddingHorizontal: theme.screenPadding, gap: theme.spacing.lg }}>
        <Text variant="display">Buscar</Text>
        <Input
          icon="search"
          placeholder="Mercado, ciudad o provincia"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // Sin esto, el ScrollView horizontal se comprime dentro de la columna flex.
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{
          paddingHorizontal: theme.screenPadding,
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.lg,
        }}
      >
        <CategoryChip
          label="Todas"
          selected={categoryId === null}
          onPress={() => setCategoryId(null)}
        />
        {(categories.data ?? []).map((category) => (
          <CategoryChip
            key={category.id}
            label={category.name}
            selected={categoryId === category.id}
            onPress={() => setCategoryId(categoryId === category.id ? null : category.id)}
          />
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: theme.screenPadding,
          paddingBottom: theme.spacing.huge,
        }}
      >
        {markets.loading && !markets.data ? (
          <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.sm }}>
            {[0, 1, 2, 3].map((key) => (
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
        ) : results.length === 0 ? (
          <EmptyState
            icon="search"
            title="Sin resultados"
            message="Prueba con otro término o quita el filtro de categoría."
          />
        ) : (
          <>
            <Text variant="overline" color="inkFaint" style={{ marginBottom: theme.spacing.sm }}>
              {results.length} {results.length === 1 ? "mercado" : "mercados"}
            </Text>
            {results.map((market, index) => (
              <View key={market.id}>
                {index > 0 ? <Divider /> : null}
                <MarketListItem
                  market={market}
                  onPress={() => router.push(`/mercado/${market.id}`)}
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
