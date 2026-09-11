import { useTheme } from "@/theme";
import Feather from "@expo/vector-icons/Feather";
import { View } from "react-native";
import { Button } from "./Button";
import { Text } from "./Text";

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof Feather>["name"];
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = "compass", title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: theme.spacing.huge,
        paddingHorizontal: theme.screenPadding,
        gap: theme.spacing.md,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: theme.radius.full,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.surfaceSunken,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Feather name={icon} size={26} color={theme.colors.inkFaint} />
      </View>

      <Text variant="title3" center>
        {title}
      </Text>
      {message ? (
        <Text variant="body" color="inkMuted" center style={{ maxWidth: 300 }}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" style={{ marginTop: theme.spacing.sm }} />
      ) : null}
    </View>
  );
}
