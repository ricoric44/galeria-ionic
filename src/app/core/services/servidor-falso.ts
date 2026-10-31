import { UsuarioPublico, Producto } from '../models/modelos';
import { hashContrasena } from './hash.util';
import { PERMISOS_POR_ROL, Claims, firmar } from './token.util';

/*
 * Simula el backend: base de datos relacional (usuarios y productos) y emisión de tokens.
 * En una aplicación real todo esto vive en el servidor; aquí se mantiene en memoria.
 */
const TTL_ACCESO_S = 300;
const refrescosValidos = new Map<string, string>(); // refreshToken -> email

interface FilaUsuario extends UsuarioPublico {
  sal: string;
  hash: string; // SHA-256(sal:contraseña). Datos sintéticos: ninguna persona real.
}

const usuarios: FilaUsuario[] = [
  {
    id: 1, nombre: 'Ana Administradora', email: 'admin@gestion.test', rol: 'admin', sal: 'sal-admin',
    hash: '7a396ae3d7396ffe210a365a6f75cde90f7fc5d49b0335c2fc79990baa460fc2',
  },
  {
    id: 2, nombre: 'Uriel Usuario', email: 'usuario@gestion.test', rol: 'user', sal: 'sal-usuario',
    hash: 'b0f970cd172bf540a76e1e2876ad2c88ca34133143c9c6c093a9866873b5b4c8',
  },
];

const productos: Producto[] = [
  { id: 1, nombre: 'Teclado mecánico', categoria: 'Periféricos', precio: 59.9, stock: 42 },
  { id: 2, nombre: 'Ratón inalámbrico', categoria: 'Periféricos', precio: 24.5, stock: 80 },
  { id: 3, nombre: 'Monitor 24 pulgadas', categoria: 'Pantallas', precio: 139, stock: 15 },
  { id: 4, nombre: 'Monitor 27 pulgadas 4K', categoria: 'Pantallas', precio: 329, stock: 6 },
  { id: 5, nombre: 'Portátil 14 pulgadas', categoria: 'Ordenadores', precio: 699, stock: 9 },
  { id: 6, nombre: 'Sobremesa compacto', categoria: 'Ordenadores', precio: 549, stock: 0 },
  { id: 7, nombre: 'Cable HDMI 2 m', categoria: 'Accesorios', precio: 7.9, stock: 210 },
  { id: 8, nombre: 'Hub USB-C', categoria: 'Accesorios', precio: 34.9, stock: 33 },
  { id: 9, nombre: 'Auriculares con micro', categoria: 'Periféricos', precio: 44, stock: 27 },
  { id: 10, nombre: 'Webcam Full HD', categoria: 'Periféricos', precio: 49.5, stock: 0 },
  { id: 11, nombre: 'SSD externo 1 TB', categoria: 'Accesorios', precio: 89, stock: 18 },
  { id: 12, nombre: 'Impresora láser', categoria: 'Ordenadores', precio: 189, stock: 4 },
];
let siguienteIdProducto = productos.length + 1;
let siguienteIdUsuario = usuarios.length + 1;

const normalizar = (email: string): string => email.trim().toLowerCase();

export function emitirAcceso(usuario: UsuarioPublico, ttlSegundos = TTL_ACCESO_S): string {
  const ahora = Math.floor(Date.now() / 1000);
  const claims: Claims = {
    sub: `u-${usuario.id}`,
    username: usuario.email,
    nombre: usuario.nombre,
    roles: [usuario.rol],
    permisos: PERMISOS_POR_ROL[usuario.rol],
    iat: ahora,
    exp: ahora + ttlSegundos,
  };
  return firmar(claims);
}

const publico = ({ id, nombre, email, rol }: FilaUsuario): UsuarioPublico => ({ id, nombre, email, rol });

export async function iniciarSesionServidor(email: string, contrasena: string) {
  const fila = usuarios.find(u => u.email === normalizar(email));
  // Se calcula el hash incluso si el usuario no existe, para no delatar qué correos están dados de alta.
  const hash = await hashContrasena(fila?.sal ?? 'sal-inexistente', contrasena);
  if (!fila || fila.hash !== hash) return null;
  const refreshToken = `refresh-${fila.id}-${crypto.randomUUID()}`;
  refrescosValidos.set(refreshToken, fila.email);
  return { accessToken: emitirAcceso(publico(fila)), refreshToken };
}

export function refrescarServidor(refreshToken: string | null): string | null {
  const email = refreshToken ? refrescosValidos.get(refreshToken) : undefined;
  const fila = usuarios.find(u => u.email === email);
  return fila ? emitirAcceso(publico(fila)) : null;
}

export function revocarRefresh(refreshToken: string | null): void {
  if (refreshToken) refrescosValidos.delete(refreshToken);
}

export const existeEmail = (email: string): boolean => usuarios.some(u => u.email === normalizar(email));

/** Alta pública: siempre crea usuarios estándar (el rol nunca lo decide el cliente). */
export async function registrarUsuario(nombre: string, email: string, contrasena: string): Promise<UsuarioPublico> {
  const sal = `sal-${crypto.randomUUID()}`;
  const fila: FilaUsuario = {
    id: siguienteIdUsuario++, nombre: nombre.trim(), email: normalizar(email), rol: 'user',
    sal, hash: await hashContrasena(sal, contrasena),
  };
  usuarios.push(fila);
  return publico(fila);
}

export const listarUsuarios = (): UsuarioPublico[] => usuarios.map(publico);
export const listarProductos = (): Producto[] => productos.map(p => ({ ...p }));

export function crearProducto(datos: Omit<Producto, 'id'>): Producto {
  const nuevo = { ...datos, id: siguienteIdProducto++ };
  productos.push(nuevo);
  return { ...nuevo };
}

export function borrarProducto(id: number): boolean {
  const i = productos.findIndex(p => p.id === id);
  if (i < 0) return false;
  productos.splice(i, 1);
  return true;
}
