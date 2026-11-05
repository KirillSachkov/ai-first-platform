# Testing

Rules for writing, choosing, running, and reviewing tests. Agreed with the owner in #14 and specified in #19. The rationale for seams and real infrastructure is [ADR-0005](../adr/0005-tests-at-public-seams-on-real-infrastructure.md).

## Test kinds and seams

A **seam** is the public boundary a test calls the system through and observes the result at. Test only at the seams below; a new seam needs the owner's agreement.

| Kind              | Seam                                                                                    | Substitutes                                         | Sample                                                                                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit (backend)    | Domain entities and module functions, pure technical functions                          | none                                                | [`with-timeout.test.ts`](../../apps/api/src/shared/async/with-timeout.test.ts), [`config.test.ts`](../../apps/api/src/shared/config/config.test.ts)                          |
| Module            | The module's public contract through its token, called as another module calls it      | none, real database                                 | none yet: arrives with the first contract other modules call (first «Доступ» contract)                                                                                       |
| Integration       | HTTP API of the app started in process, requests through Fastify `inject`              | external services, time                             | [`health.int.test.ts`](../../apps/api/src/system/health/health.int.test.ts), [`get-system-status.int.test.ts`](../../apps/api/src/system/get-system-status/get-system-status.int.test.ts) |
| Integration, edge | The same, with a test-only module                                                       | as integration                                      | [`edge.int.test.ts`](../../apps/api/src/edge/edge.int.test.ts)                                                                                                                |
| Event             | A feature publishes an integration event; the test observes the subscriber's result   | none, real RabbitMQ                                 | none yet: arrives with the first feature that publishes an event (ADR-0003)                                                                                                  |
| Architecture      | dependency-cruiser, Steiger, OpenAPI drift check                                        | —                                                   | already in `pnpm check`                                                                                                                                                      |
| Unit (frontend)   | Pure functions and entity models                                                        | none                                                | none yet: no frontend unit code exists                                                                                                                                       |
| Component         | A page or feature in Vitest browser mode with the real router and Query               | HTTP through MSW, typed by the generated OpenAPI schema | [`system-page.component.test.tsx`](../../apps/web/src/pages/system/system-page.component.test.tsx)                                                                     |
| E2E               | A browser against the stack that Docker Compose runs                                    | none                                                | [`system-status.test.ts`](../../e2e/tests/system-status.test.ts)                                                                                                            |
| Smoke             | The running stack: readiness, PostgreSQL outage, recovery                               | —                                                   | [`scripts/smoke.mjs`](../../scripts/smoke.mjs)                                                                                                                               |

Start a new test from the sample of its kind. Specs cite these samples as prior art in Testing Decisions.

### Choosing the kind

- An entity rule gets a unit test.
- A feature behaviour gets an integration test.
- A decision a module gives to other modules gets a module test.
- An integration event gets an event test from publication to the subscriber's result.
- A readiness criterion scenario from the spec gets an E2E test.
- Check each behaviour at one level. The exception is critical access scenarios: an integration test plus one E2E test per readiness criterion.

### Substitutes

Substitute only time, randomness, and external services. Use real PostgreSQL, RabbitMQ, migrations, Drizzle, repositories, and our own modules.

- Time comes through the injectable clock: code reads it with `@Inject(CLOCK)` from `src/shared/time/clock.ts`, never with `new Date()`. An integration test fixes it with `useTestApp({ clock })`; sample: [`get-system-status.int.test.ts`](../../apps/api/src/system/get-system-status/get-system-status.int.test.ts). Unit tests use `vi.useFakeTimers()`.
- External services sit behind module ports; the test supplies the port implementation.
- Frontend component tests answer HTTP with MSW handlers from `apps/web/test/msw.ts`. `http` is typed by the OpenAPI schema, so a response that breaks the schema does not compile. Use `response.untyped(...)` only for statuses the schema does not declare, with a comment.
- E2E tests substitute nothing. They create their own data through the public API with values from `uniqueValue()` ([`e2e/support/unique-value.ts`](../../e2e/support/unique-value.ts)) and never reset the database.

### Checks inside a test

- Parse every HTTP response body with the slice's zod response schema (`*ResponseSchema` in `<feature>.schemas.ts`), then assert literals.
- Component tests of a page run `expectNoAxeViolations` (`apps/web/test/axe.ts`) for each state.
- Wait with auto-retrying assertions (`expect.element`, Playwright `expect`), never with sleeps.

## When a test is required

| Change                     | Rule                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| New feature                | Every behaviour gets a test written before the code. Watch it fail first, then make it pass.                         |
| Bug fix                    | Start with a test that reproduces the bug and fails. Then fix the code.                                              |
| Refactoring                | Existing tests pass unchanged. For uncovered code, first pin current behaviour with tests, then refactor.            |
| Behaviour change           | Change the test first and watch it fail, then change the code.                                                       |
| CI, Docker, tool configs, documentation | No tests. Run `pnpm check` and, for CI or Docker, the affected level.                               |

