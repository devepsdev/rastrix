import { useColorScheme } from "react-native";
import { darkColors, lightColors, type ThemeColors } from "./colors";
import { radius, screenPadding, shadow, spacing } from "./layout";
import { fontFamily, typography } from "./typography";

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadow;
  typography: typeof typography;
  fontFamily: typeof fontFamily;
  screenPadding: typeof screenPadding;
}

const base = { spacing, radius, shadow, typography, fontFamily, screenPadding };

export const lightTheme: Theme = { ...base, colors: lightColors, isDark: false };
export const darkTheme: Theme = { ...base, colors: darkColors, isDark: true };

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? darkTheme : lightTheme;
}

export { darkColors, lightColors, radius, screenPadding, shadow, spacing, typography, fontFamily };
export type { ThemeColors };
export type { TypographyVariant } from "./typography";
