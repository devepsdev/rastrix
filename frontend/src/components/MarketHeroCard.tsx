import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { formatLocation, formatSchedule, formatTimeRange } from "@/lib/format";
import { useTheme } from "@/theme";
import type { MarketResponse } from "@/types/dto";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";
import { MarketPhoto } from "./MarketPhoto";

interface MarketHeroCardProps {
  market: MarketResponse;
  onPress: () => void;
}

const ON_IMAGE_INK = "#FDFBF7";

export function MarketHeroCard({ market, onPress }: MarketHeroCardProps) {
  const theme = useTheme();
  const timeRange = formatTimeRange(market.startTime, market.endTime);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: 380,
          borderRadius: theme.radius.xl,
          overflow: "hidden",
          opacity: pressed ? 0.94 : 1,
        },
        theme.shadow.raised,
      ]}
    >
      <MarketPhoto uri={market.mainImage} radius={theme.radius.xl} style={{ flex: 1 }} />

      <LinearGradient
        colors={[theme.colors.scrimFrom, theme.colors.scrimTo]}
        locations={[0.35, 1]}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "78%" }}
      />

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: theme.spacing.xxl,
          gap: theme.spacing.md,
        }}
      >
        <Tag label={formatSchedule(market)} tone="onImage" />

        <Text variant="display" style={{ color: ON_IMAGE_INK }} numberOfLines={2}>
          {market.name}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="map-pin" size={13} color={ON_IMAGE_INK} />
          <Text variant="captionMedium" style={{ color: ON_IMAGE_INK }}>
            {formatLocation(market)}
            {timeRange ? `  ·  ${timeRange}` : ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
