# Frontend

React SPA organised by Feature-Sliced Design; `pnpm boundaries` (Steiger) checks layers and slice public APIs.

## Placing code

- `src/app/` holds providers, styles and TanStack Router file routes in `src/app/routes/`. A route file only mounts a page from `@/pages/<page>` or redirects; loaders and UI live in the page.
- `pages` are screens, `widgets` are composite blocks, `features` are user actions (invite an employee, connect an agent), `entities` are domain objects (employee, invitation, project, repository, agent-connection), `shared` is domain-free code.
- Each slice exposes its public API through `index.ts`; import other slices only through it. Layers import only from layers below them.
- shadcn/ui components go to `src/shared/ui/` (`components.json` points the CLI there).

## Tests

Rules and test kinds: `docs/agents/testing.md`.

- Component tests are `*.component.test.tsx` next to the page or feature and run in Chromium. Render with `renderApp(url)` from `test/render-app.tsx`, answer HTTP with `worker.use(http.get(...))` from `test/msw.ts`, and check `expectNoAxeViolations` from `test/axe.ts`. Sample: `src/pages/system/system-page.component.test.tsx`.
- Unit tests are `*.unit.test.ts` next to the code.
- Install Chromium once: `pnpm --filter @platform/web exec playwright install chromium`.
- Add a new runtime dependency of tested code to `optimizeDeps.include` in `vitest.config.ts`; otherwise Vite reloads the test page mid-run.

## API client

- The backend is reached through same-origin `/api` with `$api` from `@/shared/api`; the Vite dev server proxies it to the backend.
- `src/shared/api/schema.gen.ts` is generated from `apps/api/openapi/openapi.json`. After any backend endpoint change, run `pnpm api:generate` from the repository root and commit both files; `pnpm check` fails while they drift.
