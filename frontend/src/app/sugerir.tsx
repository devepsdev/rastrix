import { ApiError } from "@/api/client";
import * as suggestionsApi from "@/api/suggestions";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { useAsync } from "@/lib/useAsync";
import { useTheme } from "@/theme";
import type { DayOfWeek, MarketFrequency, SuggestionResponse, SuggestionStatus } from "@/types/dto";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";

const FREQUENCIES: { value: MarketFrequency; label: string }[] = [
  { value: "semanal", label: "Semanal" },
  { value: "quincenal", label: "Quincenal" },
  { value: "mensual", label: "Mensual" },
  { value: "diario", label: "Diario" },
  { value: "puntual", label: "Fechas concretas" },
];

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: "lunes", label: "Lun" },
  { value: "martes", label: "Mar" },
  { value: "miercoles", label: "Mié" },
  { value: "jueves", label: "Jue" },
  { value: "viernes", label: "Vie" },
  { value: "sabado", label: "Sáb" },
  { value: "domingo", label: "Dom" },
];

const STATUS: Record<SuggestionStatus, { label: string; tone: "neutral" | "support" | "accent" }> = {
  PENDIENTE: { label: "En revisión", tone: "neutral" },
  APROBADA: { label: "Publicado", tone: "support" },
  RECHAZADA: { label: "No publicado", tone: "accent" },
};

/** "31/12/2026" -> "2026-12-31"; null si no es una fecha válida. */
function parseDate(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const iso = `${year}-${month!.padStart(2, "0")}-${day!.padStart(2, "0")}`;
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) || date.getDate() !== Number(day) ? null : iso;
}

/** "9:00" | "09:00" -> "09:00"; null si no es una hora válida. */
function parseTime(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? `${String(hours).padStart(2, "0")}:${match[2]}` : null;
}

