import * as usersApi from "@/api/users";
import { useAuth } from "@/auth/AuthContext";
import { FormScreen } from "@/components/FormScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { describeError } from "@/lib/errors";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

const MIN_LENGTH = 8;

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeated, setRepeated] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  const save = async () => {
    const found: Record<string, string> = {};
    if (newPassword.length < MIN_LENGTH) found.newPassword = `Debe tener al menos ${MIN_LENGTH} caracteres.`;
    else if (newPassword === currentPassword) found.newPassword = "Debe ser distinta de la actual.";
    if (repeated !== newPassword) found.repeated = "Las contraseñas no coinciden.";
    setFieldErrors(found);
    setError(null);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await usersApi.changeMyPassword({ currentPassword, newPassword });
    } catch (cause) {
      const { message, fields } = describeError(cause);
      setError(message);
      setFieldErrors(fields);
      setSaving(false);
      return;
    }

    // El servidor cierra todas las sesiones al cambiar la contraseña, también esta.
    // Se vuelve a entrar con la nueva para que el usuario no note nada.
    try {
      await login({ email: user.email, password: newPassword });
    } catch {
      // Sin conexión: la sesión caducará sola y la app pedirá entrar de nuevo.
    }
    Alert.alert("Contraseña cambiada", "Se ha cerrado la sesión en el resto de tus dispositivos.");
    router.back();
  };

  return (
    <FormScreen
      eyebrow="Tu cuenta"
      title="Cambiar contraseña"
      intro="Al cambiarla se cerrará la sesión en el resto de dispositivos."
    >
      <Input
        label="Contraseña actual"
        icon="lock"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        error={fieldErrors.currentPassword}
      />
      <Input
        label="Nueva contraseña"
        icon="key"
        placeholder={`Mínimo ${MIN_LENGTH} caracteres`}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        maxLength={100}
        error={fieldErrors.newPassword}
      />
      <Input
        label="Repite la nueva contraseña"
        icon="key"
        value={repeated}
        onChangeText={setRepeated}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        maxLength={100}
        error={fieldErrors.repeated}
      />

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}

      <Button
        label="Cambiar contraseña"
        size="lg"
        fullWidth
        loading={saving}
        disabled={!currentPassword || !newPassword || !repeated}
        onPress={save}
      />
    </FormScreen>
  );
}
