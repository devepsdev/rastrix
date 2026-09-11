import { Text } from "@/components/ui/Text";
import { formatLocation, formatSchedule, formatTimeRange } from "@/lib/format";
import { useTheme } from "@/theme";
import type { MarketResponse } from "@/types/dto";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, View } from "react-native";
import { MarketPhoto } from "./MarketPhoto";

interface MarketListItemProps {
  market: MarketResponse;
  onPress: () => void;
  /** Acción secundaria a la derecha, p.ej. quitar de favoritos. */
  trailing?: React.ReactNode;
}

/** Fila compacta para listados verticales. */
export function MarketListItem({ market, onPress, trailing }: MarketListItemProps) {
  const theme = useTheme();
  const timeRange = formatTimeRange(market.startTime, market.endTime);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <MarketPhoto
        uri={market.mainImage}
        radius={theme.radius.md}
        style={{ width: 88, height: 88 }}
      />

      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="overline" color="accent" numberOfLines={1}>
          {formatSchedule(market)}
        </Text>

        <Text variant="title3" numberOfLines={2}>
          {market.name}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Feather name="map-pin" size={12} color={theme.colors.inkFaint} />
          <Text variant="caption" color="inkMuted" numberOfLines={1} style={{ flex: 1 }}>
            {formatLocation(market)}
            {timeRange ? `  ·  ${timeRange}` : ""}
          </Text>
        </View>
      </View>

      {trailing ?? <Feather name="chevron-right" size={18} color={theme.colors.inkFaint} />}
    </Pressable>
  );
}
