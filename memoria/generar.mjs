// Genera memoria/memoria.pdf a partir de plantilla.html, credenciales.local.json (no versionado) y los informes Lighthouse.
// Uso: node memoria/generar.mjs   (necesita Microsoft Edge o Chrome instalado)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const datos = JSON.parse(readFileSync('memoria/credenciales.local.json', 'utf8'));
const paginas = ['inicio', 'productos', 'movimientos', 'dashboard', 'ayuda'];
const filas = paginas.map(p => {
  const ruta = `informes-calidad/lighthouse-${p}.report.json`;
  if (!existsSync(ruta)) return '';
  const c = JSON.parse(readFileSync(ruta, 'utf8')).categories;
  const n = k => Math.round(c[k].score * 100);
  return `<tr><td>/${p}</td><td class="ok">${n('accessibility')}</td><td class="ok">${n('best-practices')}</td><td>${n('performance')}</td><td>${n('seo')}</td></tr>`;
}).join('\n');

const valores = {
  alumno: datos.alumno, fecha: new Date().toLocaleDateString('es-ES'), github: datos.github, vercel: datos.vercel,
  admin_email: datos.admin.email, admin_password: datos.admin.password,
  usuario_email: datos.usuario.email, usuario_password: datos.usuario.password, filas_lighthouse: filas,
};
let html = readFileSync('memoria/plantilla.html', 'utf8');
for (const [k, v] of Object.entries(valores)) html = html.replaceAll(`{{${k}}}`, v);
writeFileSync('memoria/memoria.html', html);

const navegadores = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const exe = navegadores.find(existsSync);
if (!exe) throw new Error('No se encontro Edge ni Chrome');
execFileSync(exe, [
  '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
  `--print-to-pdf=${resolve('memoria/memoria.pdf')}`, pathToFileURL(resolve('memoria/memoria.html')).href,
]);
console.log('Generado memoria/memoria.pdf');
