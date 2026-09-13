import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PageResponse, Role, UserResponse } from '../../../models/api.model';
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

  protected readonly roles: { value: Role; label: string }[] = [
    { value: 'USER', label: 'Usuario' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'SCRAPER', label: 'Scraper' },
  ];

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

  protected async changeRole(user: UserResponse, select: HTMLSelectElement): Promise<void> {
    const role = select.value as Role;
    if (role === user.role) return;

    const consequences: Record<Role, string> = {
      ADMIN: `${user.name} podrá entrar en este panel y crear, editar, ocultar y borrar cualquier contenido.`,
      USER: `${user.name} pasará a ser un usuario normal de la app, sin acceso a este panel.`,
      SCRAPER: `${user.name} pasará a ser la cuenta del scraper automático: sus sugerencias se marcarán como automáticas y no tendrán el tope de los usuarios. Úsalo solo para la cuenta del bot.`,
    };
    const confirmed = await this.confirm.ask({
      title: 'Cambiar rol',
      message: consequences[role],
      confirmLabel: 'Cambiar rol',
      danger: user.role === 'ADMIN',
    });
    // El <select> ya muestra el valor nuevo: si no se confirma o falla, se devuelve al real.
    if (!confirmed) {
      select.value = user.role;
      return;
    }

    this.busyId.set(user.id);
    this.users.updateRole(user.id, role).subscribe({
      next: (updated) => {
        this.notify.success(`${updated.name} ahora tiene el rol ${this.roles.find((r) => r.value === updated.role)?.label.toLowerCase()}.`);
        this.busyId.set(null);
        this.stats.refresh();
        this.load();
      },
      error: (cause: unknown) => {
        select.value = user.role;
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
