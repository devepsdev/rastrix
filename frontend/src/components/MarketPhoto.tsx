import { useTheme } from "@/theme";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { StyleSheet, View, type ViewStyle } from "react-native";

interface MarketPhotoProps {
  uri: string | null;
  radius?: number;
  style?: ViewStyle;
}

/**
 * Foto de mercado con marco interior de 1px, que separa la imagen del fondo
 * como una lámina montada y evita que las fotos claras se fundan con el papel.
 */
export function MarketPhoto({ uri, radius = 0, style }: MarketPhotoProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        { backgroundColor: theme.colors.surfaceSunken, borderRadius: radius, overflow: "hidden" },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={uri}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={220}
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Feather name="image" size={22} color={theme.colors.inkFaint} />
        </View>
      )}

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            borderWidth: 1,
            borderColor: theme.isDark ? "rgba(255,255,255,0.08)" : "rgba(28,25,23,0.08)",
          },
        ]}
      />
    </View>
  );
}
