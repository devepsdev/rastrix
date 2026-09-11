import { useTheme } from "@/theme";
import { View, type ViewStyle } from "react-native";

export function Divider({ style }: { style?: ViewStyle }) {
  const theme = useTheme();
  return <View style={[{ height: 1, backgroundColor: theme.colors.border }, style]} />;
}
