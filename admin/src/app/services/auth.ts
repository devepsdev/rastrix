import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  firstValueFrom,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { AuthResponse, UserResponse } from '../models/api.model';

const ACCESS_KEY = 'rastrix.admin.accessToken';
const REFRESH_KEY = 'rastrix.admin.refreshToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly user = signal<UserResponse | null>(null);
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  private refreshInFlight: Observable<string> | null = null;

  accessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  login(email: string, password: string): Observable<UserResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password }).pipe(
      tap((auth) => this.storeTokens(auth)),
      switchMap(() => this.http.get<UserResponse>('/api/users/me')),
      switchMap((user) => {
        // El login lo acepta cualquier cuenta; el panel solo es para ADMIN.
        if (user.role !== 'ADMIN') {
          this.clearSession(true);
          return throwError(() => new Error('Esta cuenta no tiene permisos de administración.'));
        }
        this.user.set(user);
        return of(user);
      }),
    );
  }

  /** Al arrancar: si hay tokens guardados, comprueba que siguen valiendo y que la cuenta sigue siendo ADMIN. */
  restoreSession(): Promise<void> {
    if (!this.accessToken()) {
      return Promise.resolve();
    }
    return firstValueFrom(
      this.http.get<UserResponse>('/api/users/me').pipe(
        tap((user) => (user.role === 'ADMIN' ? this.user.set(user) : this.clearSession(true))),
        map(() => undefined),
        catchError(() => {
          this.clearSession(false);
          return of(undefined);
        }),
      ),
    );
  }

  /**
   * Renueva el access token. Varias peticiones que reciben 401 a la vez
   * comparten la misma renovación: el backend rota el refresh token en cada
   * uso y una segunda llamada en paralelo lo encontraría ya revocado.
   */
  refreshAccessToken(): Observable<string> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('No hay sesión que renovar.'));
    }
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.http.post<AuthResponse>('/api/auth/refresh', { refreshToken }).pipe(
        tap((auth) => this.storeTokens(auth)),
        map((auth) => auth.accessToken),
        finalize(() => (this.refreshInFlight = null)),
        shareReplay(1),
      );
    }
    return this.refreshInFlight;
  }

  logout(): void {
    this.clearSession(true);
    this.router.navigate(['/login']);
  }

  /** La sesión ya no se puede renovar: vuelta al login avisando del motivo. */
  expireSession(): void {
    this.clearSession(false);
    if (this.router.navigated) {
      this.router.navigate(['/login'], { queryParams: { caducada: 1 } });
    }
  }

  private storeTokens(auth: AuthResponse): void {
    localStorage.setItem(ACCESS_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_KEY, auth.refreshToken);
  }

  private clearSession(revokeOnServer: boolean): void {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.user.set(null);
    if (revokeOnServer && refreshToken) {
      // Sin esperar: la sesión local ya está cerrada aunque esto falle.
      this.http.post('/api/auth/logout', { refreshToken }).subscribe({ error: () => undefined });
    }
  }
}
