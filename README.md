# Gestión de inventario (Ionic + Angular)

Proyecto de la **Actividad individual 1 - Desarrollo de Interfaces (0488), DAM**: aplicación de gestión multiplataforma (PWA) con control de acceso por roles, datos SQL y NoSQL simulados, cuadro de mando, exportación PDF/CSV, accesibilidad WCAG y despliegue automatizado.

## Puesta en marcha

```bash
npm ci
npm start            # desarrollo en http://localhost:4200
npm run lint         # ESLint
npm run test:ci      # pruebas unitarias (Vitest)
npm run build:prod   # compilación de producción en www/ (PWA)
npm run docs         # documentación técnica con Compodoc en documentacion/
node scripts/servir-produccion.mjs   # sirve www/ con las cabeceras de vercel.json
```

Las credenciales de prueba se entregan en la memoria (no están en el repositorio). Las contraseñas de los usuarios sintéticos se guardan como hash SHA-256 con sal en `src/app/core/services/servidor-falso.ts`.

## Arquitectura

| Capa | Contenido |
|---|---|
| `core/services` | `AuthService` (estado de sesión con señales), `ProductosService` (API REST SQL), `MovimientosService` (colección NoSQL en tiempo real), `exportar.util` (CSV/PDF), `servidor-falso` (backend simulado) |
| `core/interceptors` | `authInterceptor` (Bearer, refresh de 401 compartido, aviso en 403) y `mockBackendInterceptor` (API `/api/*` con permisos RBAC) |
| `core/guards` | `authGuard` y `roleGuard(...roles)` con `canMatch`: la ruta ni se descarga si no hay permiso |
| `shared/components` | `DataTableComponent`, `StatWidgetComponent`, `GraficoComponent`, `CabeceraComponent` (Inputs/Outputs, `OnPush`) |
| `pages` | Pantallas con carga diferida: login, registro, inicio, productos, movimientos, dashboard, usuarios, ayuda |

Roles: **admin** (todo) y **user** (consulta de productos y movimientos). Un usuario estándar que pide `/dashboard` o `/usuarios` es redirigido; la API devuelve 403 aunque se llame directamente.

## Git Flow

- `main`: producción (cada push despliega en Vercel si el CI pasa).
- `develop`: integración.
- `feature/*`: una rama por bloque de trabajo, fusionada con `--no-ff` en `develop` (y `develop` en `main` por Pull Request).

## CI/CD

`.github/workflows/ci.yml`: lint, pruebas, build de producción y Compodoc en cada push y Pull Request. El trabajo `desplegar` depende de `calidad` (`needs`), así que **si fallan las pruebas no hay despliegue**. Secretos necesarios: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## Manual de usuario

El manual completo está integrado en la aplicación (menú **Ayuda**) y resumido en `memoria/manual-usuario.md`.
