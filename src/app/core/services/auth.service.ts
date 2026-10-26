import { Injectable, signal } from '@angular/core';

export interface Sesion {
  username: string;
  role: 'admin' | 'user';
  isAuthenticated: boolean;
}

const CLAVE_SESION = 'DAM2_AUTH_SESSION';

// Usuarios de demostración. En una app real la validación se hace en el servidor.
const USUARIOS: Record<string, { password: string; role: 'admin' | 'user' }> = {
  admin: { password: '123', role: 'admin' },
  operador: { password: '123', role: 'user' },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  public currentUser = signal<Sesion | null>(this.leerSesion());

  public login(username: string, password: string): boolean {
    const usuario = USUARIOS[username];
    if (!usuario || usuario.password !== password) {
      return false;
    }
    const sesion: Sesion = { username, role: usuario.role, isAuthenticated: true };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    this.currentUser.set(sesion);
    return true;
  }

  public logout(): void {
    sessionStorage.removeItem(CLAVE_SESION);
    this.currentUser.set(null);
  }

  public isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  private leerSesion(): Sesion | null {
    const guardada = sessionStorage.getItem(CLAVE_SESION);
    return guardada ? (JSON.parse(guardada) as Sesion) : null;
  }
}
