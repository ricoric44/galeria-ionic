import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../services/token.util';

// Factoría: devuelve un guard que exige uno de los roles indicados.
// Si el usuario tiene otro rol, lo redirige a su panel por defecto.
export const roleGuard = (...rolesPermitidos: Rol[]): CanMatchFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const sesion = authService.currentUser();

    if (!sesion) {
      return router.createUrlTree(['/login']);
    }
    if (rolesPermitidos.includes(sesion.role)) {
      return true;
    }
    return router.createUrlTree(['/inicio']);
  };
};
