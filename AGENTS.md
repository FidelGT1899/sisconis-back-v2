# AGENTS.md — Guía para agentes de código

## Comandos esenciales

| Acción | Comando |
|---|---|
| Instalar dependencias | `pnpm install` |
| Desarrollo | `pnpm run dev` |
| Typecheck | `pnpm run typecheck` |
| Lint | `pnpm lint` |
| Test | `pnpm test` |
| Solo unit tests | `pnpm test:unit` |
| Solo integration tests | `pnpm test:integration` |
| Test con cobertura | `pnpm test:coverage` |
| Build | `pnpm run build` |
| Seed DB | `pnpm run seed` |
| Generar Prisma Client | `pnpm prisma generate` |

CI ejecuta en orden: **lint → test → build → docker build**. Todos deben pasar antes de mergear.

---

## Stack

- **Runtime**: Node.js 22, pnpm 10.22
- **Framework**: Express 5 + TypeScript 5.9 (strict mode)
- **DI**: InversifyJS (decorators + `reflect-metadata`)
- **DB**: PostgreSQL 16 via Prisma 7 (multi-schema: `public`, `users`, `auth`)
- **Cache/Sesiones**: Redis 7 via ioredis
- **Auth**: JWT (access tokens) + refresh tokens en Redis, bcrypt (12 rounds)
- **Validación**: Zod v4
- **Testing**: Jest 30 + ts-jest (ESM) + Supertest, jest-mock-extended
- **Formato**: ESLint 9 (flat config) + Prettier (4 espacios, single quotes, semicolons)

**Fuente**: `package.json`, `eslint.config.ts`, `.prettierrc`, `tsconfig.base.json`, `jest.config.mjs`

---

## Arquitectura

**Clean Architecture + DDD**, organizada por módulos feature-centric con capas internas:

```
src/
├── modules/
│   ├── <module>/
│   │   ├── domain/          # Entidades, Value Objects, errors, repository interfaces, ports
│   │   ├── application/     # Use cases, DTOs (interfaces), errors, factories, mappers
│   │   └── infrastructure/  # Controllers HTTP, routes, Zod schemas, repos (Prisma/Redis), mappers
│   └── ...
├── shared/
│   ├── domain/              # EntityBase, ValueObjectBase, IRepository, ports (ILogger, IPasswordHasher, etc.)
│   ├── kernel/              # Error hierarchy (AppError → DomainError/ApplicationError/InfrastructureError/UnexpectedError), Result<T,E>, utils
│   └── infrastructure/      # Prisma, Redis, bcrypt, loggers, config, IoC container, HTTP adapter, base controller, middlewares
```

**Módulos actuales**: `users`, `auth`, `system`

**Regla de dependencias**: Las capas solo dependen hacia adentro. `domain` no importa de `infrastructure`. `application` no importa de `infrastructure` (usa interfaces/ports de `domain`).

**Fuente**: `src/` structure, `README.md`, análisis de imports

---

## Dependency Injection (InversifyJS)

- **Container**: `src/shared/infrastructure/ioc/container.ts` — `Container` con `defaultScope: 'Singleton'`
- **Types**: `src/shared/infrastructure/ioc/types.ts` — `Symbol.for()` keys para cada binding
- **Modules**: `src/shared/infrastructure/ioc/modules/*.module.ts` — un `ContainerModule` por feature

**Convenciones de binding**:
- **Repositorios y puertos** → `singleton` (comparten conexión DB)
- **Use cases** → `transient`
- **Controllers** → `transient`
- **Routers** → `toDynamicValue` (factory que resuelve controllers y crea las rutas)

Al agregar un nuevo use case o controller, registrar en el módulo correspondiente y agregar su `Symbol` en `types.ts`.

**Fuente**: `src/shared/infrastructure/ioc/container.ts`, `src/shared/infrastructure/ioc/modules/users.module.ts`

---

## Entidades y Value Objects

### Entidades

