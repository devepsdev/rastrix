import { ApiError } from "@/api/client";

/** Mensaje general y errores por campo listos para mostrar en un formulario. */
export function describeError(cause: unknown): { message: string; fields: Record<string, string> } {
  if (cause instanceof ApiError) {
    return { message: cause.message, fields: cause.errores ?? {} };
  }
  return { message: "No hemos podido conectar con el servidor. Inténtalo de nuevo.", fields: {} };
}
