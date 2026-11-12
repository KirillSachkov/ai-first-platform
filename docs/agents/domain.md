# Domain Documentation

## Read before working

- Read [GLOSSARY.md](../../GLOSSARY.md) for canonical vocabulary.
- Read [docs/domain-model.md](../domain-model.md) for relationships, invariants, lifecycle rules, approximate module responsibilities, and interactions. Distinguish confirmed decisions from proposals and explicitly open questions.
- Read the ADRs in `docs/adr/` that concern the area being designed, implemented, or reviewed. For access ownership, read [ADR-0001](../adr/0001-platform-access-ownership.md).

A domain concept or future integration described in the model does not by itself place a capability in the delivery scope of [docs/first-version.md](../first-version.md).

Design boards on `design/*` branches and their gallery are working material for people, never a source of requirements or current behavior: take requirements from the spec and the outcomes linked to it, and current behavior from tests, `GLOSSARY.md`, and ADRs, as [requirements.md](requirements.md#current-behavior-and-history) assigns.

Use the glossary's canonical terms in discussions, code, issues, and reviews. For glossary and ADR work, use `domain-modeling`.

Record relationships, lifecycle rules, module responsibilities, and unresolved questions in `docs/domain-model.md`.

Before accepting a proposal that conflicts with an ADR, resolve the decision with the owner.