Todas extienden `EntityBase<TId, Props>` (`src/shared/domain/entity.base.ts`):
- Constructor privado
- Factory estáticos: `create()` (nueva), `fromExisting()` (rehidratación), `rehydrate()` (sin validación)
- Retornan `Result<Entity, DomainError>`
- Comportamiento con métodos de negocio (ej: `activate()`, `deactivate()`, `changePassword()`)

**Fuente**: `src/modules/users/domain/entities/user.entity.ts`

### Value Objects

Todos extienden `ValueObjectBase` (`src/shared/domain/value-object.base.ts`):
- Constructor privado
- Factory estático `create()` retorna `Result<VO, DomainError>`
- Implementan `getEqualityComponents()` para comparación por valor
- Validan en `create()`, no en constructor

**Fuente**: `src/modules/users/domain/value-objects/*.ts`, `src/shared/domain/value-object.base.ts`

---

## Error Handling

### Jerarquía de errores

```
AppError (abstract, code + statusCode)
├── DomainError (400 default)
├── ApplicationError (400 default)
├── InfrastructureError (500 default)
└── UnexpectedError (500 default)
```

**Ubicación**: `src/shared/kernel/errors/`

### Patrón `Result<T, E>`

- Use cases y domain retornan `Result<T, AppError>` en vez de lanzar excepciones
- `Result.ok(value)` / `Result.fail(error)`
- Assert: `result.isOk()`, `result.isErr()`, `result.value()`, `result.error()`

**Fuente**: `src/shared/kernel/errors/result.ts`

### Errores HTTP

Los controllers usan `BaseController` que provee helpers: `ok()`, `created()`, `noContent()`, `badRequest()`, `unauthorized()`, `fail()`, `handleResult()`, `fromResult()`.

El middleware global (`error.middleware.ts`) maneja:
- `ZodError` → 400 INVALID_INPUT
- `AppError` → statusCode + code
- `Error` genérico → 500 UNEXPECTED_ERROR (en producción oculta el mensaje real)

**Fuente**: `src/shared/infrastructure/http/middlewares/error.middleware.ts`, `src/shared/infrastructure/http/base/base.controller.ts`

---

## Controllers

- Cada endpoint tiene **un controller** dedicado (ej: `create-user.controller.ts`)
- Extienden `BaseController`, implementan `Controller.handle(HttpRequest): Promise<HttpResponse>`
- Son **framework-agnostic**: reciben `HttpRequest`, no Express `Request`
- `expressAdapter()` (`src/shared/infrastructure/http/adapters/express.adapter.ts`) adapta al Express handler
- Parsean Zod schemas inline con `.parse()` en vez de middleware de validación
- Un solo caso de uso por controller

**Fuente**: `src/modules/users/infrastructure/http/controllers/*.controller.ts`

---

## Validación con Zod

- Schemas HTTP en `infrastructure/http/requests/*.schema.ts` (archivos separados de los DTOs)
- DTOs de aplicación en `application/dtos/*.dto.ts` son interfaces TypeScript puras
- Los controllers llaman `Schema.parse(req.body/params/query)` inline
- Errores Zod se propagan al middleware global

**Fuente**: `src/modules/users/infrastructure/http/requests/*.schema.ts`, `src/modules/users/application/dtos/*.dto.ts`

---

## Path Aliases

Definidos en `tsconfig.base.json` (`paths`) y, en paralelo, en `jest.config.mjs` (`moduleNameMapper`).

Aliases **presentes en ambos** (seguros para uso en código y tests):

| Alias | Destino |
|---|---|
| `@shared-kernel/*` | `src/shared/kernel/*` |
| `@shared-domain/*` | `src/shared/domain/*` |
| `@shared-infrastructure/*` | `src/shared/infrastructure/*` |
| `@users-domain/*` | `src/modules/users/domain/*` |
| `@users-application/*` | `src/modules/users/application/*` |
| `@users-infrastructure/*` | `src/modules/users/infrastructure/*` |
| `@tests-factories/*` | `tests/factories/*` |
| `@system-domain/*` | `src/modules/system/domain/*` |
| `@system-application/*` | `src/modules/system/application/*` |
| `@system-infrastructure/*` | `src/modules/system/infrastructure/*` |

