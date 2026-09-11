import { useAuth } from "@/auth/AuthContext";
import { Divider } from "@/components/ui/Divider";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, View } from "react-native";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <Screen>
      <View style={{ paddingHorizontal: theme.screenPadding, paddingBottom: theme.spacing.xl }}>
        <Text variant="display">Perfil</Text>
      </View>

      {isLoading ? null : !isAuthenticated || !user ? (
        <EmptyState
          icon="user"
          title="Explora sin cuenta, guarda con ella"
          message="Puedes ver todos los mercados sin registrarte. Crea una cuenta para guardar favoritos y valorar."
          actionLabel="Iniciar sesión"
          onAction={() => router.push("/acceso")}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.screenPadding,
            paddingBottom: theme.spacing.huge,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.lg,
              padding: theme.spacing.lg,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: theme.radius.full,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.accentSoft,
              }}
            >
              <Text variant="title1" color="accent">
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="title3" numberOfLines={1}>
                {user.name}
              </Text>
              <Text variant="caption" color="inkMuted" numberOfLines={1}>
                {user.email}
              </Text>
            </View>

            {user.role === "ADMIN" ? <Tag label="Admin" tone="accent" /> : null}
          </View>

          <View style={{ marginTop: theme.spacing.xxl }}>
            <MenuRow
              icon="bell"
              label="Notificaciones"
              onPress={() => router.push("/notificaciones")}
            />
            <Divider />
            <MenuRow icon="log-out" label="Cerrar sesión" destructive onPress={confirmLogout} />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

function MenuRow({
  icon,
  label,
  destructive,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const color = destructive ? theme.colors.danger : theme.colors.ink;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Feather name={icon} size={18} color={color} />
      <Text variant="bodyMedium" style={{ flex: 1, color }}>
        {label}
      </Text>
      {!destructive ? (
        <Feather name="chevron-right" size={18} color={theme.colors.inkFaint} />
      ) : null}
    </Pressable>
  );
}
