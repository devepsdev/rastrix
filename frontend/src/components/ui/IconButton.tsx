import { useTheme } from "@/theme";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, type ViewStyle } from "react-native";

type Variant = "plain" | "surface" | "floating";

interface IconButtonProps {
  name: React.ComponentProps<typeof Feather>["name"];
  onPress?: () => void;
  variant?: Variant;
  size?: number;
  color?: string;
  accessibilityLabel: string;
  style?: ViewStyle;
}

export function IconButton({
  name,
  onPress,
  variant = "plain",
  size = 20,
  color,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const theme = useTheme();
  const diameter = size + 20;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: diameter,
          height: diameter,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: theme.radius.full,
          opacity: pressed ? 0.6 : 1,
        },
        variant === "surface" && {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        // Sobre fotografía: fondo claro translúcido para garantizar contraste.
        variant === "floating" && {
          backgroundColor: "rgba(255, 253, 250, 0.92)",
          ...theme.shadow.card,
        },
        style,
      ]}
    >
      <Feather
        name={name}
        size={size}
        color={color ?? (variant === "floating" ? "#1C1917" : theme.colors.ink)}
      />
    </Pressable>
  );
}
