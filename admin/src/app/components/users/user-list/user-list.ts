import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PageResponse, UserResponse } from '../../../models/api.model';
import { toApiProblem } from '../../../services/api-error';
import { AuthService } from '../../../services/auth';
import { ConfirmService } from '../../../services/confirm';
import { NotifyService } from '../../../services/notify';
import { StatsService } from '../../../services/stats';
import { UserService } from '../../../services/user';
import { Pagination } from '../../shared/pagination/pagination';

const PAGE_SIZE = 25;

@Component({
  selector: 'app-user-list',
  imports: [DatePipe, Pagination],
  templateUrl: './user-list.html',
})
export class UserList {
  private users = inject(UserService);
  private notify = inject(NotifyService);
  private confirm = inject(ConfirmService);
  private stats = inject(StatsService);
  protected readonly auth = inject(AuthService);

  protected readonly result = signal<PageResponse<UserResponse> | null>(null);
  protected readonly loading = signal(true);
  protected readonly busyId = signal<number | null>(null);
  private page = 0;

  constructor() {
    this.load();
  }

  protected goToPage(page: number): void {
    this.page = page;
    this.load();
  }

  protected async toggleRole(user: UserResponse): Promise<void> {
    const promote = user.role !== 'ADMIN';
    const confirmed = await this.confirm.ask({
      title: promote ? 'Dar permisos de administración' : 'Quitar permisos de administración',
      message: promote
        ? `${user.name} podrá entrar en este panel y crear, editar, ocultar y borrar cualquier contenido.`
        : `${user.name} dejará de poder entrar en este panel.`,
      confirmLabel: promote ? 'Hacer administrador' : 'Quitar permisos',
      danger: !promote,
    });
    if (!confirmed) return;

    this.busyId.set(user.id);
    this.users.updateRole(user.id, promote ? 'ADMIN' : 'USER').subscribe({
      next: (updated) => {
        this.notify.success(promote ? `${updated.name} ya es administrador.` : `${updated.name} ya no es administrador.`);
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

  protected async remove(user: UserResponse): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Eliminar cuenta',
      message: `Se borrará la cuenta de ${user.name} (${user.email}) junto con sus favoritos, valoraciones y sugerencias. No se puede deshacer.`,
      confirmLabel: 'Eliminar cuenta',
      danger: true,
    });
    if (!confirmed) return;

    this.busyId.set(user.id);
    this.users.remove(user.id).subscribe({
      next: () => {
        this.notify.success(`Cuenta de ${user.name} eliminada.`);
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

  private load(): void {
    this.users.list(this.page, PAGE_SIZE).subscribe({
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
