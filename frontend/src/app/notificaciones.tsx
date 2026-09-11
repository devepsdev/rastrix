import * as notificationsApi from "@/api/notifications";
import { useAuth } from "@/auth/AuthContext";
import { Divider } from "@/components/ui/Divider";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAsync } from "@/lib/useAsync";
import { useTheme } from "@/theme";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const notifications = useAsync(
    () => (isAuthenticated ? notificationsApi.findMine() : Promise.resolve([])),
    [isAuthenticated]
  );

  const markAsRead = async (id: number) => {
    await notificationsApi.markAsRead(id);
    notifications.reload();
  };

  return (
    <Screen>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
          paddingHorizontal: theme.screenPadding,
          paddingBottom: theme.spacing.lg,
        }}
      >
        <IconButton
          name="arrow-left"
          accessibilityLabel="Volver"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          style={{ marginLeft: -10 }}
        />
        <Text variant="title1">Notificaciones</Text>
      </View>

      {!isAuthenticated ? (
        <EmptyState
          icon="bell"
          title="Inicia sesión para ver tus avisos"
          actionLabel="Iniciar sesión"
          onAction={() => router.push("/acceso")}
        />
      ) : !notifications.loading && (notifications.data ?? []).length === 0 ? (
        <EmptyState
          icon="bell"
          title="No tienes notificaciones"
          message="Te avisaremos cuando haya novedades en los mercados que sigues."
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.screenPadding,
            paddingBottom: theme.spacing.huge,
          }}
        >
          {(notifications.data ?? []).map((notification, index) => (
            <View key={notification.id}>
              {index > 0 ? <Divider /> : null}
              <Pressable
                onPress={() => (notification.read ? undefined : markAsRead(notification.id))}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  gap: theme.spacing.md,
                  paddingVertical: theme.spacing.lg,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: theme.radius.full,
                    marginTop: 7,
                    backgroundColor: notification.read ? "transparent" : theme.colors.accent,
                  }}
                />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text variant="bodyMedium">{notification.title}</Text>
                  {notification.message ? (
                    <Text variant="caption" color="inkMuted">
                      {notification.message}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
