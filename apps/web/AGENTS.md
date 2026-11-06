# Frontend

React SPA organised by Feature-Sliced Design; `pnpm boundaries` (Steiger) checks layers and slice public APIs.

## Placing code

- `src/app/` holds providers, styles and TanStack Router file routes in `src/app/routes/`. A route file only mounts a page from `@/pages/<page>` or redirects; loaders and UI live in the page.
- `pages` are screens, `widgets` are composite blocks, `features` are user actions (invite an employee, connect an agent), `entities` are domain objects (employee, invitation, project, repository, agent-connection), `shared` is domain-free code.
- Each slice exposes its public API through `index.ts`; import other slices only through it. Layers import only from layers below them.
- shadcn/ui components go to `src/shared/ui/` (`components.json` points the CLI there).

## Tests

Rules, kinds, file names and samples: `docs/agents/testing.md`. Component tests render with `renderApp(url)` from `test/render-app.tsx`, answer HTTP with `worker.use(http.get(...))` from `test/msw.ts`, and check `expectNoAxeViolations` from `test/axe.ts`.

- Add a new runtime dependency of tested code to `optimizeDeps.include` in `vitest.config.ts`; otherwise Vite reloads the test page mid-run.

## API client

- The backend is reached through same-origin `/api` with `$api` from `@/shared/api`; the Vite dev server proxies it to the backend.
- `src/shared/api/schema.gen.ts` is generated from `apps/api/openapi/openapi.json`; regenerate it with `pnpm api:generate` (see `apps/api/AGENTS.md`).
