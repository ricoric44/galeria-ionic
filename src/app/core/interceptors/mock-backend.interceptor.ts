import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';
import { decodificar, haCaducado } from '../services/token.util';

// Servidor simulado: responde a /api/* sin salir a la red. Va el último de la cadena de interceptores.
const PERMISO_POR_RUTA: Record<string, string> = {
  '/api/informes': 'informes:ver',
  '/api/usuarios': 'usuarios:gestionar',
};

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const ruta = Object.keys(PERMISO_POR_RUTA).find(r => req.url.endsWith(r));
  if (!ruta) return next(req);

  const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? null;
  const claims = decodificar(token);

  if (!claims || haCaducado(token)) {
    return throwError(() => new HttpErrorResponse({ status: 401, url: req.url })).pipe(delay(200));
  }
  if (!claims.permisos.includes(PERMISO_POR_RUTA[ruta])) {
    return throwError(() => new HttpErrorResponse({ status: 403, url: req.url })).pipe(delay(200));
  }
  return of(new HttpResponse({ status: 200, body: { ok: true, ruta, usuario: claims.username } })).pipe(delay(200));
};
