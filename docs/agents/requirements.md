# Requirements and change specifications

Every implementation needs a GitHub issue before repository changes begin. Read its comments and linked decisions when preparing the assignment. A readiness label alone does not make an issue ready.

## Choose the artifact

- Use a short issue for a clear bug, bounded documentation/configuration change, or refactoring with known invariants.
- Use a full change spec for behavior with unresolved choices, several scenarios or contributors, contract changes, or costly failure. After discussing the decisions, propose `to-spec` for the owner to select.
- When independent, verifiable slices or multiple sessions need explicit dependencies, propose `to-tickets` for the owner to select. Tickets refer to the parent requirements instead of copying them.
- Keep a large idea or release in scope documents until concrete behavior is ready to specify. A full application spec is not a prerequisite for every task.

## Current behavior and history

A proposed domain model in `docs/domain-model.md` does not prove implemented behavior.

A change spec lives in its GitHub issue. It records what was requested and why at that time. After merge, preserve it unchanged as history; never edit it to describe later behavior.

Each question about current behavior has one owner:

- Behavior: tests at the seams in [testing.md](testing.md), named as [testing.md](testing.md#placement-and-naming) requires.
- Terms: `GLOSSARY.md`.
- Decisions that meet the [ADR criteria](../../.agents/skills/domain-modeling/ADR-FORMAT.md#when-to-offer-an-adr), including deliberate non-goals: ADRs.

Keep current behavior in these sources only, without a separate prose document. A lasting requirement that a test cannot check goes into an ADR when it meets those criteria; otherwise its issue remains its record. To learn the current behavior of a capability, read its tests, `GLOSSARY.md`, the related ADRs, and the issues linked from them.

## Content and human decisions

A short issue records the problem, desired and preserved behavior, scope, acceptance criteria, and verification. A full spec uses the `to-spec` template and also records preserved behavior and agreed human checkpoints. It covers success, failure, access, and boundary scenarios within the agreed scope and keeps unresolved decisions explicit. Plan acceptance with [human participation](human-review.md).

Before a spec is published, the owner confirms behavior, scope, criteria, and human checkpoints.

## When requirements change

Before changing agreed behavior, show the semantic difference and follow [Ask the owner](human-review.md#ask-the-owner). Record the decision in the issue. Update affected criteria, tickets, dependencies, tests, and implementation.

After merge, a new desired behavior gets a new change issue. The new issue links the earlier issue and names each criterion it replaces. A violation of tested behavior or of an accepted criterion gets a bug issue. Change tests before code as [testing.md](testing.md#when-a-test-is-required) requires.

When code, tests, and issues disagree, identify the accepted decision: the latest owner-approved criterion. Code shows actual behavior; it does not establish desired behavior. A passing test does not justify rewriting the requirement to match it. Conflicting accepted decisions return to the owner.
