import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DAYS, SUGGESTION_STATUS_LABELS, scheduleLabel, shortTime } from '../../../core/labels';
import { PageResponse, SuggestionResponse, SuggestionStatus } from '../../../models/api.model';
import { toApiProblem } from '../../../services/api-error';
import { NotifyService } from '../../../services/notify';
import { StatsService } from '../../../services/stats';
import { SuggestionService } from '../../../services/suggestion';
import { Pagination } from '../../shared/pagination/pagination';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-suggestion-list',
  imports: [RouterLink, DatePipe, Pagination],
  templateUrl: './suggestion-list.html',
})
export class SuggestionList {
  private suggestions = inject(SuggestionService);
  private notify = inject(NotifyService);
  private stats = inject(StatsService);

  protected readonly tabs: { value: SuggestionStatus | null; label: string }[] = [
    { value: 'PENDIENTE', label: 'Pendientes' },
    { value: 'APROBADA', label: 'Aprobadas' },
    { value: 'RECHAZADA', label: 'Rechazadas' },
    { value: null, label: 'Todas' },
  ];
  protected readonly statusLabels = SUGGESTION_STATUS_LABELS;
  protected readonly scheduleLabel = scheduleLabel;
  protected readonly shortTime = shortTime;

  protected readonly status = signal<SuggestionStatus | null>('PENDIENTE');
  protected readonly result = signal<PageResponse<SuggestionResponse> | null>(null);
  protected readonly loading = signal(true);
  protected readonly selected = signal<SuggestionResponse | null>(null);
  protected readonly rejecting = signal(false);
  protected readonly rejectReason = signal('');
  protected readonly busy = signal(false);
  private page = 0;

  constructor() {
    this.load();
  }

  protected setStatus(status: SuggestionStatus | null): void {
    this.status.set(status);
    this.page = 0;
    this.selected.set(null);
    this.load();
  }

  protected goToPage(page: number): void {
    this.page = page;
    this.load();
  }

  protected select(suggestion: SuggestionResponse): void {
    this.selected.set(suggestion);
    this.rejecting.set(false);
    this.rejectReason.set('');
  }

  protected dayLabel(value: string | null): string | null {
    return DAYS.find((day) => day.value === value)?.label ?? null;
  }

  protected reject(): void {
    const suggestion = this.selected();
    if (!suggestion) return;
    this.busy.set(true);
    this.suggestions.reject(suggestion.id, this.rejectReason().trim()).subscribe({
      next: () => {
        this.notify.success(`Sugerencia «${suggestion.name}» rechazada.`);
        this.busy.set(false);
        this.selected.set(null);
        this.stats.refresh();
        this.load();
      },
      error: (cause: unknown) => {
        this.notify.error(toApiProblem(cause).message);
        this.busy.set(false);
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.suggestions.list(this.status(), this.page, PAGE_SIZE).subscribe({
      next: (page) => {
        this.result.set(page);
        this.loading.set(false);
      },
      error: (cause: unknown) => {
        this.notify.error(toApiProblem(cause).message);
        this.loading.set(false);
      },
    });
  }
}
