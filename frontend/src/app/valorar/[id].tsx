import * as marketsApi from "@/api/markets";
import * as ratingsApi from "@/api/ratings";
import { useAuth } from "@/auth/AuthContext";
import { FormScreen } from "@/components/FormScreen";
import { StarPicker, scoreLabel } from "@/components/StarPicker";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { describeError } from "@/lib/errors";
import { useAsync } from "@/lib/useAsync";
import { useTheme } from "@/theme";
import type { RatingResponse } from "@/types/dto";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function RateMarketScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const marketId = Number(id);

  const data = useAsync(async () => {
    const [market, ratings] = await Promise.all([
      marketsApi.findById(marketId),
      ratingsApi.findByMarketId(marketId),
    ]);
    return { market, mine: ratings.find((rating) => rating.userId === user?.id) ?? null };
  }, [marketId, user?.id]);

  if (!isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          icon="star"
          title="Inicia sesión para valorar"
          message="Tu opinión ayuda a otros a decidir qué mercado visitar."
          actionLabel="Iniciar sesión"
          onAction={() => router.replace("/acceso")}
        />
      </Screen>
    );
  }

  if (data.loading && !data.data) {
    return (
      <Screen>
        <View style={{ padding: theme.screenPadding, gap: theme.spacing.lg, marginTop: theme.spacing.xxxl }}>
          <Skeleton width={90} height={11} />
          <Skeleton width="80%" height={32} />
          <Skeleton width={220} height={40} />
          <Skeleton height={112} radius={theme.radius.md} />
        </View>
      </Screen>
    );
  }

  if (data.error || !data.data) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle"
          title="No hemos podido cargar el mercado"
          message="Comprueba tu conexión e inténtalo de nuevo."
          actionLabel="Reintentar"
          onAction={data.reload}
        />
      </Screen>
    );
  }

  // Se monta cuando ya se sabe si hay valoración previa, para que el formulario
  // arranque con sus valores sin tener que sincronizar estado después.
  return <RatingForm marketId={marketId} marketName={data.data.market.name} existing={data.data.mine} />;
}

function RatingForm({
  marketId,
  marketName,
  existing,
}: {
  marketId: number;
  marketName: string;
  existing: RatingResponse | null;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [score, setScore] = useState(existing?.score ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => (router.canGoBack() ? router.back() : router.replace(`/mercado/${marketId}`));

  const save = async () => {
    if (!user || score === 0) return;
    setSaving(true);
    setError(null);
    try {
      const body = { userId: user.id, marketId, score, comment: comment.trim() || null };
      if (existing) {
        await ratingsApi.update(existing.id, body);
      } else {
        await ratingsApi.create(body);
      }
      close();
    } catch (cause) {
      setError(describeError(cause).message);
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert("Borrar valoración", "Se quitará tu puntuación y tu comentario de este mercado.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await ratingsApi.remove(existing.id);
            close();
          } catch (cause) {
            setError(describeError(cause).message);
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <FormScreen
      eyebrow={existing ? "Tu valoración" : "Valorar"}
      title={marketName}
      intro="¿Qué tal la experiencia? Piensa en quien va a ir por primera vez."
      fallbackHref={`/mercado/${marketId}`}
    >
      <View style={{ alignItems: "center", gap: theme.spacing.sm, paddingVertical: theme.spacing.md }}>
        <StarPicker value={score} onChange={setScore} />
        <Text variant="captionMedium" color={score ? "brass" : "inkFaint"}>
          {score ? scoreLabel(score) : "Toca una estrella"}
        </Text>
      </View>

      <Input
        label="Comentario (opcional)"
        placeholder="Qué se encuentra, ambiente, precios, cómo aparcar…"
        multiline
        maxLength={1000}
        value={comment}
        onChangeText={setComment}
      />

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}

      <Button
        label={existing ? "Guardar cambios" : "Publicar valoración"}
        size="lg"
        fullWidth
        loading={saving}
        disabled={score === 0}
        onPress={save}
      />

      {existing ? (
        <Button label="Borrar mi valoración" variant="ghost" disabled={saving} onPress={confirmDelete} />
      ) : null}
    </FormScreen>
  );
}
