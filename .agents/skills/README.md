# Project skills

The 27 installed skill directories are copies of [mattpocock/skills](https://github.com/mattpocock/skills)
at commit `a496f5513d4a4cf889bc48e189e579f4b0bdf6aa` (upstream `main` on 2026-10-31), taken directly
from upstream. The upstream MIT license is in `LICENSE.mattpocock`.

This replaces the earlier installation from `KirillSachkov/workspace` pipeline (workspace
`490520af93abc3c73ae1a035566a106082dbff3e`), whose shared process adaptations no longer apply here:
the owner decided that each project owns its harness (2026-10-31).

## Runtime

Codex and OpenCode discover project skills in `.agents/skills`. `.claude/skills` points here for
Claude Code. Root `AGENTS.md`, `README.md` and `docs/agents/` own project authority, delivery and
tracker rules; skills do not override them.

## Project adaptations

Every file is a byte-for-byte upstream copy except these. Retain both adaptations when syncing.

- **Glossary file name.** The project glossary is `DOMAIN.md`, so `GLOSSARY.md` reads `DOMAIN.md` in:
  `ask-matt/SKILL.md`, `codebase-design/DESIGN-IT-TWICE.md`, `diagnosing-bugs/SKILL.md`,
  `domain-modeling/GLOSSARY-FORMAT.md`, `domain-modeling/SKILL.md`,
  `improve-codebase-architecture/SKILL.md`, `pr/SKILL.md`, `tdd/SKILL.md`, `triage/SKILL.md`,
  `wait-what/SKILL.md`.
- **Report style in `pr/SKILL.md`** (owner request, 2026-10-30): the Language section,
  self-explanatory diagram rules, and the check and deviation tables.

## Installed content identity

SHA-256 per directory: sorted relative file paths, each encoded as UTF-8 followed by NUL,
then file bytes followed by NUL; concatenate and hash. Includes native metadata and all references.

| Skill | SHA-256 |
| --- | --- |
| `ask-matt` | `7c05ab8b625f6ad01673d06f8d24d7628265765cadb83f64c7a2e39729d2d8bb` |
| `code-review` | `cd5bdf2afe1680d10150ae58abacbc32e7a11d034be76c7ef6fad58546ce85e3` |
| `codebase-design` | `5e680d83ed795dfdce570831c31c7e95927c3a3403a2f71006c8684f35472b84` |
| `diagnosing-bugs` | `39535fceeaa6d911d6bac8a60dca3b1c1a392895e12e0bf1c3ae83cfbb9b2704` |
| `domain-modeling` | `f60496eae0534ad8602a8e2ff7ac4681445c37e44281811369ad2dfda08a82fe` |
| `grill-me` | `14c292fe16c0aed833cbbabb0983515c8d665fb6061d9755b13dba870363323b` |
| `grill-with-docs` | `2dff19547f0f72000f8b88868e21b7d76c27cf5c7ececc6edf4042bbe06157ac` |
| `grilling` | `27f71f106a7062691b2982d4f847304a62930ebed8b50734f4d4fd498d60afa8` |
| `handoff` | `77c2607c751b7c522e0208ab113ba4949f8267610d6061323c7ccd3ace21d7da` |
| `implement` | `72f446ef5b35d3df73c21b574ba2ae50ab3d02fc5d4da44b80f27ce13e7dc18d` |
| `implement-spec` | `c50119e1da19b7e62161d96e00bc1e39e661ac48e522ce4904c362bccc90e72e` |
| `improve-codebase-architecture` | `d02da163afa2ba2422433ba35ecae21659bef7d8bba5d2341ca1fa55573f7b3f` |
| `pr` | `801da86316dc48fedbf7e04217b5f6c56ec8aee855c642e29a924b5e5b8b5b82` |
| `prototype` | `c4efd5e0f1c302b6225be83e8e42abdb05e13fde900484e4e2240e90b4e83eb6` |
| `research` | `f2d6425b15cf3100d5c3eb4305a8e817174b8e5fa1fde6e06ad4b61321c32a60` |
| `retro` | `09c4f9fe72fc5bc8e486a2bbb32dd785ca6264c56a53dd1bf9a334af72586efd` |
| `setup-matt-pocock-skills` | `d1d1b40f71fcb294d27a1b00297d1d25bcff3bc1e8759794a4af906b243d8e31` |
| `tdd` | `e262a6d42d7588c95df99c989c18151c0cab96a8d11a8a7cebf93bf43b2c280b` |
| `teach` | `9aaf696786348313963552e446415c67fdd8129276b61f02be6dcedb208cd381` |
| `to-questionnaire` | `560491db9f48174ca9f7b5dd1444bc9c3cb7ac2d9e3e673e48289ef3221f164e` |
| `to-spec` | `f525dab8b9bd3961aa4813d8568ef6184f6e24aad5a020e129165ca6c220f836` |
| `to-tickets` | `6eccfac132d92b949821d154679adc7f597bfc3e8c929f3c03786b92f91b961f` |
| `triage` | `40d36a83b7d09c053a12cc647fba2b1dd2af09f5f71551525eed907d90027147` |
| `wait-what` | `d89d9b5abee5ecf9179e331b329382314312c4cbc7f0ab17571d7e69377e0146` |
| `wayfinder` | `62a0ab7262d40119da048328a71aeadaeaa21a4049ee9268d14500921bb6e257` |
| `wizard` | `8fd93e38124bf81ad439231ba8af833b462ca9719c62373c87f25b06f6be776e` |
| `writing-for-agents` | `dc53f07d1f662137317789b9b5d74cfcc26dbcfc15038a7faf676c844d8638e8` |
