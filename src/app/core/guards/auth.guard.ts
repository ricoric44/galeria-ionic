import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Solo deja pasar a usuarios con sesión. Si no, redirige a /login guardando la URL pedida (returnUrl).
export const authGuard: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  if (authService.isAuthenticated()) return true;

  const returnUrl = '/' + segments.map(s => s.path).join('/');
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl } });
};
