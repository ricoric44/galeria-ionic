/**
 * Hash SHA-256 (hex) de `sal:contraseña` con la API Web Crypto.
 * Sirve para que el repositorio no contenga contraseñas en texto plano.
 */
export async function hashContrasena(sal: string, contrasena: string): Promise<string> {
  const datos = new TextEncoder().encode(`${sal}:${contrasena}`);
  const resumen = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(resumen))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
