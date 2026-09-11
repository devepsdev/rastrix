import { useTheme } from "@/theme";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, View, type ViewStyle } from "react-native";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  /** Icono opcional a la izquierda del texto. */
  icon?: ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  icon,
  fullWidth,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const background = {
    primary: theme.colors.accent,
    secondary: theme.colors.surface,
    ghost: "transparent",
  }[variant];

  const labelColor = variant === "primary" ? "inkInverse" : variant === "ghost" ? "accent" : "ink";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.sm,
          height: size === "lg" ? 54 : 46,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.radius.full,
          backgroundColor: background,
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: theme.colors.borderStrong,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        fullWidth && { alignSelf: "stretch" },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? theme.colors.inkInverse : theme.colors.accent}
        />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          <Text variant="button" color={labelColor}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
