import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { scheduleLabel } from '../../../core/labels';
import { MarketResponse, PageResponse } from '../../../models/api.model';
import { toApiProblem } from '../../../services/api-error';
import { MarketService } from '../../../services/market';
import { NotifyService } from '../../../services/notify';
import { StatsService } from '../../../services/stats';
import { Pagination } from '../../shared/pagination/pagination';

type StatusFilter = 'todos' | 'publicados' | 'ocultos';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-market-list',
  imports: [RouterLink, DatePipe, Pagination],
  templateUrl: './market-list.html',
})
export class MarketList {
  private markets = inject(MarketService);
  private notify = inject(NotifyService);
  private stats = inject(StatsService);
  private router = inject(Router);

  protected readonly tabs: { value: StatusFilter; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'publicados', label: 'Publicados' },
    { value: 'ocultos', label: 'Ocultos' },
  ];

  protected readonly status = signal<StatusFilter>('todos');
  protected readonly query = signal('');
  protected readonly page = signal(0);
  protected readonly result = signal<PageResponse<MarketResponse> | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busyId = signal<number | null>(null);
  protected readonly scheduleLabel = scheduleLabel;

  private readonly search$ = new Subject<string>();

  constructor() {
    const destroyRef = inject(DestroyRef);

    // La URL es la fuente de verdad: así el enlace de la portada (?estado=ocultos)
    // y el botón atrás del navegador funcionan sin estado duplicado.
    inject(ActivatedRoute)
      .queryParamMap.pipe(takeUntilDestroyed(destroyRef))
      .subscribe((params) => {
        const estado = params.get('estado');
        this.status.set(estado === 'publicados' || estado === 'ocultos' ? estado : 'todos');
        this.query.set(params.get('q') ?? '');
        this.page.set(Math.max(0, Number(params.get('pagina') ?? 1) - 1));
        this.load();
      });

    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(destroyRef))
      .subscribe((q) => this.navigate({ q: q || null, pagina: null }));
  }

  protected setStatus(value: StatusFilter): void {
    this.navigate({ estado: value === 'todos' ? null : value, pagina: null });
  }

  protected onSearch(value: string): void {
    this.search$.next(value.trim());
  }

  protected goToPage(page: number): void {
    this.navigate({ pagina: page === 0 ? null : page + 1 });
  }

  protected toggleActive(market: MarketResponse, event: Event): void {
    event.stopPropagation();
    this.busyId.set(market.id);
    this.markets.setActive(market, !market.active).subscribe({
      next: (updated) => {
        this.notify.success(updated.active ? `«${updated.name}» publicado.` : `«${updated.name}» ocultado.`);
        this.busyId.set(null);
        this.stats.refresh();
        this.load();
      },
      error: (cause: unknown) => {
        this.notify.error(toApiProblem(cause).message);
        this.busyId.set(null);
      },
    });
  }

  protected open(market: MarketResponse): void {
    this.router.navigate(['/mercados', market.id]);
  }

  private navigate(changes: Record<string, string | number | null>): void {
    this.router.navigate([], { queryParams: changes, queryParamsHandling: 'merge', replaceUrl: true });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    const active = this.status() === 'todos' ? null : this.status() === 'publicados';

    this.markets.search({ active, query: this.query(), page: this.page(), size: PAGE_SIZE }).subscribe({
      next: (page) => {
        this.result.set(page);
        this.loading.set(false);
      },
      error: (cause: unknown) => {
        this.error.set(toApiProblem(cause).message);
        this.loading.set(false);
      },
    });
  }
}
