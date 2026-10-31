export type Rol = 'admin' | 'user';

/** Claims del payload del JWT (RBAC: el token lleva roles, permisos y la expiración). */
export interface Claims {
  sub: string;
  username: string;
  nombre: string;
  roles: Rol[];
  permisos: string[];
  iat: number;
  exp: number;
}

/** Tabla RBAC: rol -> permisos. */
export const PERMISOS_POR_ROL: Record<Rol, string[]> = {
  admin: ['productos:ver', 'productos:editar', 'movimientos:ver', 'informes:ver', 'usuarios:gestionar'],
  user: ['productos:ver', 'movimientos:ver'],
};

const codificar = (objeto: object): string =>
  btoa(JSON.stringify(objeto)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

/**
 * Construye un JWT de demostración: cabecera.payload.firma.
 * La firma es simbólica: no hay servidor real y un secreto en el cliente no sería secreto.
 */
export function firmar(claims: Claims): string {
  return `${codificar({ alg: 'HS256', typ: 'JWT' })}.${codificar(claims)}.firma-demo`;
}

/** Devuelve el payload del token o `null` si está mal formado. */
export function decodificar(token: string | null): Claims | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)) as Claims;
  } catch {
    return null;
  }
}

/** `true` si el token no existe, está corrupto o su `exp` ya pasó. */
export function haCaducado(token: string | null): boolean {
  const claims = decodificar(token);
  return !claims || claims.exp * 1000 <= Date.now();
}
