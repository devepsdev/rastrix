import type { DayOfWeek, MarketResponse } from "@/types/dto";

const DAY_SINGULAR: Record<DayOfWeek, string> = {
  lunes: "lunes",
  martes: "martes",
  miercoles: "miércoles",
  jueves: "jueves",
  viernes: "viernes",
  sabado: "sábado",
  domingo: "domingo",
};

const DAY_PLURAL: Record<DayOfWeek, string> = {
  lunes: "lunes",
  martes: "martes",
  miercoles: "miércoles",
  jueves: "jueves",
  viernes: "viernes",
  sabado: "sábados",
  domingo: "domingos",
};

const MONTH_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "09:00:00" | "09:00" -> "9:00". Devuelve null si no hay hora. */
function formatTime(value: string | null): string | null {
  if (!value) return null;
  const [hours, minutes] = value.split(":");
  if (hours === undefined || minutes === undefined) return null;
  return `${Number(hours)}:${minutes}`;
}

/** "9:00 – 14:00", o solo la hora de apertura si no hay cierre. */
export function formatTimeRange(startTime: string | null, endTime: string | null): string | null {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  if (!start) return null;
  return end ? `${start} – ${end}` : `Desde las ${start}`;
}

/** "2026-03-15" -> "15 mar". */
function formatDate(value: string): string | null {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

/** "15 – 17 mar" cuando hay rango, "15 mar" cuando es un solo día. */
export function formatDateRange(startDate: string | null, endDate: string | null): string | null {
  if (!startDate) return null;
  const start = formatDate(startDate);
  if (!start) return null;
  if (!endDate || endDate === startDate) return start;
  const end = formatDate(endDate);
  return end ? `${start} – ${end}` : start;
}

/** Frase corta con la periodicidad: "Cada domingo", "Mensual · domingos", "15 – 17 mar". */
export function formatSchedule(market: MarketResponse): string {
  const { frequency, dayOfWeek } = market;

  switch (frequency) {
    case "diario":
      return "Todos los días";
    case "semanal":
      return dayOfWeek ? `Cada ${DAY_SINGULAR[dayOfWeek]}` : "Todas las semanas";
    case "quincenal":
      return dayOfWeek ? `Quincenal · ${DAY_PLURAL[dayOfWeek]}` : "Cada quince días";
    case "mensual":
      return dayOfWeek ? `Mensual · ${DAY_PLURAL[dayOfWeek]}` : "Una vez al mes";
    case "puntual":
      return formatDateRange(market.startDate, market.endDate) ?? "Fecha por confirmar";
  }
}

/** "Madrid, Madrid" -> "Madrid". Evita repetir ciudad y provincia homónimas. */
export function formatLocation(market: MarketResponse): string {
  const { city, province } = market;
  if (city && province && city.toLowerCase() !== province.toLowerCase()) {
    return `${city}, ${province}`;
  }
  return city ?? province ?? "Ubicación por confirmar";
}

/** Dirección completa para mostrar y para abrir en una app de mapas. */
export function formatFullAddress(market: MarketResponse): string {
  const sameName = market.city && market.province && market.city.toLowerCase() === market.province.toLowerCase();
  return [market.address, market.postalCode, market.city, sameName ? null : market.province]
    .filter(Boolean)
    .join(", ");
}

/** Aproximación para la sección "Este fin de semana" mientras no haya filtro en la API. */
export function opensThisWeekend(market: MarketResponse): boolean {
  if (market.frequency === "diario") return true;
  if (market.dayOfWeek === "sabado" || market.dayOfWeek === "domingo") return true;

  if (market.frequency === "puntual" && market.startDate) {
    const start = new Date(`${market.startDate}T00:00:00`);
    const daysAway = (start.getTime() - Date.now()) / 86_400_000;
    return daysAway >= -1 && daysAway <= 7;
  }
  return false;
}
