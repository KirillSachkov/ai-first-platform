# Domain Documentation

Each piece of domain knowledge has one home. The repository has no separate domain model document (owner decision in #58).

| Knowledge | Home |
| --- | --- |
| Terms | [GLOSSARY.md](../../GLOSSARY.md) |
| Hard-to-reverse decisions, including module ownership | ADRs in `docs/adr/`. Module ownership: [ADR-0006](../adr/0006-first-version-modules.md); permissions: [ADR-0001](../adr/0001-platform-access-ownership.md) |
| Relationships, lifecycle rules, invariants, and open questions agreed before implementation | The issue: the spec, or the final comment of the decision task ([requirements.md](requirements.md#current-behavior-and-history)) |
| Current behavior after implementation | Tests, as [requirements.md](requirements.md#current-behavior-and-history) assigns |
| Domain board | A discussion surface only. Commit its scene and exported snapshot to a separate `design/<slug>` branch that stays unmerged; the spec or the decision task's final comment links them at the exact commit SHA. The rules themselves live in the homes above, so a snapshot stays as of its discussion |

## Read before working

- Read `GLOSSARY.md` for canonical vocabulary.
- Read the ADRs in `docs/adr/` that concern the area being designed, implemented, or reviewed.
- Read the issue and the spec or decision comments it links. Distinguish accepted decisions from proposals and open questions; the latest owner-approved criterion wins.

A glossary term, an ADR, or a future integration does not by itself place a capability in the delivery scope of [docs/first-version.md](../first-version.md).

## Record

Use the glossary's canonical terms in discussions, code, issues, and reviews. For glossary and ADR work, use `domain-modeling`.

Record each agreed piece of knowledge in its home from the table, once. Link to it from other places instead of restating it.

Before accepting a proposal that conflicts with an ADR, resolve the decision with the owner.
