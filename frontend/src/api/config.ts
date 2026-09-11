/**
 * URL base de la API. Se puede sobrescribir con la variable de entorno
 * EXPO_PUBLIC_API_URL (Expo la incrusta en el bundle en tiempo de compilación),
 * definiéndola en un archivo .env.local (no se sube al repo). Ejemplos:
 *  - Emulador Android (AVD):        EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
 *  - Dispositivo físico / Expo Go:  EXPO_PUBLIC_API_URL=http://<ip-lan-de-tu-pc>:8080
 * Sin la variable, apunta a producción.
 */
const DEFAULT_API_URL = "https://rastrix.deveps.dev";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
