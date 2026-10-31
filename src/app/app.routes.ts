import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// Toda la navegación usa carga diferida (loadComponent): cada pantalla es un fragmento aparte.
export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'registro', loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage) },
  {
    path: 'inicio',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/inicio/inicio.page').then(m => m.InicioPage),
  },
  {
    path: 'productos',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/productos/productos.page').then(m => m.ProductosPage),
  },
  {
    path: 'movimientos',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/movimientos/movimientos.page').then(m => m.MovimientosPage),
  },
  {
    path: 'dashboard',
    canMatch: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
  },
  {
    path: 'usuarios',
    canMatch: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./pages/usuarios/usuarios.page').then(m => m.UsuariosPage),
  },
  { path: 'ayuda', canMatch: [authGuard], loadComponent: () => import('./pages/ayuda/ayuda.page').then(m => m.AyudaPage) },
  { path: 'galeria', loadComponent: () => import('./galeria/galeria.component').then(m => m.GaleriaComponent) },
  { path: '**', redirectTo: 'inicio' },
];
