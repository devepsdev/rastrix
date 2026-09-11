import { useTheme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import { Text } from "./Text";

interface RatingStarsProps {
  /** Media de 0 a 5. null cuando el mercado aún no tiene valoraciones. */
  value: number | null;
  count?: number;
  size?: number;
  /** Muestra el número junto a las estrellas. */
  showValue?: boolean;
}

export function RatingStars({ value, count, size = 14, showValue = true }: RatingStarsProps) {
  const theme = useTheme();

  if (value === null) {
    return (
      <Text variant="caption" color="inkFaint">
        Sin valoraciones
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ flexDirection: "row", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((position) => {
          const name =
            value >= position ? "star" : value >= position - 0.5 ? "star-half" : "star-outline";
          return (
            <Ionicons
              key={position}
              name={name}
              size={size}
              color={name === "star-outline" ? theme.colors.borderStrong : theme.colors.brass}
            />
          );
        })}
      </View>
      {showValue ? (
        <Text variant="captionMedium" color="inkMuted">
          {value.toFixed(1)}
          {count !== undefined ? ` (${count})` : ""}
        </Text>
      ) : null}
    </View>
  );
}
