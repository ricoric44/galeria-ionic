import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Factoría: devuelve un guard que exige un rol concreto.
// Si el usuario tiene otro rol, lo redirige a su panel por defecto.
export const roleGuard = (allowedRole: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const sesion = authService.currentUser();

    if (!sesion) {
      return router.createUrlTree(['/login']);
    }
    if (sesion.role === allowedRole) {
      return true;
    }
    return router.createUrlTree(['/user-dashboard']);
  };
};
