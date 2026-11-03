# Project skills

The 27 upstream-derived skill directories are editable copies of [mattpocock/skills](https://github.com/mattpocock/skills)
at commit `a496f5513d4a4cf889bc48e189e579f4b0bdf6aa` (upstream `main` on 2026-10-31), taken directly
from upstream before the local adaptations below. `ship` is an additional project-authored skill. The upstream MIT license is in `LICENSE.mattpocock`.

This replaces the earlier installation from `KirillSachkov/workspace` pipeline (workspace
`490520af93abc3c73ae1a035566a106082dbff3e`), whose shared process adaptations no longer apply here:
the owner decided that each project owns its harness (2026-10-31).

## Runtime

Codex and OpenCode discover project skills in `.agents/skills`. `.claude/skills` points here for
Claude Code. Root `AGENTS.md` and `docs/agents/` own project authority, delivery and
tracker rules; skills do not override them. Use the client's native skill mechanism. If the owner explicitly names a user-only skill in ordinary language and the client cannot invoke it, read that SKILL.md and its references, then follow it as the explicit assignment. Use the same file-reading route when no Skill tool exists. This fallback does not authorize an agent to select user-only entrypoints itself. Reading files is not proof of automatic discovery.

## Project adaptations

Every upstream-derived file is unchanged except the adaptations below. Retain project adaptations when syncing.

- **Glossary file name.** The project glossary is `DOMAIN.md`, so `GLOSSARY.md` reads `DOMAIN.md` in:
  `ask-matt/SKILL.md`, `codebase-design/DESIGN-IT-TWICE.md`, `diagnosing-bugs/SKILL.md`,
  `domain-modeling/GLOSSARY-FORMAT.md`, `domain-modeling/SKILL.md`,
  `improve-codebase-architecture/SKILL.md`, `pr/SKILL.md`, `tdd/SKILL.md`, `triage/SKILL.md`,
  `wait-what/SKILL.md`.
- **Report style in `pr/SKILL.md`** (owner request, 2026-10-30): the Language section,
  self-explanatory diagram rules, and the check and deviation tables.

- **Minimal project harness (#33).** Small pointers/boundaries in `ask-matt`, `to-spec`, `to-tickets`, and `diagnosing-bugs`; audience language in `pr`; committed review and delivery transitions in `implement`/`implement-spec`; immutable endpoints, bounded-issue criteria, and finding evidence in `code-review`. `ship` and its native metadata are project-owned delivery, without deployment or automatic merge.
- **Acceptance and presentation follow-up (#33).** Spec review checks human-check coverage against the delivered diff and evidence. Runtime supports explicitly named user-only skills when native invocation is unavailable. `ship` creates drafts; `implement` metadata matches its assignment. Diagnosis-only exits preserve evidence and clean owned probes before handoff. `pr/PRESENTATION.md` holds the Markdown toolbox; the short PR body leads with behavior, evidence limits, and the owner's action. Existing credits and diagram guidance remain.
- **Writing-for-agents audit (#33).** Requirements propose user-only preparation skills for owner selection. Human-check fields have one definition. Presentation reads are conditional on needs beyond the basic PR template. Finding resolution links directly to owner escalation.
- **Portable implementation core (#33).** `implement` restores the upstream description and conditional ticket lookup. Preparation and delivery follow project pointers instead of requiring an issue or calling `ship` in the skill itself. `implement-spec` retains its graph and delegates delivery/retention to project rules. Committed review, coverage and safe ownership remain explicit.
- **Correction simplification (#33).** Correction steps stay in `implement` and `implement-spec`: the main agent owns small-task fixes, and one fresh implementer owns aggregate-spec fixes. Independent re-review checks corrections and affected interactions. Project delivery owns coverage, visible disputes and stopping conditions for agent or human findings. No separate author-approval stage is required for each finding.
- Project facts live in root `AGENTS.md`, `CODING_STANDARDS.md`, and thematic `docs/agents/`. The public README is not the agent's process authority. The upstream license and original references remain intact.

## Installed content identity

SHA-256 per directory: sorted relative file paths, each encoded as UTF-8 followed by NUL,
then file bytes followed by NUL; concatenate and hash. Includes native metadata and all references.

| Skill | SHA-256 |
| --- | --- |
| `ask-matt` | `7c59fa688e458cc161526ac70abfade102471a50424b8c04ae93a92570b91144` |
| `code-review` | `651145cbbce0a813dce3071e720b54009af4e54fdfe6ae06a79b48ac10281007` |
| `codebase-design` | `5e680d83ed795dfdce570831c31c7e95927c3a3403a2f71006c8684f35472b84` |
| `diagnosing-bugs` | `7f45fd315cf2ce923ff2208eb76d4ba3189f5e14b0b1ff33ff5256265ddd3bd9` |
| `domain-modeling` | `f60496eae0534ad8602a8e2ff7ac4681445c37e44281811369ad2dfda08a82fe` |
| `grill-me` | `14c292fe16c0aed833cbbabb0983515c8d665fb6061d9755b13dba870363323b` |
| `grill-with-docs` | `2dff19547f0f72000f8b88868e21b7d76c27cf5c7ececc6edf4042bbe06157ac` |
| `grilling` | `27f71f106a7062691b2982d4f847304a62930ebed8b50734f4d4fd498d60afa8` |
| `handoff` | `77c2607c751b7c522e0208ab113ba4949f8267610d6061323c7ccd3ace21d7da` |
| `implement` | `95af274086aef8db8a8c51b078d9d2f0d108a28796d1e84e373536f88f3664fe` |
| `implement-spec` | `8cfbe422e17966c2dd77c8dee31855c94068e785b791175680ac7dbff3630bab` |
| `improve-codebase-architecture` | `d02da163afa2ba2422433ba35ecae21659bef7d8bba5d2341ca1fa55573f7b3f` |
| `pr` | `d19b624a600e4700d6e6117247ebf348068e3e520b3ea8187b176a72025937d4` |
| `prototype` | `c4efd5e0f1c302b6225be83e8e42abdb05e13fde900484e4e2240e90b4e83eb6` |
| `research` | `f2d6425b15cf3100d5c3eb4305a8e817174b8e5fa1fde6e06ad4b61321c32a60` |
| `retro` | `09c4f9fe72fc5bc8e486a2bbb32dd785ca6264c56a53dd1bf9a334af72586efd` |
| `setup-matt-pocock-skills` | `d1d1b40f71fcb294d27a1b00297d1d25bcff3bc1e8759794a4af906b243d8e31` |
| `tdd` | `e262a6d42d7588c95df99c989c18151c0cab96a8d11a8a7cebf93bf43b2c280b` |
| `teach` | `9aaf696786348313963552e446415c67fdd8129276b61f02be6dcedb208cd381` |
| `to-questionnaire` | `560491db9f48174ca9f7b5dd1444bc9c3cb7ac2d9e3e673e48289ef3221f164e` |
| `to-spec` | `8064291406797497f30fc7e95bf08c60dda5754c680101fa6be0df34874ef9bd` |
| `to-tickets` | `40d2d1c178ebd6585bb40268f9ab3be7859643f53db869643a68e210397078f9` |
| `triage` | `40d36a83b7d09c053a12cc647fba2b1dd2af09f5f71551525eed907d90027147` |
| `wait-what` | `d89d9b5abee5ecf9179e331b329382314312c4cbc7f0ab17571d7e69377e0146` |
| `wayfinder` | `62a0ab7262d40119da048328a71aeadaeaa21a4049ee9268d14500921bb6e257` |
| `wizard` | `8fd93e38124bf81ad439231ba8af833b462ca9719c62373c87f25b06f6be776e` |
| `writing-for-agents` | `dc53f07d1f662137317789b9b5d74cfcc26dbcfc15038a7faf676c844d8638e8` |
| `ship` | `08e8761ba341013c6fd1c6ae87e9d9cd7f407fd40c64e3088fa62f3f2cef55da` |
