# Requirements and change specifications

Every implementation needs a GitHub issue before repository changes begin. A small issue states the problem, desired and preserved behavior, scope, acceptance criteria, and verification. Read its comments and linked decisions before treating it as ready. Missing expected behavior returns to the owner; a label alone is insufficient.

## Choose the artifact

- Use a short issue for a clear bug, bounded documentation/configuration change, or refactoring with known invariants.
- Use a full change spec for behavior with unresolved choices, several scenarios or contributors, contract changes, or costly failure. After discussing the decisions, propose `to-spec` for the owner to select.
- When independent, verifiable slices or multiple sessions need explicit dependencies, propose `to-tickets` for the owner to select. Tickets refer to the parent requirements instead of copying them.
- Keep a large idea or release in scope documents until concrete behavior is ready to specify. A full application spec is not a prerequisite for every task.

## Keep current requirements distinct from history

`customer-requirements.md` holds the brief; `docs/first-version.md` holds delivery scope. `DOMAIN.md`, `docs/domain-model.md`, and ADRs retain their existing purposes. A proposed domain model does not prove implemented behavior.

A change spec lives in its GitHub issue. Maintain current capability behavior under `docs/requirements/<capability>.md` when that capability is implemented. Create these files as work arrives, rather than generating speculative product documentation during harness setup. Name capabilities by stable behavior, not source-file layout.

A capability document owns the current contract. Link to existing glossary/ADRs and to the issue/PR that changes it. A ticket owns its bounded acceptance criteria. Keep proposed and implemented behavior explicit. Historical change issues remain the record of what was requested at that time.

## Content and human decisions

Describe actors and permissions where relevant; success, failure, and boundary scenarios; preserved invariants; observable acceptance criteria; scope and dependencies. Separate required behavior from technical decisions. Reference the existing testing guide for seams, substitutes, commands, and prior art.

For human acceptance, follow [human-review.md](human-review.md). Full specs and small issues need the same clear desired result, at different levels of detail. Apply the language rule in root `AGENTS.md`, including translated template headings.

## When requirements change

Before changing agreed behavior, show the semantic difference and obtain the owner's decision. Record that decision in the issue. Update affected criteria, tickets, dependencies, tests, and implementation. Pause dependent work while the decision is missing; independent authorized work may continue.

After merge, a new desired behavior gets a new change issue. A violation of the current contract gets a bug issue. Preserve the previous issue as history. Update current capability requirements with code and tests in the same PR. If requirements are merged ahead of implementation, mark them as proposed rather than current behavior.

When code, tests, and requirements disagree, identify the accepted decision. Code shows actual behavior; it does not establish desired behavior. A passing test does not justify rewriting the requirement to match it. Conflicting accepted decisions return to the owner.
