# Requirements and change specifications

Every implementation needs a GitHub issue before repository changes begin. Read its comments and linked decisions when preparing the assignment.

## Choose the artifact

- Use a short issue for a clear bug, bounded documentation/configuration change, or refactoring with known invariants.
- Use a full change spec for behavior with unresolved choices, several scenarios or contributors, contract changes, or costly failure. After discussing the decisions, propose `to-spec` for the owner to select.
- When independent, verifiable slices or multiple sessions need explicit dependencies, propose `to-tickets` for the owner to select. Tickets refer to the parent requirements instead of copying them.
- Keep a large idea or release in scope documents until concrete behavior is ready to specify. A full application spec is not a prerequisite for every task.

## Keep current requirements distinct from history

A change spec lives in its GitHub issue. Maintain current capability behavior under `docs/requirements/<capability>.md` when that capability is implemented. Create these files as work arrives, rather than generating speculative product documentation during harness setup. Name capabilities by stable behavior, not source-file layout.

A capability document owns the current contract. Link to existing glossary/ADRs and to the issue/PR that changes it. A ticket owns its bounded acceptance criteria. Keep proposed and implemented behavior explicit. Historical change issues remain the record of what was requested at that time.

A short issue records the problem, desired and preserved behavior, scope, acceptance criteria, and verification. Use the `to-spec` template for full specs and [human participation](human-review.md) for acceptance planning.

## When requirements change

Before changing agreed behavior, show the semantic difference and follow [Ask the owner](human-review.md#ask-the-owner). Record the decision in the issue. Update affected criteria, tickets, dependencies, tests, and implementation.

After merge, a new desired behavior gets a new change issue. A violation of the current contract gets a bug issue. Preserve the previous issue as history. Update current capability requirements with code and tests in the same PR. If requirements are merged ahead of implementation, mark them as proposed rather than current behavior.
