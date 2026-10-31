import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Interceptor funcional: añade el Bearer token y centraliza los errores de sesión (401 y 403).
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastController);

  const esAuth = req.url.includes('/api/auth/');
  const token = auth.accessToken();
  const conToken = token && !esAuth
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(conToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !esAuth) {
        // Token caducado: un solo refresh compartido y se repite la petición original.
        return auth.refrescar().pipe(
          switchMap(nuevo => next(req.clone({ setHeaders: { Authorization: `Bearer ${nuevo}` } }))),
          catchError(e => {
            const returnUrl = router.url;
            auth.logout();
            router.navigate(['/login'], { queryParams: { returnUrl } });
            return throwError(() => e);
          }),
        );
      }
      if (error.status === 403) {
        toast.create({ message: 'Acceso denegado (403): tu rol no tiene permiso.', duration: 3000, color: 'danger', position: 'top' })
          .then(t => t.present());
      }
      return throwError(() => error);
    }),
  );
};
