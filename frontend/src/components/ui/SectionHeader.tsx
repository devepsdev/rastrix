import { useTheme } from "@/theme";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, View } from "react-native";
import { Text } from "./Text";

interface SectionHeaderProps {
  /** Microtexto en mayúsculas sobre el título. */
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ eyebrow, title, actionLabel, onAction }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: theme.spacing.lg,
        paddingHorizontal: theme.screenPadding,
        marginBottom: theme.spacing.lg,
      }}
    >
      <View style={{ flex: 1, gap: 3 }}>
        {eyebrow ? (
          <Text variant="overline" color="accent">
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="title2">{title}</Text>
      </View>

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text variant="captionMedium" color="accent">
            {actionLabel}
          </Text>
          <Feather name="chevron-right" size={15} color={theme.colors.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}
