import { useTheme } from "@/theme";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { Text } from "./Text";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  containerStyle?: ViewStyle;
}

export function Input({ label, error, icon, containerStyle, ...rest }: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.accent
      : theme.colors.border;

  return (
    <View style={[{ gap: theme.spacing.sm }, containerStyle]}>
      {label ? (
        <Text variant="overline" color="inkFaint">
          {label}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.md,
          height: 52,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor,
          backgroundColor: theme.colors.surface,
        }}
      >
        {icon ? <Feather name={icon} size={17} color={theme.colors.inkFaint} /> : null}
        <TextInput
          style={[theme.typography.body, { flex: 1, color: theme.colors.ink, padding: 0 }]}
          placeholderTextColor={theme.colors.inkFaint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </View>

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
