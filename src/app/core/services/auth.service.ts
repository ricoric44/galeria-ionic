import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, finalize, shareReplay, tap } from 'rxjs/operators';
import { iniciarSesionServidor, refrescarServidor, revocarRefresh, emitirAcceso } from './servidor-falso';
import { Claims, Rol, decodificar, haCaducado } from './token.util';

export interface Sesion {
  username: string;
  nombre: string;
  role: Rol;
  permisos: string[];
  exp: number;
}

const CLAVE_ACCESO = 'DAM2_ACCESS_TOKEN';
const CLAVE_REFRESH = 'DAM2_REFRESH_TOKEN';

// Servicio central de estado de sesión. Es el único que lee el token: el resto de la app
// (guardas, interceptor, directivas) consume el estado tipado `currentUser`.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken_ = signal<string | null>(sessionStorage.getItem(CLAVE_ACCESO));

  public currentUser = computed<Sesion | null>(() => {
    const claims: Claims | null = decodificar(this.accessToken_());
    if (!claims) return null;
    return { username: claims.username, nombre: claims.nombre, role: claims.roles[0], permisos: claims.permisos, exp: claims.exp };
  });

  // Refresh en vuelo compartido (single-flight): varias peticiones con 401 esperan al mismo.
  private refrescoEnVuelo$: Observable<string> | null = null;

  public async login(username: string, password: string): Promise<boolean> {
    const respuesta = await iniciarSesionServidor(username, password);
    if (!respuesta) return false;
    this.guardar(respuesta.accessToken, respuesta.refreshToken);
    return true;
  }

  public logout(): void {
    revocarRefresh(sessionStorage.getItem(CLAVE_REFRESH));
    sessionStorage.removeItem(CLAVE_ACCESO);
    sessionStorage.removeItem(CLAVE_REFRESH);
    this.accessToken_.set(null);
  }

  // Hay sesión si existe el token de refresco o el de acceso aún vale.
  public isAuthenticated(): boolean {
    return this.currentUser() !== null && sessionStorage.getItem(CLAVE_REFRESH) !== null;
  }

  public accessToken(): string | null {
    return this.accessToken_();
  }

  public hasPermiso(permiso: string): boolean {
    return this.currentUser()?.permisos.includes(permiso) ?? false;
  }

  public refrescar(): Observable<string> {
    if (!this.refrescoEnVuelo$) {
      const refresh = sessionStorage.getItem(CLAVE_REFRESH);
      const nuevo = refrescarServidor(refresh);
      const llamada$ = nuevo
        ? of(nuevo).pipe(delay(300), tap(token => this.guardar(token, refresh!)))
        : throwError(() => new Error('Refresh token inválido'));
      this.refrescoEnVuelo$ = llamada$.pipe(
        finalize(() => (this.refrescoEnVuelo$ = null)),
        shareReplay(1),
      );
    }
    return this.refrescoEnVuelo$;
  }

  // Solo para la demostración: deja el token de acceso caducado para provocar un 401.
  public caducarAccessToken(): void {
    const user = this.currentUser();
    if (!user) return;
    const caducado = emitirAcceso({ id: 0, nombre: user.nombre, email: user.username, rol: user.role }, -60);
    sessionStorage.setItem(CLAVE_ACCESO, caducado);
    this.accessToken_.set(caducado);
  }

  public tokenCaducado(): boolean {
    return haCaducado(this.accessToken_());
  }

  private guardar(acceso: string, refresh: string): void {
    sessionStorage.setItem(CLAVE_ACCESO, acceso);
    sessionStorage.setItem(CLAVE_REFRESH, refresh);
    this.accessToken_.set(acceso);
  }
}
