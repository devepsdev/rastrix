import { DayOfWeek, MarketFrequency, SuggestionStatus } from '../models/api.model';

export const FREQUENCIES: { value: MarketFrequency; label: string }[] = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'diario', label: 'Diario' },
  { value: 'puntual', label: 'Puntual (fechas concretas)' },
];

export const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

export const SUGGESTION_STATUS_LABELS: Record<SuggestionStatus, string> = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
};

const DAY_PLURAL: Record<DayOfWeek, string> = {
  lunes: 'lunes', martes: 'martes', miercoles: 'miércoles', jueves: 'jueves',
  viernes: 'viernes', sabado: 'sábados', domingo: 'domingos',
};

/** "09:00:00" -> "9:00". */
export function shortTime(value: string | null): string | null {
  if (!value) return null;
  const [hours, minutes] = value.split(':');
  return hours !== undefined && minutes !== undefined ? `${Number(hours)}:${minutes}` : null;
}

/** Frase corta de periodicidad para listados: "Semanal · domingos", "18 sept – 27 sept". */
export function scheduleLabel(item: {
  frequency: MarketFrequency | null;
  dayOfWeek: DayOfWeek | null;
  startDate: string | null;
  endDate: string | null;
}): string {
  if (item.frequency === 'puntual') {
    if (!item.startDate) return 'Puntual · sin fecha';
    const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('es', { day: 'numeric', month: 'short' });
    return item.endDate && item.endDate !== item.startDate ? `${fmt(item.startDate)} – ${fmt(item.endDate)}` : fmt(item.startDate);
  }
  const label = FREQUENCIES.find((f) => f.value === item.frequency)?.label ?? 'Sin periodicidad';
  return item.dayOfWeek ? `${label} · ${DAY_PLURAL[item.dayOfWeek]}` : label;
}
