import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { StatsResponse } from '../models/api.model';

/**
 * Contadores compartidos: los usa la portada y también las insignias del menú
 * lateral, así que se guardan en un signal y cualquier pantalla que cambie algo
 * relevante pide refrescarlos.
 */
@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);

  readonly stats = signal<StatsResponse | null>(null);

  refresh(): void {
    this.http.get<StatsResponse>('/api/admin/stats').subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => undefined,
    });
  }
}
