import { Component, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { DAYS, FREQUENCIES } from '../../../core/labels';
import {
  CategoryResponse,
  DayOfWeek,
  MarketFrequency,
  MarketImageResponse,
  MarketRequest,
  MarketResponse,
  SuggestionResponse,
} from '../../../models/api.model';
import { toApiProblem } from '../../../services/api-error';
import { CategoryService } from '../../../services/category';
import { ConfirmService } from '../../../services/confirm';
import { MarketService } from '../../../services/market';
import { NotifyService } from '../../../services/notify';
import { StatsService } from '../../../services/stats';
import { SuggestionService } from '../../../services/suggestion';

/** Imagen de galería: las nuevas aún no tienen id porque se crean al guardar. */
interface GalleryItem {
  id: number | null;
  imageUrl: string;
}

const MESSAGES: Record<string, string> = {
  required: 'Obligatorio.',
  email: 'No es un correo válido.',
  min: 'Valor demasiado bajo.',
  max: 'Valor demasiado alto.',
};

@Component({
  selector: 'app-market-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './market-form.html',
})
export class MarketForm {
  private markets = inject(MarketService);
  private categoriesApi = inject(CategoryService);
  private suggestions = inject(SuggestionService);
  private notify = inject(NotifyService);
  private confirm = inject(ConfirmService);
  private stats = inject(StatsService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  /** Parámetro de ruta /mercados/:id; vacío al crear. */
  readonly id = input(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
  /** ?sugerencia=ID: alta a partir de una sugerencia de usuario. */
  readonly sugerencia = input(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });

  protected readonly frequencies = FREQUENCIES;
  protected readonly days = DAYS;

  protected readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    description: this.fb.control<string | null>(null),
    address: this.fb.control<string | null>(null, Validators.maxLength(255)),
    city: this.fb.control<string | null>(null, Validators.maxLength(100)),
    province: this.fb.control<string | null>(null, Validators.maxLength(100)),
    postalCode: this.fb.control<string | null>(null, Validators.maxLength(10)),
    latitude: this.fb.control<number | null>(null, [Validators.min(-90), Validators.max(90)]),
    longitude: this.fb.control<number | null>(null, [Validators.min(-180), Validators.max(180)]),
    frequency: this.fb.nonNullable.control<MarketFrequency>('semanal', Validators.required),
    dayOfWeek: this.fb.control<DayOfWeek | null>(null),
    startDate: this.fb.control<string | null>(null),
    endDate: this.fb.control<string | null>(null),
    startTime: this.fb.control<string | null>(null),
    endTime: this.fb.control<string | null>(null),
    mainImage: this.fb.control<string | null>(null, Validators.maxLength(255)),
    organizer: this.fb.control<string | null>(null, Validators.maxLength(150)),
    contactPhone: this.fb.control<string | null>(null, Validators.maxLength(20)),
    contactEmail: this.fb.control<string | null>(null, [Validators.email, Validators.maxLength(150)]),
    website: this.fb.control<string | null>(null, Validators.maxLength(255)),
    active: this.fb.nonNullable.control(true),
  });

  protected readonly isEdit = computed(() => this.id() !== undefined);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly serverErrors = signal<Record<string, string>>({});
  protected readonly frequency = signal<MarketFrequency>('semanal');
  protected readonly mainImagePreview = signal<string | null>(null);

  protected readonly allCategories = signal<CategoryResponse[]>([]);
  protected readonly selectedCategories = signal<Set<number>>(new Set());
  /** categoryId -> id del vínculo, para poder desvincular al guardar. */
  private existingLinks = new Map<number, number>();

  protected readonly gallery = signal<GalleryItem[]>([]);
  private existingImages: MarketImageResponse[] = [];

  protected readonly suggestion = signal<SuggestionResponse | null>(null);
  private marketName = '';

  constructor() {
    this.form.controls.frequency.valueChanges.subscribe((value) => this.frequency.set(value));
    this.form.controls.mainImage.valueChanges.subscribe((value) => this.mainImagePreview.set(value?.trim() || null));
  }

  ngOnInit(): void {
    const id = this.id();
    const suggestionId = this.sugerencia();

    forkJoin({
      categories: this.categoriesApi.list(),
      market: id !== undefined ? this.markets.get(id) : of(null),
      links: id !== undefined ? this.markets.categoryLinks(id) : of([]),
      images: id !== undefined ? this.markets.images(id) : of([]),
      suggestion: suggestionId !== undefined ? this.suggestions.get(suggestionId) : of(null),
    }).subscribe({
      next: ({ categories, market, links, images, suggestion }) => {
        this.allCategories.set(categories);
        if (market) this.fillFromMarket(market);
        this.existingLinks = new Map(links.map((link) => [link.categoryId, link.id]));
        this.selectedCategories.set(new Set(links.map((link) => link.categoryId)));
        this.existingImages = images;
        this.gallery.set(images.map((image) => ({ id: image.id, imageUrl: image.imageUrl })));
        if (suggestion) this.fillFromSuggestion(suggestion);
        this.loading.set(false);
      },
      error: (cause: unknown) => {
        this.formError.set(toApiProblem(cause).message);
        this.loading.set(false);
      },
    });
  }

  protected errorFor(field: string): string | null {
    const server = this.serverErrors()[field];
    if (server) return server;
    const control = this.form.get(field);
    if (!control || !control.touched || !control.errors) return null;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
    const key = Object.keys(control.errors)[0];
    return key ? (MESSAGES[key] ?? 'Valor no válido.') : null;
  }

  protected toggleCategory(categoryId: number): void {
    this.selectedCategories.update((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  /** Lee y vacía el propio campo: un [value] ligado a un signal no se repinta si vuelve al mismo valor. */
  protected addImage(field: HTMLInputElement): void {
    const url = field.value.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      this.notify.error('La URL de la imagen debe empezar por http:// o https://');
      return;
    }
    this.gallery.update((items) => [...items, { id: null, imageUrl: url }]);
    field.value = '';
  }

  protected removeImage(index: number): void {
    this.gallery.update((items) => items.filter((_, position) => position !== index));
  }

  protected save(): void {
    this.serverErrors.set({});
    this.formError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Revisa los campos marcados.');
      return;
    }
    this.saving.set(true);
    const request = this.buildRequest();
    const id = this.id();
    const save$ = id !== undefined ? this.markets.update(id, request) : this.markets.create(request);

    save$
      .pipe(switchMap((market) => this.syncRelations(market).pipe(switchMap(() => this.resolveSuggestion(market)))))
      .subscribe({
        next: (market) => {
          this.notify.success(id !== undefined ? `«${market.name}» guardado.` : `«${market.name}» creado.`);
          this.stats.refresh();
          this.router.navigate([this.suggestion() ? '/sugerencias' : '/mercados']);
        },
        error: (cause: unknown) => {
          const problem = toApiProblem(cause);
          this.serverErrors.set(problem.fieldErrors);
          this.formError.set(problem.message);
          this.saving.set(false);
        },
      });
  }

  protected async remove(): Promise<void> {
    const id = this.id();
    if (id === undefined) return;
    const confirmed = await this.confirm.ask({
      title: 'Eliminar mercado',
      message: `Se borrará «${this.marketName}» con sus fotos, categorías, valoraciones y favoritos. No se puede deshacer. Si solo quieres retirarlo de la app, ocúltalo.`,
      confirmLabel: 'Eliminar definitivamente',
      danger: true,
    });
    if (!confirmed) return;
    this.markets.remove(id).subscribe({
      next: () => {
        this.notify.success(`«${this.marketName}» eliminado.`);
        this.stats.refresh();
        this.router.navigate(['/mercados']);
      },
      error: (cause: unknown) => this.notify.error(toApiProblem(cause).message),
    });
  }

  private fillFromMarket(market: MarketResponse): void {
    this.marketName = market.name;
    this.form.patchValue({
      ...market,
      startTime: market.startTime?.slice(0, 5) ?? null,
      endTime: market.endTime?.slice(0, 5) ?? null,
    });
  }

  private fillFromSuggestion(suggestion: SuggestionResponse): void {
    this.suggestion.set(suggestion);
    if (suggestion.status !== 'PENDIENTE') return;
    this.form.patchValue({
      name: suggestion.name,
      city: suggestion.city,
      province: suggestion.province,
      address: suggestion.address,
      frequency: suggestion.frequency ?? 'semanal',
      dayOfWeek: suggestion.dayOfWeek,
      startDate: suggestion.startDate,
      endDate: suggestion.endDate,
      startTime: suggestion.startTime?.slice(0, 5) ?? null,
      endTime: suggestion.endTime?.slice(0, 5) ?? null,
      description: suggestion.description,
    });
  }

  private buildRequest(): MarketRequest {
    const value = this.form.getRawValue();
    const clean = (text: string | null) => (text && text.trim() ? text.trim() : null);
    const isOneOff = value.frequency === 'puntual';
    return {
      name: value.name.trim(),
      description: clean(value.description),
      address: clean(value.address),
      city: clean(value.city),
      province: clean(value.province),
      postalCode: clean(value.postalCode),
      latitude: value.latitude,
      longitude: value.longitude,
      frequency: value.frequency,
      // Un mercado puntual va por fechas y uno periódico por día de la semana:
      // no se guarda el dato que no aplica aunque se hubiera rellenado antes.
      dayOfWeek: isOneOff ? null : value.dayOfWeek,
      startDate: isOneOff ? value.startDate || null : null,
      endDate: isOneOff ? value.endDate || null : null,
      startTime: value.startTime || null,
      endTime: value.endTime || null,
      mainImage: clean(value.mainImage),
      organizer: clean(value.organizer),
      contactPhone: clean(value.contactPhone),
      contactEmail: clean(value.contactEmail),
      website: clean(value.website),
      active: value.active,
    };
  }

  /** Aplica las categorías y la galería editadas en pantalla sobre el mercado ya guardado. */
  private syncRelations(market: MarketResponse): Observable<MarketResponse> {
    const selected = this.selectedCategories();
    const operations: Observable<unknown>[] = [];

    for (const categoryId of selected) {
      if (!this.existingLinks.has(categoryId)) operations.push(this.markets.linkCategory(market.id, categoryId));
    }
    for (const [categoryId, linkId] of this.existingLinks) {
      if (!selected.has(categoryId)) operations.push(this.markets.unlinkCategory(linkId));
    }

    const keptIds = new Set(this.gallery().filter((item) => item.id !== null).map((item) => item.id));
    for (const image of this.existingImages) {
      if (!keptIds.has(image.id)) operations.push(this.markets.removeImage(image.id));
    }
    this.gallery().forEach((item, position) => {
      if (item.id === null) operations.push(this.markets.addImage(market.id, item.imageUrl, position));
    });

    return operations.length ? forkJoin(operations).pipe(switchMap(() => of(market))) : of(market);
  }

  private resolveSuggestion(market: MarketResponse): Observable<MarketResponse> {
    const suggestion = this.suggestion();
    if (!suggestion || suggestion.status !== 'PENDIENTE') return of(market);
    return this.suggestions.approve(suggestion.id, market.id).pipe(switchMap(() => of(market)));
  }
}
