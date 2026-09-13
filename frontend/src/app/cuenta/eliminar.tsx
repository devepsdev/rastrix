import * as usersApi from "@/api/users";
import { useAuth } from "@/auth/AuthContext";
import { FormScreen } from "@/components/FormScreen";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { describeError } from "@/lib/errors";
import { useTheme } from "@/theme";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

const DELETED = [
  "Tus datos de acceso: nombre, correo y contraseña",
  "Tus mercados favoritos",
  "Tus valoraciones y comentarios",
  "Tus sugerencias de mercados y tus notificaciones",
];

export default function DeleteAccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const remove = async () => {
    setDeleting(true);
    setError(null);
    try {
      await usersApi.deleteMyAccount();
    } catch (cause) {
      setError(describeError(cause).message);
      setDeleting(false);
      return;
    }
    await logout();
    if (router.canDismiss()) router.dismissAll();
    router.replace("/");
    Alert.alert("Cuenta eliminada", "Hemos borrado tu cuenta y todos tus datos. Gracias por usar Rastrix.");
  };

  const confirm = () => {
    Alert.alert("¿Eliminar tu cuenta?", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: remove },
    ]);
  };

  return (
    <FormScreen
      eyebrow="Tu cuenta"
      title="Eliminar cuenta"
      intro={`Se borrará la cuenta de ${user.email} de forma permanente. No podremos recuperarla.`}
    >
      <View
        style={{
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Text variant="overline" color="inkFaint">
          Se borrará
        </Text>
        {DELETED.map((item) => (
          <View key={item} style={{ flexDirection: "row", gap: theme.spacing.md }}>
            <Feather name="x" size={16} color={theme.colors.danger} style={{ marginTop: 2 }} />
            <Text variant="body" color="inkMuted" style={{ flex: 1 }}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      <Text variant="caption" color="inkFaint">
        Los mercados que sugeriste y ya están publicados seguirán en Rastrix, sin ningún dato tuyo.
      </Text>

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}

      <Button label="Eliminar mi cuenta" size="lg" fullWidth loading={deleting} onPress={confirm} />
    </FormScreen>
  );
}
