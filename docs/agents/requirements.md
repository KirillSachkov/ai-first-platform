# Requirements and change specifications

Every implementation needs a GitHub issue before repository changes begin. A small issue states the problem, desired and preserved behavior, scope, acceptance criteria, and verification. Read its comments and linked decisions before treating it as ready. Missing expected behavior returns to the owner; a label alone is insufficient.

## Choose the artifact

- Use a short issue for a clear bug, bounded documentation/configuration change, or refactoring with known invariants.
- Use a full change spec for behavior with unresolved choices, several scenarios or contributors, contract changes, or costly failure. After discussing the decisions, propose `to-spec` for the owner to select.
- When independent, verifiable slices or multiple sessions need explicit dependencies, propose `to-tickets` for the owner to select. Tickets refer to the parent requirements instead of copying them.
- Keep a large idea or release in scope documents until concrete behavior is ready to specify. A full application spec is not a prerequisite for every task.

## Current behavior and history

`customer-requirements.md` holds the brief; `docs/first-version.md` holds delivery scope. A proposed domain model in `docs/domain-model.md` does not prove implemented behavior.

A change spec lives in its GitHub issue. It records what was requested and why at that time. After merge, preserve it unchanged as history; never edit it to describe later behavior.

Each question about current behavior has one owner:

- Behavior: tests at the seams in [testing.md](testing.md), named as [testing.md](testing.md#placement-and-naming) requires.
- Terms and the rules inside their definitions: `DOMAIN.md`.
- Decisions that meet the ADR criteria in `domain-modeling`, including deliberate non-goals: ADRs.

Keep current behavior in these sources only, without a separate prose document. A lasting requirement that a test cannot check goes into the `DOMAIN.md` definition it constrains or into a qualifying ADR; otherwise its issue remains its record. To learn the current behavior of a capability, read its tests, `DOMAIN.md`, the related ADRs, and the issues linked from them.

## Content and human decisions

Describe actors and permissions where relevant; success, failure, and boundary scenarios; preserved invariants; observable acceptance criteria; scope and dependencies. Separate required behavior from technical decisions. Reference the existing testing guide for seams, substitutes, commands, and prior art.

For human acceptance, follow [human-review.md](human-review.md). Full specs and small issues need the same clear desired result, at different levels of detail. Apply the language rule in root `AGENTS.md`, including translated template headings.

## When requirements change

Before changing agreed behavior, show the semantic difference and obtain the owner's decision. Record that decision in the issue. Update affected criteria, tickets, dependencies, tests, and implementation. Pause dependent work while the decision is missing; independent authorized work may continue.

After merge, a new desired behavior gets a new change issue. The new issue links the earlier issue and names each criterion it replaces. A violation of tested behavior or of an accepted criterion gets a bug issue. Change tests before code as [testing.md](testing.md#when-a-test-is-required) requires.

When code, tests, and issues disagree, identify the accepted decision: the latest owner-approved criterion. Code shows actual behavior; it does not establish desired behavior. A passing test does not justify rewriting the requirement to match it. Conflicting accepted decisions return to the owner.
