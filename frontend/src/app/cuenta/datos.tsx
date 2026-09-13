import * as usersApi from "@/api/users";
import { useAuth } from "@/auth/AuthContext";
import { FormScreen } from "@/components/FormScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { describeError } from "@/lib/errors";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  const changed = name.trim() !== user.name || email.trim().toLowerCase() !== user.email.toLowerCase();
  const canSave = changed && name.trim().length > 0 && email.trim().length > 0;

  const save = async () => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      await usersApi.updateMyProfile({ name: name.trim(), email: email.trim(), avatarUrl: user.avatarUrl });
      // Si ha cambiado el email, el token actual deja de valer: la API responde 401
      // y el cliente lo renueva solo antes de devolver el perfil nuevo.
      await refreshProfile();
      router.back();
    } catch (cause) {
      const { message, fields } = describeError(cause);
      setError(message);
      setFieldErrors(fields);
      setSaving(false);
    }
  };

  return (
    <FormScreen
      eyebrow="Tu cuenta"
      title="Datos personales"
      intro="Tu nombre aparece junto a las valoraciones que publicas."
    >
      <Input
        label="Nombre"
        icon="user"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        maxLength={100}
        error={fieldErrors.name}
      />
      <Input
        label="Correo electrónico"
        icon="mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        maxLength={150}
        error={fieldErrors.email}
      />

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}

      <Button label="Guardar cambios" size="lg" fullWidth loading={saving} disabled={!canSave} onPress={save} />
    </FormScreen>
  );
}
