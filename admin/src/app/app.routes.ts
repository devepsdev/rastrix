import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { CategoryList } from './components/categories/category-list/category-list';
import { Dashboard } from './components/dashboard/dashboard';
import { MarketForm } from './components/markets/market-form/market-form';
import { MarketList } from './components/markets/market-list/market-list';
import { SuggestionList } from './components/suggestions/suggestion-list/suggestion-list';
import { UserList } from './components/users/user-list/user-list';
import { adminGuard } from './guards/admin-guard';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Acceso · Rastrix' },
  {
    path: '',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', component: Dashboard, title: 'Resumen · Rastrix' },
      { path: 'mercados', component: MarketList, title: 'Mercados · Rastrix' },
      { path: 'mercados/nuevo', component: MarketForm, title: 'Nuevo mercado · Rastrix' },
      { path: 'mercados/:id', component: MarketForm, title: 'Editar mercado · Rastrix' },
      { path: 'sugerencias', component: SuggestionList, title: 'Sugerencias · Rastrix' },
      { path: 'categorias', component: CategoryList, title: 'Categorías · Rastrix' },
      { path: 'usuarios', component: UserList, title: 'Usuarios · Rastrix' },
    ],
  },
  { path: '**', redirectTo: '' },
];
