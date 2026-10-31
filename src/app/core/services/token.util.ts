export type Rol = 'admin' | 'supervisor' | 'user';

// Claims del payload del JWT (RBAC: el token lleva roles y permisos, y la expiración).
export interface Claims {
  sub: string;
  username: string;
  roles: Rol[];
  permisos: string[];
  iat: number;
  exp: number;
}

// Permisos que concede cada rol (tabla RBAC: rol -> permisos).
export const PERMISOS_POR_ROL: Record<Rol, string[]> = {
  admin: ['galeria:ver', 'informes:ver', 'usuarios:gestionar'],
  supervisor: ['galeria:ver', 'informes:ver'],
  user: ['galeria:ver'],
};

const codificar = (objeto: object): string =>
  btoa(JSON.stringify(objeto)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

// JWT de demostración: cabecera.payload.firma. La firma es falsa porque no hay servidor real.
export function firmar(claims: Claims): string {
  return `${codificar({ alg: 'HS256', typ: 'JWT' })}.${codificar(claims)}.firma-demo`;
}

export function decodificar(token: string | null): Claims | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)) as Claims;
  } catch {
    return null;
  }
}

export function haCaducado(token: string | null): boolean {
  const claims = decodificar(token);
  return !claims || claims.exp * 1000 <= Date.now();
}
