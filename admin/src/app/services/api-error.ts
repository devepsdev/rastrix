import { HttpErrorResponse } from '@angular/common/http';

export interface ApiProblem {
  status: number;
  message: string;
  /** Errores de validación por campo, tal como los devuelve GlobalExceptionHandler. */
  fieldErrors: Record<string, string>;
}

export function toApiProblem(error: unknown): ApiProblem {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return { status: 0, message: 'No hay conexión con el servidor.', fieldErrors: {} };
    }
    const body = error.error as { mensaje?: string; errores?: Record<string, string> } | null;
    return {
      status: error.status,
      message: body?.mensaje ?? 'Ha ocurrido un error inesperado.',
      fieldErrors: body?.errores ?? {},
    };
  }
  return {
    status: -1,
    message: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.',
    fieldErrors: {},
  };
}
