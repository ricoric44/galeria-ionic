import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { GaleriaComponent } from './galeria/galeria.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'admin',
    canMatch: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage)
  },
  {
    path: 'informes',
    canMatch: [authGuard, roleGuard('admin', 'supervisor')],
    loadComponent: () => import('./pages/informes/informes.page').then(m => m.InformesPage)
  },
  {
    path: 'user-dashboard',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/user-dashboard/user-dashboard.page').then(m => m.UserDashboardPage)
  },
  {
    path: 'galeria',
    component: GaleriaComponent
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
