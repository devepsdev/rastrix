import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryResponse } from '../../../models/api.model';
import { toApiProblem } from '../../../services/api-error';
import { CategoryService } from '../../../services/category';
import { ConfirmService } from '../../../services/confirm';
import { NotifyService } from '../../../services/notify';
import { StatsService } from '../../../services/stats';

@Component({
  selector: 'app-category-list',
  imports: [ReactiveFormsModule],
  templateUrl: './category-list.html',
})
export class CategoryList {
  private categories = inject(CategoryService);
  private notify = inject(NotifyService);
  private confirm = inject(ConfirmService);
  private stats = inject(StatsService);
  private fb = inject(FormBuilder);

  protected readonly items = signal<CategoryResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly editing = signal<CategoryResponse | null>(null);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(80)]),
    description: this.fb.control<string | null>(null, Validators.maxLength(255)),
    icon: this.fb.control<string | null>(null, Validators.maxLength(100)),
  });

  constructor() {
    this.load();
  }

  protected edit(category: CategoryResponse): void {
    this.editing.set(category);
    this.formError.set(null);
    this.form.reset({ name: category.name, description: category.description, icon: category.icon });
  }

  protected cancel(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.form.reset({ name: '', description: null, icon: null });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const request = {
      name: value.name.trim(),
      description: value.description?.trim() || null,
      icon: value.icon?.trim() || null,
    };
    const current = this.editing();
    this.saving.set(true);
    this.formError.set(null);

    (current ? this.categories.update(current.id, request) : this.categories.create(request)).subscribe({
      next: (saved) => {
        this.notify.success(current ? `Categoría «${saved.name}» actualizada.` : `Categoría «${saved.name}» creada.`);
        this.saving.set(false);
        this.cancel();
        this.stats.refresh();
        this.load();
      },
      error: (cause: unknown) => {
        this.formError.set(toApiProblem(cause).message);
        this.saving.set(false);
      },
    });
  }

  protected async remove(category: CategoryResponse): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Eliminar categoría',
      message: `«${category.name}» se quitará de todos los mercados que la tengan asignada. Los mercados no se borran.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!confirmed) return;
    this.categories.remove(category.id).subscribe({
      next: () => {
        this.notify.success(`Categoría «${category.name}» eliminada.`);
        if (this.editing()?.id === category.id) this.cancel();
        this.stats.refresh();
        this.load();
      },
      error: (cause: unknown) => this.notify.error(toApiProblem(cause).message),
    });
  }

  private load(): void {
    this.categories.list().subscribe({
      next: (list) => {
        this.items.set([...list].sort((a, b) => a.name.localeCompare(b.name, 'es')));
        this.loading.set(false);
      },
      error: (cause: unknown) => {
        this.notify.error(toApiProblem(cause).message);
        this.loading.set(false);
      },
    });
  }
}
