import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";

type Mode = "login" | "registro";

export default function AccessScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isLogin = mode === "login";

  // Se puede llegar aquí por enlace directo, sin pantalla anterior a la que volver.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

  const switchMode = () => {
    setMode(isLogin ? "registro" : "login");
    setError(null);
    setFieldErrors({});
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      if (isLogin) {
        await login({ email: email.trim(), password });
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          active: true,
        });
      }
      goBack();
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
        setFieldErrors(cause.errores ?? {});
      } else {
        setError("No hemos podido conectar con el servidor. Inténtalo de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && (isLogin || name.trim().length > 0);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: theme.screenPadding,
            paddingBottom: theme.spacing.huge,
          }}
        >
          <IconButton
            name="arrow-left"
            accessibilityLabel="Volver"
            onPress={goBack}
            style={{ marginLeft: -10 }}
          />

          <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xl }}>
            <Text variant="overline" color="accent">
              {isLogin ? "Bienvenido de nuevo" : "Únete a Rastrix"}
            </Text>
            <Text variant="display">{isLogin ? "Inicia sesión" : "Crea tu cuenta"}</Text>
            <Text variant="body" color="inkMuted">
              {isLogin
                ? "Accede para guardar favoritos y valorar los mercados que visitas."
                : "Solo necesitas un correo. Es gratis y tardas menos de un minuto."}
            </Text>
          </View>

          <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.xxxl }}>
            {!isLogin ? (
              <Input
                label="Nombre"
                icon="user"
                placeholder="Tu nombre"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                error={fieldErrors.name}
              />
            ) : null}

            <Input
              label="Correo electrónico"
              icon="mail"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={fieldErrors.email}
            />

            <Input
              label="Contraseña"
              icon="lock"
              placeholder={isLogin ? "Tu contraseña" : "Mínimo 8 caracteres"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              error={fieldErrors.password}
            />

            {isLogin ? (
              <Pressable
                onPress={() => router.push("/recuperar")}
                style={({ pressed }) => ({ alignSelf: "flex-end", opacity: pressed ? 0.6 : 1 })}
              >
                <Text variant="captionMedium" color="accent">
                  ¿Has olvidado tu contraseña?
                </Text>
              </Pressable>
            ) : null}

            {error ? (
              <Text variant="caption" color="danger">
                {error}
              </Text>
            ) : null}

            <Button
              label={isLogin ? "Entrar" : "Crear cuenta"}
              size="lg"
              fullWidth
              loading={submitting}
              disabled={!canSubmit}
              onPress={submit}
              style={{ marginTop: theme.spacing.sm }}
            />
          </View>

          <Pressable
            onPress={switchMode}
            style={({ pressed }) => ({
              marginTop: theme.spacing.xxl,
              alignItems: "center",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text variant="caption" color="inkMuted">
              {isLogin ? "¿Todavía no tienes cuenta? " : "¿Ya tienes cuenta? "}
              <Text variant="captionMedium" color="accent">
                {isLogin ? "Regístrate" : "Inicia sesión"}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