## Where expected values come from

Take expected values from the first source that defines them:

1. The spec issue.
2. The acceptance criteria of the implementation issue.
3. The existing test of a behaviour that the agreed change preserves.
4. The reproduction steps of the bug.
5. The pull request description.

Write expected values as literals. Never copy them from the code under test or recompute them the way the code does. When no source defines a value, ask the owner.

When you change an assertion in an existing test, explain each changed assertion in the PR description: what it checked, what it checks now, and which source requires the change.

## Flaky tests and coverage

- A flaky test is a failing check. Fix it before delivering affected work; unrelated repairs follow the assignment rules in root `AGENTS.md`. No level retries tests: Vitest has no retries, Playwright runs with `retries: 0` and `failOnFlakyTests: true`.
- There is no coverage threshold. Add a test because a behaviour needs it, never to raise a percentage.
- oxlint rejects focused (`only`) and disabled (`skip`) tests and tests without assertions.

## Placement and naming

| App   | Unit                                    | Integration / component                                | Support code   | Config                     |
| ----- | --------------------------------------- | ------------------------------------------------------ | -------------- | -------------------------- |
| `api` | `src/**/*.test.ts` next to the code     | `src/**/*.int.test.ts` next to the endpoint             | `apps/api/test/` | `apps/api/vitest.config.ts` |
| `web` | `src/**/*.unit.test.ts` next to the code | `src/**/*.component.test.tsx` next to the page or feature | `apps/web/test/` | `apps/web/vitest.config.ts` |
| `e2e` | —                                       | `e2e/tests/*.test.ts`                                  | `e2e/support/` | `e2e/playwright.config.ts` |

Name each test by the behaviour it checks. Tests are the record of current behaviour ([requirements.md](requirements.md#current-behavior-and-history)).

Root scripts use `node:test`: `scripts/*.test.mjs`, sample [`changed-parts.test.mjs`](../../scripts/changed-parts.test.mjs).

## Commands and levels

| Command            | What it runs                                                                                     | Docker |
| ------------------ | ------------------------------------------------------------------------------------------------ | ------ |
| `pnpm check`       | All static checks except gitleaks                                                                | no     |
| `pnpm test:unit`   | Unit tests of `api` and `web`                                                                    | no     |
| `pnpm test`        | All Vitest tests                                                                                 | yes    |
| `pnpm test:e2e`    | Playwright on Compose; `--grep @smoke` runs the PR set                                           | yes    |
| `pnpm smoke`       | Stack outage and recovery                                                                        | yes    |
| `pnpm verify`      | `check`, `test:scripts`, and Vitest tests of the apps changed since `main`. No E2E, no smoke     | yes    |
| `pnpm verify:full` | The `main` level: everything above, `pnpm audit`, gitleaks over history. Run only when asked     | yes    |

In the TDD loop, run one file from the app directory: `pnpm exec vitest run <path-to-test-file>` in `apps/api` or `apps/web`.

Levels:

- **Local loop**: one test file.
- **Before a PR**: `pnpm verify`.
- **PR in CI**: static checks and gitleaks on the diff always. `api` and `web` tests, `@smoke` E2E, `pnpm smoke` (when the smoke script or its lock changes), and audit run only for changed parts (`scripts/changed-parts.mjs`). One required check: `ci-ok`.
- **`main` in CI**: everything, all E2E, smoke, audit, gitleaks over the whole history.

The `main` branch is protected by a ruleset (#24): changes reach it only through a PR with a green `ci-ok`. No pre-commit hooks exist; commit as often as the loop needs.

### Machine sharing

- Vitest uses at most 4 workers per run.
- Integration tests reuse shared PostgreSQL and RabbitMQ containers across runs and worktrees. Each test file gets its own database copy and vhost, so parallel agents do not collide. Remove stale containers with `docker ps --filter label=org.testcontainers=true`.
- `pnpm test:e2e` and `pnpm smoke` share one Compose stack and wait for each other on a machine-wide lock.
- Run `pnpm format` from the repository root only; from an app directory Prettier misses the root `.prettierignore`.

## Self-check before a PR

1. Run `pnpm verify` and make it green.
2. If the change touches the UI, open the page in a browser on the running stack, walk the scenario, and take a screenshot.
3. In the PR description, list the commands you ran with their results, attach the screenshot, and explain every changed assertion.
4. Hand the result to the owner under [human participation](human-review.md) and [merge authority](delivery.md#main-and-owner-acceptance).

## Red `main`

A failure on `main` opens an issue labelled `bug` with a link to the run; a repeat failure comments on it. Prioritize its repair under [delivery scope rules](delivery.md#verification-evidence). Resume dependent work after the failure is resolved; the priority does not start an unrelated implementation.

## Coming later

- Module and event test samples arrive with the first «Доступ» contract and the first published event. The first such task adds its test as the sample and links it here.
- Mutation testing (Stryker) is connected in a separate task together with the first domain rules.
- Visual regression arrives with the design system.
