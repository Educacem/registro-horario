<!-- docs/INDEX.md -->

# Arquitectura del proyecto (Timply / Registro horario)

## Stack

- **Next.js 15 (App Router)**: UI + API en el mismo proyecto.
- **TypeScript**: tipado y seguridad.
- **Prisma**: ORM para acceder a la base de datos.
- **PostgreSQL**: persistencia (local o RDS/Cloud).
- **Vercel**: despliegue y ejecución en producción.

---

## Estructura general

Este proyecto tiene 2 “capas” principales:

1. **Frontend (UI)**

- Páginas y componentes bajo `src/app/**`.
- Layouts y providers en `src/app/layout.tsx`, `src/app/providers.tsx`, etc.

2. **Backend (API)**

- Endpoints en `src/app/api/**/route.ts`.
- Cada endpoint implementa handlers `GET/POST/PUT/DELETE`.
- Los handlers llaman a funciones de negocio en `src/lib/**` (services/functions).
- Prisma se encarga de la query a Postgres.

---

## Flujo de una request (API)

Ejemplo conceptual:

1. Cliente (Postman o UI) llama a: `GET /api/workers`
2. Next ejecuta: `src/app/api/workers/route.ts`
3. (Opcional) se valida API Key: `checkApiKey(req)` leyendo `x-api-key`
4. El handler llama a una función de negocio: `getAllWorkers()` (en `src/lib/...`)
5. Esa función ejecuta Prisma: `prisma.worker.findMany(...)`
6. Prisma consulta Postgres y devuelve datos
7. El handler responde con `NextResponse.json(...)`

---

## Autenticación de endpoints (API Key)

- Los endpoints usan un header tipo: `x-api-key: <token>`
- La lógica suele estar centralizada en `checkApiKey(req)` (ej: `src/helper/functions`)
- Si no es válida, se devuelve un error (401/403) y se corta el flujo.

Recomendación:

- Mantener esta verificación en todos los endpoints críticos.
- En producción, guardar la clave en variables de entorno (Vercel).

---

## Base de datos y modelos (Prisma)

El esquema está en:

- `prisma/schema.prisma`

Modelos principales (alto nivel):

- `Worker`: trabajador
- `WorkTime`: fichajes (clockIn/clockOut) relacionados con Worker
- `Company`: empresa relacionada con Worker (via `companyId`)

Relaciones:

- `Company (1) -> (N) Worker`
- `Worker (1) -> (N) WorkTime`

---

## Migraciones (lo más importante)

### Local (desarrollo)

- Se crea una migración cuando cambias `schema.prisma`:
  - `npx prisma migrate dev --name <nombre>`
- Esto genera archivos en:
  - `prisma/migrations/**`

### Producción (cloud)

- En producción NO se crea migración, solo se aplican:
  - `npx prisma migrate deploy`

### Baseline (cuando la DB ya existía)

Si la DB ya tenía tablas pero Prisma no tenía historial:

- `npx prisma migrate resolve --applied <migration_name>`
  Esto NO ejecuta SQL, solo marca migraciones en `_prisma_migrations`.

Regla práctica:

- **`resolve` marca**.
- **`deploy` aplica**.

---

## Variables de entorno

### Local

- `.env` / `.env.local`
- Contiene `DATABASE_URL` apuntando a tu Postgres local.

### Producción (Vercel)

- Variables en: Project Settings → Environment Variables
- `DATABASE_URL` apuntando a tu Postgres cloud.

Importante:

- Evita usar la DB de producción como DB “de desarrollo” desde local.

---

## Deploy en Vercel

- Push a la rama de producción (ej: `master`) dispara build/deploy (si está conectado).
- Para Prisma, se recomienda asegurar generación del client en build:
  - `postinstall: prisma generate`
  - o `build: prisma generate && next build`

---

## Debugging (VS Code)

- Se puede depurar el servidor Next con configuraciones `launch.json`.
- Para endpoints (route.ts), lo normal es:
  1. arrancar Next en debug
  2. llamar al endpoint (Postman)
  3. el breakpoint se activa al ejecutarse el handler

---

## Convenciones recomendadas del código

- Endpoints (`route.ts`) deben ser finos:
  - validar request (params/query/body/headers)
  - auth
  - llamar a `src/lib/**`
  - devolver response

- `src/lib/**`:
  - contiene lógica de negocio
  - consultas Prisma
  - funciones reutilizables

- `prisma/`:
  - schema y migraciones versionadas con Git

---

## Comandos útiles

- Generar Prisma Client:
  - `npx prisma generate`
- Crear migración (dev):
  - `npx prisma migrate dev --name <name>`
- Aplicar migraciones (prod):
  - `npx prisma migrate deploy`
- Ver estado migraciones:
  - `npx prisma migrate status`
- Abrir Prisma Studio:
  - `npx prisma studio`