Aliases **solo en `jest.config.mjs`** (resuelven en tests, pero NO en `tsconfig`; no usarlos en código fuente o romperán typecheck/build):
- `@modules/*` → `src/modules/*`
- `@users/*` → `src/modules/users/*`

Aliases **solo en `tsconfig.base.json`** (resuelven en source y typecheck, pero **ausentes en `jest.config.mjs`**; no usarlos en tests o Jest no los resolverá):
- `@auth-domain/*`, `@auth-application/*`, `@auth-infrastructure/*` → `src/modules/auth/{domain,application,infrastructure}/*`

Usa siempre aliases para los imports (incluso dentro del mismo módulo, ej. `@users-domain/...` dentro de `users/`). No existen barrel files (`index.ts`); los imports apuntan directamente al archivo específico.

**Fuente**: `tsconfig.base.json` (paths), `jest.config.mjs` (moduleNameMapper)

---

## Testing

### Framework y configuración

- Jest 30 + ts-jest (ESM preset), archivo: `jest.config.mjs`
- Variables de entorno en `tests/setup.ts` (mock DB, JWT, Redis)
- Coverage con v8 provider, reportes: text + lcov + html
- Scripts disponibles: `pnpm test`, `pnpm test:unit` (solo unit), `pnpm test:integration` (solo integration), `pnpm test:coverage`

### Estructura de tests

Los tests viven en `tests/`, separados de `src/`:

```
tests/
├── setup.ts                                    # Variables de entorno para tests
├── factories/
│   ├── http-request.factory.ts                 # makeHttpRequest() para controller tests
│   └── users/
│       ├── mocks.ts                            # Mock factories (makeMockIdGenerator, makeMockPasswordHasher, makeMockUserRepository, makePrismaUser)
│       ├── user.factory.ts                     # UserEntity builders (makeUserEntity, makeUserProps, makeExistingUserProps)
│       └── role.factory.ts                     # RoleEntity y RoleReferenceVO builders (makeRoleEntity, makeRoleReference)
├── unit/                                       # Tests unitarios
│   ├── shared/                                 # shared/ (domain, kernel, infrastructure)
│   └── modules/                                # modules/ (refleja estructura de src/)
│       └── users/
│           ├── domain/
│           ├── application/use-cases/user/
│           └── infrastructure/
└── integration/
    └── app.test.ts                             # Tests de integración del Express app
```

### Convenciones

- **Nombre**: `*.test.ts` (no se usa `.spec.ts`)
- **Ubicación**: Directorio `tests/unit/` reflejando la estructura de `src/` (ej: `tests/unit/modules/users/application/use-cases/user/create-user.use-case.test.ts`)
- **Factories**: Ubicadas en `tests/factories/` con funciones `make*`
- **HTTP test helper**: `makeHttpRequest()` en `tests/factories/http-request.factory.ts`

### Patrones de mocking

- **`jest-mock-extended`**: `mock<T>()` para repositorios e interfaces (principal mecanismo de mocking)
- **Inline `jest.fn()`**: Para use cases en controller tests
- **No se usa `jest.mock()`** en ningún lugar del proyecto
- **No hay `__mocks__` directories**
- Prisma se mockea con `mockDeep<PrismaClient>()` de jest-mock-extended

### Estructura típica de un test

```ts
// arrange: crear mocks con jest-mock-extended o factories
const mockRepo = mock<IUserRepository>();
const useCase = new CreateUserUseCase(mockRepo, mockHasher, mockIdGen);

// act
const result = await useCase.execute(dto);

// assert
expect(result.isOk()).toBe(true);
expect(result.value()).toHaveProperty('id');
```

Controller tests llaman `controller.handle(makeHttpRequest({...}))` y asertan sobre `response.statusCode` y `response.body`.

**Fuente**: `jest.config.mjs`, `tests/factories/`, `tests/unit/`

---

## Prisma / Base de datos

