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
import { ListFooter } from "@/components/ListFooter";
import { useAsync } from "@/lib/useAsync";
import { useDebounced } from "@/lib/useDebounced";
import { usePagedList } from "@/lib/usePagedList";
import { useTheme } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, ScrollView, View } from "react-native";

const PAGE_SIZE = 20;

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ categoria?: string }>();

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(
    params.categoria ? Number(params.categoria) : null
  );

  // La pestaña sigue montada al volver desde una categoría de Descubrir: hay que
  // aplicar la nueva categoría aunque el estado ya estuviera inicializado.
  const [categoryParam, setCategoryParam] = useState(params.categoria);
  if (params.categoria !== categoryParam) {
    setCategoryParam(params.categoria);
    setCategoryId(params.categoria ? Number(params.categoria) : null);
  }

  // Se busca en el servidor, así que se espera a que el usuario deje de escribir.
  const debouncedQuery = useDebounced(query.trim(), 300);

  const markets = usePagedList(
    (page) =>
      marketsApi.search({ q: debouncedQuery, categoryId }, { page, size: PAGE_SIZE, sort: "name,asc" }),
    [debouncedQuery, categoryId]
  );
  const categories = useAsync(() => categoriesApi.findAll(), []);

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

      {markets.loading && markets.items.length === 0 ? (
        <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.sm, paddingHorizontal: theme.screenPadding }}>
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
      ) : markets.error && markets.items.length === 0 ? (
        <EmptyState
          icon="wifi-off"
          title="No hemos podido buscar"
          message="Comprueba tu conexión e inténtalo de nuevo."
          actionLabel="Reintentar"
          onAction={markets.reload}
        />
      ) : markets.items.length === 0 ? (
        <EmptyState
          icon="search"
          title="Sin resultados"
          message="Prueba con otro término. Y si conoces un mercado que no está, cuéntanoslo."
          actionLabel="Sugerir un mercado"
          onAction={() => router.push("/sugerir")}
        />
      ) : (
        <FlatList
          data={markets.items}
          keyExtractor={(market) => String(market.id)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingHorizontal: theme.screenPadding,
            paddingBottom: theme.spacing.huge,
          }}
          ListHeaderComponent={
            <Text variant="overline" color="inkFaint" style={{ marginBottom: theme.spacing.sm }}>
              {markets.total} {markets.total === 1 ? "mercado" : "mercados"}
            </Text>
          }
          ItemSeparatorComponent={Divider}
          renderItem={({ item: market }) => (
            <MarketListItem market={market} onPress={() => router.push(`/mercado/${market.id}`)} />
          )}
          onEndReached={markets.loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <ListFooter loading={markets.loadingMore} failed={Boolean(markets.error)} onRetry={markets.loadMore} />
          }
        />
      )}
    </Screen>
  );
}