export default function SuggestMarketScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const mine = useAsync(
    () => (isAuthenticated ? suggestionsApi.findMine() : Promise.resolve([] as SuggestionResponse[])),
    [isAuthenticated]
  );

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [address, setAddress] = useState("");
  const [frequency, setFrequency] = useState<MarketFrequency | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [comment, setComment] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/perfil"));
  const isOneOff = frequency === "puntual";

  const reset = () => {
    setName(""); setCity(""); setProvince(""); setAddress("");
    setFrequency(null); setDayOfWeek(null);
    setStartDate(""); setEndDate(""); setStartTime(""); setEndTime("");
    setDescription(""); setContact(""); setComment("");
    setErrors({}); setFormError(null);
  };

  const submit = async () => {
    const found: Record<string, string> = {};
    if (!name.trim()) found.name = "Dinos cómo se llama.";
    if (!city.trim()) found.city = "Indica la ciudad o el pueblo.";

    const isoStart = startDate.trim() ? parseDate(startDate) : null;
    const isoEnd = endDate.trim() ? parseDate(endDate) : null;
    if (isOneOff && startDate.trim() && !isoStart) found.startDate = "Usa el formato DD/MM/AAAA.";
    if (isOneOff && endDate.trim() && !isoEnd) found.endDate = "Usa el formato DD/MM/AAAA.";

    const opens = startTime.trim() ? parseTime(startTime) : null;
    const closes = endTime.trim() ? parseTime(endTime) : null;
    if (startTime.trim() && !opens) found.startTime = "Usa el formato 9:00.";
    if (endTime.trim() && !closes) found.endTime = "Usa el formato 14:00.";

    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    const clean = (text: string) => text.trim() || null;
    setSubmitting(true);
    try {
      await suggestionsApi.create({
        name: name.trim(),
        city: city.trim(),
        province: clean(province),
        address: clean(address),
        frequency,
        dayOfWeek: isOneOff ? null : dayOfWeek,
        startDate: isOneOff ? isoStart : null,
        endDate: isOneOff ? isoEnd : null,
        startTime: opens,
        endTime: closes,
        description: clean(description),
        contact: clean(contact),
        comment: clean(comment),
      });
      reset();
      setSent(true);
      mine.reload();
    } catch (cause) {
      if (cause instanceof ApiError) {
        setFormError(cause.message);
        setErrors(cause.errores ?? {});
      } else {
        setFormError("No hemos podido conectar con el servidor. Inténtalo de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const header = (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: theme.screenPadding }}>
      <IconButton name="arrow-left" accessibilityLabel="Volver" onPress={goBack} style={{ marginLeft: -10 }} />
    </View>
  );

  if (!isAuthenticated) {
    return (
      <Screen>
        {header}
        <EmptyState
          icon="map-pin"
          title="Inicia sesión para sugerir mercados"
          message="Así podemos avisarte cuando lo publiquemos."
          actionLabel="Iniciar sesión"
          onAction={() => router.push("/acceso")}
        />
      </Screen>
    );
  }

  if (sent) {
    return (
      <Screen>
        {header}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: theme.screenPadding, gap: theme.spacing.lg }}>
          <View
            style={{
              width: 72, height: 72, borderRadius: theme.radius.full,
              alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.supportSoft,
            }}
          >
            <Text variant="title1" color="support">✓</Text>
          </View>
          <Text variant="title1" center>¡Gracias por la pista!</Text>
          <Text variant="body" color="inkMuted" center style={{ maxWidth: 300 }}>
            Revisaremos los datos y, si todo cuadra, lo publicaremos para que lo descubra todo el mundo.
          </Text>
          <Button label="Sugerir otro" variant="secondary" onPress={() => setSent(false)} />
          <Button label="Volver" variant="ghost" onPress={goBack} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: theme.spacing.huge }}
        >
          {header}

          <View style={{ paddingHorizontal: theme.screenPadding, gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
            <Text variant="overline" color="accent">Comunidad</Text>
            <Text variant="display">Sugerir un mercado</Text>
            <Text variant="body" color="inkMuted">
              ¿Conoces uno que no está en Rastrix? Cuéntanos lo que sepas. Lo revisamos antes de publicarlo.
            </Text>
          </View>

          <View style={{ paddingHorizontal: theme.screenPadding, gap: theme.spacing.lg, marginTop: theme.spacing.xxl }}>
            <Input label="Nombre del mercado *" placeholder="Rastro de…" value={name} onChangeText={setName} error={errors.name} />
            <Input label="Ciudad o pueblo *" value={city} onChangeText={setCity} error={errors.city} />
            <Input label="Provincia" value={province} onChangeText={setProvince} error={errors.province} />
            <Input label="Dirección o lugar" placeholder="Plaza Mayor" value={address} onChangeText={setAddress} error={errors.address} />

            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="overline" color="inkFaint">¿Cada cuánto se celebra?</Text>
              <ChipGroup
                options={FREQUENCIES}
                selected={frequency}
                onSelect={(value) => setFrequency(frequency === value ? null : value)}
              />
            </View>

            {isOneOff ? (
              <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
                <Input label="Desde" placeholder="DD/MM/AAAA" keyboardType="numbers-and-punctuation" value={startDate} onChangeText={setStartDate} error={errors.startDate} containerStyle={{ flex: 1 }} />
                <Input label="Hasta" placeholder="DD/MM/AAAA" keyboardType="numbers-and-punctuation" value={endDate} onChangeText={setEndDate} error={errors.endDate} containerStyle={{ flex: 1 }} />
              </View>
            ) : frequency ? (
              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="overline" color="inkFaint">¿Qué día?</Text>
                <ChipGroup
                  options={DAYS}
                  selected={dayOfWeek}
                  onSelect={(value) => setDayOfWeek(dayOfWeek === value ? null : value)}
                />
              </View>
            ) : null}

            <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
              <Input label="Abre" placeholder="9:00" keyboardType="numbers-and-punctuation" value={startTime} onChangeText={setStartTime} error={errors.startTime} containerStyle={{ flex: 1 }} />
              <Input label="Cierra" placeholder="14:00" keyboardType="numbers-and-punctuation" value={endTime} onChangeText={setEndTime} error={errors.endTime} containerStyle={{ flex: 1 }} />
            </View>

            <Input label="¿Qué se encuentra?" placeholder="Muebles, vinilos, cerámica…" multiline value={description} onChangeText={setDescription} error={errors.description} maxLength={2000} />
            <Input label="Web o contacto" placeholder="Web, teléfono o correo del organizador" value={contact} onChangeText={setContact} error={errors.contact} autoCapitalize="none" maxLength={255} />
            <Input label="Algo más que debamos saber" placeholder="Por ejemplo: en agosto no se celebra" multiline value={comment} onChangeText={setComment} error={errors.comment} maxLength={1000} />

            {formError ? <Text variant="caption" color="danger">{formError}</Text> : null}

            <Button label="Enviar sugerencia" size="lg" fullWidth loading={submitting} onPress={submit} />
          </View>

          {mine.data && mine.data.length > 0 ? (
            <View style={{ paddingHorizontal: theme.screenPadding, marginTop: theme.spacing.huge }}>
              <Text variant="title2" style={{ marginBottom: theme.spacing.md }}>Tus sugerencias</Text>
              {mine.data.map((item, index) => (
                <View key={item.id}>
                  {index > 0 ? <Divider /> : null}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md, paddingVertical: theme.spacing.md }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="bodyMedium" numberOfLines={1}>{item.name}</Text>
                      <Text variant="caption" color="inkMuted">{item.city}</Text>
                      {item.status === "RECHAZADA" && item.rejectionReason ? (
                        <Text variant="caption" color="inkFaint">{item.rejectionReason}</Text>
                      ) : null}
                    </View>
                    <Tag label={STATUS[item.status].label} tone={STATUS[item.status].tone} />
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function ChipGroup<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={({ pressed }) => ({
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: 9,
              borderRadius: theme.radius.full,
              borderWidth: 1,
              borderColor: active ? theme.colors.accent : theme.colors.border,
              backgroundColor: active ? theme.colors.accentSoft : theme.colors.surface,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text variant="captionMedium" color={active ? "accent" : "inkMuted"}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
