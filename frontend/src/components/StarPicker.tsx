import { useTheme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

const LABELS = ["Muy flojo", "Flojo", "Está bien", "Muy bueno", "Imprescindible"];

export function scoreLabel(score: number): string {
  return LABELS[score - 1] ?? "";
}

/** Selector de 1 a 5 estrellas con zona de pulsación amplia. */
export function StarPicker({ value, onChange }: { value: number; onChange: (score: number) => void }) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
      {[1, 2, 3, 4, 5].map((score) => (
        <Pressable
          key={score}
          onPress={() => onChange(score)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${score} ${score === 1 ? "estrella" : "estrellas"}: ${scoreLabel(score)}`}
          accessibilityState={{ selected: value === score }}
          style={({ pressed }) => ({ padding: 4, transform: [{ scale: pressed ? 0.9 : 1 }] })}
        >
          <Ionicons
            name={score <= value ? "star" : "star-outline"}
            size={38}
            color={score <= value ? theme.colors.brass : theme.colors.borderStrong}
          />
        </Pressable>
      ))}
    </View>
  );
}
