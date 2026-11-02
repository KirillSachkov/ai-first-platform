# Backend

Modular monolith: `src/modules/<module>/` per domain module, `src/edge/` for request entry, `src/system/` for technical endpoints, `src/shared/` for technical code. `pnpm boundaries` enforces the layout; its violation messages say where code belongs. Rationale: ADR-0002–0004 in `docs/adr/`.

## Adding a feature

- Create `src/modules/<module>/features/<feature>/` with `<feature>.endpoint.ts` (route, access, OpenAPI), `<feature>.handler.ts` (logic) and `<feature>.schemas.ts` (zod input and output), then register both classes in `<module>.module.ts`. Follow `src/system/get-system-status/`.
- **Commands** change state: load and save through domain entities and repository ports declared in `domain/` and implemented in `infrastructure/`. **Queries** may read the module's own tables with Drizzle directly in the slice: reads carry no invariants, so the domain layer adds nothing there.
- A change that another module must react to is an integration event published by the owning module (outbox → RabbitMQ → inbox), never a synchronous write into another module or a shared transaction. Synchronous calls are for reads and checks along the graph in `.dependency-cruiser.cjs`.
- Sign-in, account activity and access are checked synchronously in `src/edge/` before the feature runs. An endpoint declares its access with a decorator from `src/shared/http/`; until a sign-in method exists, only `@PublicEndpoint()` is defined and the edge rejects every other endpoint. Features will take `RequestContext` (`src/shared/request-context.ts`) as input.

## Tests

Rules and test kinds: `docs/agents/testing.md`.

- Unit tests are `*.test.ts` next to the code and need no Docker. Sample: `src/shared/async/with-timeout.test.ts`.
- Integration tests are `*.int.test.ts` next to the endpoint. Call `useTestApp()` from `test/test-app.ts`, send requests with `api.inject(...)`, and parse the body with the slice's response schema. Sample: `src/system/get-system-status/get-system-status.int.test.ts`; test-only modules: `src/edge/edge.int.test.ts`.
- Shared test infrastructure (containers, database copies, vhosts) lives in `test/`.

## Gotchas

- Read the current time from `@Inject(CLOCK)` (`src/shared/time/clock.ts`), not `new Date()`, so integration tests can fix it.
- Inject every dependency with `@Inject(TOKEN_OR_CLASS)`. `tsx` runs the dev server without decorator metadata, so a constructor parameter without `@Inject` silently receives no value.
- After changing a module's Drizzle schema, run `pnpm db:generate`. Each module has its own migrations folder and history table in its own Postgres schema.
- After changing endpoint zod schemas, run `pnpm api:generate` from the repository root and commit `openapi/openapi.json` with the regenerated web client.
