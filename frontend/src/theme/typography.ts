import type { TextStyle } from "react-native";

/**
 * Fraunces (serif con carácter) para titulares, Inter para todo lo demás.
 * Los nombres coinciden con las claves que registra useFonts en el layout raíz.
 */
export const fontFamily = {
  serif: "Fraunces_600SemiBold",
  serifBold: "Fraunces_700Bold",
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemibold: "Inter_600SemiBold",
} as const;

export type TypographyVariant =
  | "display"
  | "title1"
  | "title2"
  | "title3"
  | "body"
  | "bodyMedium"
  | "caption"
  | "captionMedium"
  /** Microtexto en mayúsculas y espaciado: el "sello" de la identidad. */
  | "overline"
  | "button";

export const typography: Record<TypographyVariant, TextStyle> = {
  display: {
    fontFamily: fontFamily.serifBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  title1: {
    fontFamily: fontFamily.serifBold,
    fontSize: 25,
    lineHeight: 31,
    letterSpacing: -0.4,
  },
  title2: {
    fontFamily: fontFamily.serif,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  title3: {
    fontFamily: fontFamily.serif,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  captionMedium: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  overline: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  button: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
};
