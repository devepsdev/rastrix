import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

/**
 * Añade el token y, si la API responde 401 (token caducado), lo renueva una
 * vez y repite la petición. Si la renovación falla, la sesión se da por
 * terminada.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAuthEndpoint = req.url.startsWith('/api/auth/');
  const token = auth.accessToken();

  const withToken = (value: string) => req.clone({ setHeaders: { Authorization: `Bearer ${value}` } });

  return next(token && !isAuthEndpoint ? withToken(token) : req).pipe(
    catchError((error: unknown) => {
      const expired = error instanceof HttpErrorResponse && error.status === 401;
      if (!expired || isAuthEndpoint || !token) {
        return throwError(() => error);
      }
      return auth.refreshAccessToken().pipe(
        // Este catchError va antes del switchMap a propósito: solo debe cerrar la
        // sesión si falla la renovación, no si falla la petición repetida.
        catchError(() => {
          auth.expireSession();
          return throwError(() => error);
        }),
        switchMap((fresh) => next(withToken(fresh))),
      );
    }),
  );
};
