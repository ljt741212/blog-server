# Coding Standards

Based on `eslint.config.mjs`, `.prettierrc`, and `tsconfig.json`.

## ESLint / Prettier

- **Quotes**: single (`'`)
- **Trailing commas**: `all`
- **No `any`**: `@typescript-eslint/no-explicit-any` is off (allowed where necessary), but prefer strong types
- **No floating promises**: warned — always `await` or `.catch()`
- **No `../` imports**: use `@/` alias instead. `import/no-relative-parent-imports: error`
- **Import order**: `builtin` → `external` → `internal` (`@/**`) → `parent` → `sibling` → `index`. Blank line between groups. Alphabetical within group.
- **CommonJS source**: `sourceType: 'commonjs'` — no `import.meta` in app code

## TypeScript

- **Target**: ES2023
- **Module**: NodeNext (`nodenext`)
- **Paths**: `@/*` maps to `src/*`
- **Strict null checks**: enabled
- **No implicit any**: off (but avoid)
- **Decorators**: enabled (`experimentalDecorators`, `emitDecoratorMetadata`)

## NestJS Architecture

### Module Structure

```
src/modules/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.entity.ts
  <feature>.dto.ts
```

### Shared Code

```
src/shared/
  auth/          # Global auth (JWT config, AuthUtil)
  database/      # DatabaseModule, EntitiesModule
```

### Common

```
src/common/
  constants/     # Response codes, content types
  decorators/    # @Bypass, @CurrentUser
  guards/        # JwtAuthGuard, SuperAdminGuard
  interceptors/  # TransformInterceptor
  model/         # ResOp response wrapper
  pagination/    # PaginationQueryDto, AdminPageQueryDto, utils
```

### Rules

1. **One entity per module** — each feature module owns its entity
2. **DTO per module** — request validation uses `class-validator` decorators
3. **Pagination**:
   - Public-facing: `PaginationQueryDto` (`page`/`limit`)
   - Admin: `AdminPageQueryDto` (`current`/`pageSize`/`searchValue`)
4. **Auth**: `@UseGuards(JwtAuthGuard)` on write endpoints; public read endpoints skip it
5. **Response format**: all responses auto-wrapped via `TransformInterceptor` into `{ data, code, message }`; use `@Bypass()` for file downloads/streaming
6. **Error handling**: throw NestJS exceptions (`BadRequestException`, `NotFoundException`, `UnauthorizedException`)
7. **No `console.log`** in services — use NestJS Logger
8. **Passwords**: always hashed with `bcryptjs` (rounds=10), never stored or compared in plaintext
9. **Env vars**: use `env()` / `envString()` / `envNumber()` / `envBoolean()` from `@/global/env`; never read `process.env` directly outside config files

## ES6+ Patterns

- Prefer `const`/`let` over `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Use destructuring for function params
- Use `async/await` over raw promises
- Use `private readonly` for injected dependencies
- Use template literals over string concatenation
- Use `Map`/`Set` when appropriate

## File Naming

- `kebab-case` for files: `user.service.ts`, `post.controller.ts`
- `PascalCase` for classes, interfaces, enums
- `camelCase` for variables, functions, methods
- `UPPER_SNAKE_CASE` for constants
