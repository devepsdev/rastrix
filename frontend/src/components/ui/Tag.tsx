import { useTheme } from "@/theme";
import { View, type ViewStyle } from "react-native";
import { Text } from "./Text";

type Tone = "neutral" | "accent" | "support" | "onImage";

interface TagProps {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}

/**
 * Etiqueta tipo "sello": microtexto en mayúsculas con mucho espaciado y un
 * borde fino, en vez de una pastilla rellena de color.
 */
export function Tag({ label, tone = "neutral", style }: TagProps) {
  const theme = useTheme();

  const palette: Record<Tone, { bg: string; border: string; text: string }> = {
    neutral: {
      bg: theme.colors.surfaceSunken,
      border: theme.colors.border,
      text: theme.colors.inkMuted,
    },
    accent: {
      bg: theme.colors.accentSoft,
      border: theme.isDark ? theme.colors.accent : "transparent",
      text: theme.colors.accent,
    },
    support: {
      bg: theme.colors.supportSoft,
      border: theme.isDark ? theme.colors.support : "transparent",
      text: theme.colors.support,
    },
    onImage: {
      bg: "rgba(255, 253, 250, 0.92)",
      border: "transparent",
      text: "#1C1917",
    },
  };

  const { bg, border, text } = palette[tone];

  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          paddingHorizontal: 9,
          paddingVertical: 5,
          borderRadius: theme.radius.sm,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
        },
        style,
      ]}
    >
      <Text variant="overline" style={{ color: text }}>
        {label}
      </Text>
    </View>
  );
}
