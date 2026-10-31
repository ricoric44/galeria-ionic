import { Claims, PERMISOS_POR_ROL, Rol, firmar } from './token.util';

// Simula la parte del servidor que emite y valida tokens. En una app real esto vive en el backend.
const TTL_ACCESO_S = 300;
const refrescosValidos = new Map<string, string>(); // refreshToken -> username

const USUARIOS: Record<string, { password: string; rol: Rol }> = {
  admin: { password: '123', rol: 'admin' },
  supervisor: { password: '123', rol: 'supervisor' },
  operador: { password: '123', rol: 'user' },
};

export function emitirAcceso(username: string, rol: Rol, ttlSegundos = TTL_ACCESO_S): string {
  const ahora = Math.floor(Date.now() / 1000);
  const claims: Claims = {
    sub: `u-${username}`,
    username,
    roles: [rol],
    permisos: PERMISOS_POR_ROL[rol],
    iat: ahora,
    exp: ahora + ttlSegundos,
  };
  return firmar(claims);
}

export function iniciarSesionServidor(username: string, password: string) {
  const usuario = USUARIOS[username];
  if (!usuario || usuario.password !== password) return null;
  const refreshToken = `refresh-${username}-${Math.random().toString(36).slice(2)}`;
  refrescosValidos.set(refreshToken, username);
  return { accessToken: emitirAcceso(username, usuario.rol), refreshToken, rol: usuario.rol };
}

export function refrescarServidor(refreshToken: string | null): string | null {
  const username = refreshToken ? refrescosValidos.get(refreshToken) : undefined;
  return username ? emitirAcceso(username, USUARIOS[username].rol) : null;
}

export function revocarRefresh(refreshToken: string | null): void {
  if (refreshToken) refrescosValidos.delete(refreshToken);
}
