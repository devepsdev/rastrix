import { Text } from "@/components/ui/Text";
import { formatLocation, formatSchedule, formatTimeRange } from "@/lib/format";
import { useTheme } from "@/theme";
import type { MarketResponse } from "@/types/dto";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, View } from "react-native";
import { MarketPhoto } from "./MarketPhoto";

interface MarketCardProps {
  market: MarketResponse;
  onPress: () => void;
  width?: number;
}

/** Tarjeta para carruseles horizontales. */
export function MarketCard({ market, onPress, width = 244 }: MarketCardProps) {
  const theme = useTheme();
  const timeRange = formatTimeRange(market.startTime, market.endTime);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ width, gap: theme.spacing.md, opacity: pressed ? 0.85 : 1 })}
    >
      <MarketPhoto uri={market.mainImage} radius={theme.radius.lg} style={{ height: 168 }} />

      <View style={{ gap: 5 }}>
        <Text variant="overline" color="accent">
          {formatSchedule(market)}
        </Text>

        <Text variant="title3" numberOfLines={1}>
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
    </Pressable>
  );
}
