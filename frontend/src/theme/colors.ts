/**
 * Paleta "editorial vintage": fondos de papel, tinta cálida, acentos terracota
 * y verde inglés. El latón se reserva para detalles (estrellas, destacados).
 */

export interface ThemeColors {
  /** Fondo general de pantalla. */
  background: string;
  /** Tarjetas y superficies elevadas. */
  surface: string;
  /** Superficies hundidas: campos de texto, skeletons, celdas de info. */
  surfaceSunken: string;
  /** Texto principal. */
  ink: string;
  /** Texto secundario. */
  inkMuted: string;
  /** Texto terciario, metadatos. */
  inkFaint: string;
  /** Texto sobre fondos oscuros o de acento. */
  inkInverse: string;
  /** Líneas de 1px, separadores, bordes de tarjeta. */
  border: string;
  /** Bordes con más presencia (inputs enfocados, chips activos). */
  borderStrong: string;
  /** Acento principal: terracota. */
  accent: string;
  /** Fondo tintado del acento, para chips y estados seleccionados. */
  accentSoft: string;
  /** Acento secundario: verde inglés. */
  support: string;
  /** Fondo tintado del verde. */
  supportSoft: string;
  /** Latón: estrellas de valoración y detalles destacados. */
  brass: string;
  /** Errores y acciones destructivas. */
  danger: string;
  /** Velo oscuro sobre fotografías, de transparente a opaco. */
  scrimFrom: string;
  scrimTo: string;
}

export const lightColors: ThemeColors = {
  background: "#FAF7F2",
  surface: "#FFFFFF",
  surfaceSunken: "#F2EDE4",
  ink: "#1C1917",
  inkMuted: "#6B6259",
  inkFaint: "#9A9087",
  inkInverse: "#FDFBF7",
  border: "#E7DFD3",
  borderStrong: "#CFC4B4",
  accent: "#B4532A",
  accentSoft: "#F7E9E1",
  support: "#2F4F3A",
  supportSoft: "#E6EDE7",
  brass: "#B8901F",
  danger: "#A32B20",
  scrimFrom: "rgba(20, 15, 10, 0)",
  scrimTo: "rgba(20, 15, 10, 0.82)",
};

export const darkColors: ThemeColors = {
  background: "#14120F",
  surface: "#1E1B17",
  surfaceSunken: "#272320",
  ink: "#F5F0E8",
  inkMuted: "#ABA196",
  inkFaint: "#7D7469",
  inkInverse: "#14120F",
  border: "#332E27",
  borderStrong: "#4A4339",
  accent: "#E08053",
  accentSoft: "#2E211A",
  support: "#7FAE8D",
  supportSoft: "#1C2620",
  brass: "#D4B04A",
  danger: "#E0705F",
  scrimFrom: "rgba(0, 0, 0, 0)",
  scrimTo: "rgba(0, 0, 0, 0.86)",
};
