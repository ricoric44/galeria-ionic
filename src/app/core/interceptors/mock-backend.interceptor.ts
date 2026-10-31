import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, from, of, switchMap, throwError } from 'rxjs';
import { ResumenInventario } from '../models/modelos';
import {
  borrarProducto, crearProducto, existeEmail, listarProductos, listarUsuarios, registrarUsuario,
} from '../services/servidor-falso';
import { decodificar, haCaducado } from '../services/token.util';

/*
 * Servidor SQL simulado: responde a /api/* sin salir a la red. Va el último de la cadena de interceptores.
 * Cada ruta declara el permiso RBAC que exige; las rutas de /api/auth/ son públicas.
 */
const LATENCIA_MS = 450;

interface Ruta {
  metodo: string;
  patron: RegExp;
  permiso: string | null;
  atiende: (req: HttpRequest<unknown>, coincidencia: RegExpMatchArray) => unknown | Promise<unknown>;
}

const resumen = (): ResumenInventario => {
  const productos = listarProductos();
  return {
    totalProductos: productos.length,
    unidadesEnStock: productos.reduce((s, p) => s + p.stock, 0),
    valorInventario: productos.reduce((s, p) => s + p.stock * p.precio, 0),
    productosSinStock: productos.filter(p => p.stock === 0).length,
  };
};

const RUTAS: Ruta[] = [
  { metodo: 'GET', patron: /\/api\/auth\/existe$/, permiso: null,
    atiende: req => ({ existe: existeEmail(req.params.get('email') ?? '') }) },
  { metodo: 'POST', patron: /\/api\/auth\/registro$/, permiso: null,
    atiende: async req => {
      const { nombre, email, password } = req.body as { nombre: string; email: string; password: string };
      if (existeEmail(email)) throw new HttpErrorResponse({ status: 409, url: req.url });
      return registrarUsuario(nombre, email, password);
    } },
  { metodo: 'GET', patron: /\/api\/productos$/, permiso: 'productos:ver', atiende: () => listarProductos() },
  { metodo: 'POST', patron: /\/api\/productos$/, permiso: 'productos:editar',
    atiende: req => crearProducto(req.body as Parameters<typeof crearProducto>[0]) },
  { metodo: 'DELETE', patron: /\/api\/productos\/(\d+)$/, permiso: 'productos:editar',
    atiende: (req, m) => {
      if (!borrarProducto(Number(m[1]))) throw new HttpErrorResponse({ status: 404, url: req.url });
      return null;
    } },
  { metodo: 'GET', patron: /\/api\/usuarios$/, permiso: 'usuarios:gestionar', atiende: () => listarUsuarios() },
  { metodo: 'GET', patron: /\/api\/informes\/resumen$/, permiso: 'informes:ver', atiende: () => resumen() },
];

const fallo = (status: number, url: string) =>
  throwError(() => new HttpErrorResponse({ status, url })).pipe(delay(LATENCIA_MS / 2));

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url.split('?')[0];
  const ruta = RUTAS.find(r => r.metodo === req.method && r.patron.test(url));
  if (!url.includes('/api/')) return next(req);
  if (!ruta) return fallo(404, req.url);

  if (ruta.permiso) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? null;
    const claims = decodificar(token);
    if (!claims || haCaducado(token)) return fallo(401, req.url);
    if (!claims.permisos.includes(ruta.permiso)) return fallo(403, req.url);
  }

  const respuesta$: Observable<HttpResponse<unknown>> = from(
    Promise.resolve().then(() => ruta.atiende(req, url.match(ruta.patron)!)),
  ).pipe(switchMap(body => of(new HttpResponse({ status: 200, body }))));
  return respuesta$.pipe(delay(LATENCIA_MS));
};
