import { Button } from "@/components/ui/Button";
import { useTheme } from "@/theme";
import { ActivityIndicator, View } from "react-native";

/** Pie de una lista paginada: indicador mientras llega la página siguiente o reintento si falló. */
export function ListFooter({
  loading,
  failed,
  onRetry,
}: {
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}) {
  const theme = useTheme();

  if (loading) {
    return (
      <View style={{ paddingVertical: theme.spacing.xl }}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  if (failed) {
    return (
      <View style={{ paddingVertical: theme.spacing.lg, alignItems: "center" }}>
        <Button label="No se han podido cargar más. Reintentar" variant="ghost" onPress={onRetry} />
      </View>
    );
  }

  return null;
}
