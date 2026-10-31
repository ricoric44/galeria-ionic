// Sirve la carpeta www/ como lo haría Vercel: rewrite SPA y cabeceras de vercel.json (CSP incluida).
// Uso: node scripts/servir-produccion.mjs [puerto]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const puerto = Number(process.argv[2] ?? 4400);
const raiz = join(process.cwd(), 'www');
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const cabeceras = Object.fromEntries(config.headers[0].headers.map(h => [h.key, h.value]));
const tipos = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

createServer(async (req, res) => {
  const ruta = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  let archivo = join(raiz, ruta || 'index.html');
  if (!archivo.startsWith(raiz)) { res.writeHead(403).end(); return; }
  let datos;
  try { datos = await readFile(archivo); } catch {
    if (extname(ruta)) { res.writeHead(404).end('No encontrado'); return; }
    archivo = join(raiz, 'index.html');
    datos = await readFile(archivo);
  }
  res.writeHead(200, { ...cabeceras, 'Content-Type': tipos[extname(archivo)] ?? 'application/octet-stream' }).end(datos);
}).listen(puerto, () => console.log(`Produccion local en http://localhost:${puerto}`));
