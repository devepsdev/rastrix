import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { Pressable } from "react-native";

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: 9,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        backgroundColor: selected ? theme.colors.accentSoft : theme.colors.surface,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text variant="captionMedium" color={selected ? "accent" : "inkMuted"}>
        {label}
      </Text>
    </Pressable>
  );
}