- **Schema**: `prisma/schema.prisma`
- **Multi-schema**: `public`, `users`, `auth`
- **Soft delete**: Campo `deletedAt` en todas las entidades
- **Unique constraints parciales**: `@@unique` con `WHERE deleted_at IS NULL`
- **Audit fields**: `createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy`
- **Migraciones**: `prisma/migrations/` — crear con `pnpm prisma migrate dev --name <nombre>`
- **Después de cambios en schema**: Siempre ejecutar `pnpm prisma generate`
- **Mapper Prisma errors**: `src/shared/infrastructure/database/prisma/errors/prisma-error.mapper.ts` mapea códigos Prisma a `InfrastructureError` (P2002→409, P2003→400, P2025→404, etc.)
- **Repositorios**: Interface en `domain/repositories/`, implementación en `infrastructure/persistence/repositories/` que usa `PrismaService`

**Fuente**: `prisma/schema.prisma`, `src/shared/infrastructure/database/prisma/errors/`

---

## Comandos de commit

[Conventional Commits](https://www.conventionalcommits.org/) validados por commitlint en CI.

**Tipos permitidos**: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`

**Reglas** (`.commitlintrc.json`):
- Type en minúsculas, obligatorio
- Subject obligatorio, no vacío
- Header máximo 100 caracteres

Ejemplos:
```
feat: add permission request endpoint
fix: handle invalid date input
refactor: extract validation logic to domain layer
test: add unit test for permission use case
```

**Fuente**: `.commitlintrc.json`, `.github/workflows/commitlint.yml`

---

## Git / CI

- **Trunk-based development**: `main` siempre deployable
- **Ramas**: `feature/*`, `fix/*`, `release/*`, `hotfix/*` — vida corta
- **Merge**: Solo vía Pull Request, **no se permiten merge commits** (CI los bloquea — usar rebase)
- **CI** (`.github/workflows/ci.yml`): 3 jobs secuenciales:
  1. `prevent-merge-commits` — bloquea merge commits
  2. `build-and-test` — lint → test → build (Node 22.12.0, pnpm 10.22.0)
  3. `docker-build` — verifica que la imagen Docker se construya correctamente
- **Commitlint** (`.github/workflows/commitlint.yml`): valida commits en PRs contra `.commitlintrc.json`
- **No hay husky ni lint-staged**: el lint y tests se ejecutan en CI, no localmente pre-commit

**Fuente**: `.github/workflows/ci.yml`, `.github/workflows/commitlint.yml`, `.commitlintrc.json`

---

## Código y formato

- **Indentación**: 4 espacios
- **Quotes**: Single quotes
- **Semicolons**: Sí
- **Trailing commas**: En todas posiciones
- **Variables no usadas**: Error (prefijo `_` para ignorar)
- **TypeScript strict mode**: Activado (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`)
- **Decorators**: `experimentalDecorators` + `emitDecoratorMetadata` (requeridos por InversifyJS)

**Fuente**: `.prettierrc`, `.editorconfig`, `tsconfig.base.json`, `eslint.config.ts`

---

## Reglas para cambios al agregar un módulo nuevo

1. Crear la estructura `domain/`, `application/`, `infrastructure/` dentro de `modules/<module>/`
2. Definir entities y value objects en `domain/` extiendiendo `EntityBase` / `ValueObjectBase`
3. Definir repository interfaces en `domain/repositories/`
4. Crear use cases en `application/use-cases/` retornando `Result<T, AppError>`
5. Crear DTOs como interfaces TypeScript en `application/dtos/`
6. Implementar repos en `infrastructure/persistence/repositories/` usando Prisma
7. Crear controllers en `infrastructure/http/controllers/` extendiendo `BaseController`
8. Crear Zod schemas en `infrastructure/http/requests/` para validación HTTP
9. Crear routes en `infrastructure/http/routes/`
10. Registrar en IoC: agregar symbols en `types.ts`, crear module en `ioc/modules/`, cargar en `container.ts`
11. Agregar path aliases en `tsconfig.base.json` y `jest.config.mjs`
12. Escribir tests en `tests/unit/modules/<module>/` con factories en `tests/factories/`
