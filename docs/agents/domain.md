# Domain Documentation

## Read before working

- Read [DOMAIN.md](../../DOMAIN.md) for canonical vocabulary.
- Read [docs/domain-model.md](../domain-model.md) for relationships, invariants, lifecycle rules, approximate module responsibilities, and interactions. Distinguish confirmed decisions from proposals and explicitly open questions.
- Read the ADRs in `docs/adr/` that concern the area being designed, implemented, or reviewed. For access ownership, read [ADR-0001](../adr/0001-platform-access-ownership.md).

Use [docs/first-version.md](../first-version.md) to determine delivery scope. A domain concept or future integration described in the model does not by itself place a capability in the main delivery.

## Use and maintain

- Use the glossary's canonical terms in discussions, code, issues, and reviews. Surface conflicting meanings when they arise.
- During domain interviews, capture newly confirmed vocabulary in `DOMAIN.md` immediately. Keep it a glossary; record relationships, lifecycle rules, module responsibilities, and unresolved questions in `docs/domain-model.md`.
- For a consequential architectural trade-off, use the `domain-modeling` skill to decide whether an ADR is warranted and record the rationale in `docs/adr/`.
- If a proposal conflicts with an accepted ADR, identify the conflict and discuss revising the decision before treating the proposal as accepted.
