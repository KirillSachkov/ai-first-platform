# Project skills

The 27 installed skill directories come from [mattpocock/skills](https://github.com/mattpocock/skills),
with approved shared adaptations from [workspace/pipeline](https://github.com/KirillSachkov/workspace/tree/490520af93abc3c73ae1a035566a106082dbff3e/pipeline).
The upstream MIT license remains in `LICENSE.mattpocock`.

## Source identity

- Workspace: `490520af93abc3c73ae1a035566a106082dbff3e` (immutable source, 2026-10-29).
- Upstream full sync: `a496f5513d4a4cf889bc48e189e579f4b0bdf6aa`; no selective pins.
- Previous installation: release `v1.3.1`, commit `24fe0ef7737efae15c87225755e9f6f5965e4888`.
- Pre-adoption project HEAD: `b6e0dd4eee1bde622eb9e2e50ab9458bb24224a3`.
- Project policy/integration base: `ecd1c4a4b8c82bf57482e3280b88f7543baec107`.
- Wizard correction adoption base: `2ff8644b3c1d9d9dd8b95211752084f4b710b756`; prior workspace `5cdf9b286b6b3244fd498e6f12ed58f0684a4ee8`.
- Assignment: [workspace #26](https://github.com/KirillSachkov/workspace/issues/26).

This existing README is the installation provenance record; there is no separate `PIPELINE.md`.
The selected set remains unchanged. No project-owned skills were replaced or added.
The workspace-only `classify-change` and upstream excluded groups remain uninstalled.
The shared fixes use `glab mr list -F json` (issues use `-O json`) and wizard `${e}` Readline markers.
The corrected wizard saves single-line dotenv data (never source/eval), preserves apostrophes
and defaults, rejects unsupported values before mutation, atomically replaces the resolved
symlink target while preserving modes, and ignores exported `CDPATH` during path resolution.
Only `wizard/template.sh` changed between the two workspace revisions.

## Runtime and project contracts

Codex and OpenCode discover project skills in `.agents/skills`. `.claude/skills` points here for
Claude Code. Root `AGENTS.md` remains canonical. This update verifies the discovery layout;
it does not claim a live invocation in each runtime.

Root `AGENTS.md`, `README.md`, and `docs/agents/` retain project authority, branch/PR delivery,
tracker and domain rules. There is no root `WORKFLOW.md` or configured classification policy.
This installation does not configure classification, add skills, or migrate conversational workflow routing.
Canonical `implement` and `implement-spec` retain their approved model-invocable metadata;
manual skills retain explicit-only Codex policy. Their references to classification apply only
when a project enables it. `ask-matt` or setup may recommend absent stages; that does not install
or invoke them. Setup remains an explicit separate task.

## Local adaptations

Compared with the recorded release, the previous bodies differed only by replacing `GLOSSARY.md`
with `DOMAIN.md` in the ten files below; native Codex metadata was also present. Retain that
project glossary adaptation on the new canonical files. All other skill files, including Codex
adapters and setup templates, are byte-for-byte copies of the pinned workspace source.
The active project configuration remains in `docs/agents/`; setup templates are shared defaults.

- `ask-matt/SKILL.md`
- `codebase-design/DESIGN-IT-TWICE.md`
- `diagnosing-bugs/SKILL.md`
- `domain-modeling/GLOSSARY-FORMAT.md`
- `domain-modeling/SKILL.md`
- `improve-codebase-architecture/SKILL.md`
- `pr/SKILL.md`
- `tdd/SKILL.md`
- `triage/SKILL.md`
- `wait-what/SKILL.md`

`pr/SKILL.md` also carries a project report-style adaptation (owner request, 2026-10-30): the
Language section, self-explanatory diagram rules, and the check and deviation tables. Retain it
when syncing from upstream or workspace.

## Installed content identity

SHA-256 per directory: sorted relative file paths, each encoded as UTF-8 followed by NUL,
then file bytes followed by NUL; concatenate and hash. Includes native metadata and all references.
This table is the complete selected set and excludes this README and the unchanged upstream license.

| Skill | SHA-256 |
| --- | --- |
| `ask-matt` | `7c05ab8b625f6ad01673d06f8d24d7628265765cadb83f64c7a2e39729d2d8bb` |
| `code-review` | `ffc4ef24b1f073de432f54b0d90a9f46535b5a747cdd767a2353c275055e90fc` |
| `codebase-design` | `5e680d83ed795dfdce570831c31c7e95927c3a3403a2f71006c8684f35472b84` |
| `diagnosing-bugs` | `39535fceeaa6d911d6bac8a60dca3b1c1a392895e12e0bf1c3ae83cfbb9b2704` |
| `domain-modeling` | `f60496eae0534ad8602a8e2ff7ac4681445c37e44281811369ad2dfda08a82fe` |
| `grill-me` | `14c292fe16c0aed833cbbabb0983515c8d665fb6061d9755b13dba870363323b` |
| `grill-with-docs` | `2dff19547f0f72000f8b88868e21b7d76c27cf5c7ececc6edf4042bbe06157ac` |
| `grilling` | `27f71f106a7062691b2982d4f847304a62930ebed8b50734f4d4fd498d60afa8` |
| `handoff` | `77c2607c751b7c522e0208ab113ba4949f8267610d6061323c7ccd3ace21d7da` |
| `implement` | `506278c0e0668f34163bd96558b46b91b7f1b3ff026fb2b34e34f56f17f958b7` |
| `implement-spec` | `cefadffcdf910bfcea11c64e59f8a48b16b8fe9a3b2043629c4ed9eb2cbe84c5` |
| `improve-codebase-architecture` | `d02da163afa2ba2422433ba35ecae21659bef7d8bba5d2341ca1fa55573f7b3f` |
| `pr` | `801da86316dc48fedbf7e04217b5f6c56ec8aee855c642e29a924b5e5b8b5b82` |
| `prototype` | `c4efd5e0f1c302b6225be83e8e42abdb05e13fde900484e4e2240e90b4e83eb6` |
| `research` | `f2d6425b15cf3100d5c3eb4305a8e817174b8e5fa1fde6e06ad4b61321c32a60` |
| `retro` | `fdd75be29ab7d6a9062092ccbac214cb57fa047c27b72b9f8b9ec258bbb83c1f` |
| `setup-matt-pocock-skills` | `51289e24c59afb54169c88ec5cd28ea9bcb3ae73115d0731c8d26a714bacdc7e` |
| `tdd` | `044fb58978176f642ba6e7138e1a7ac45b5a6f4e01684bfbd2fff4379eaba1d2` |
| `teach` | `9aaf696786348313963552e446415c67fdd8129276b61f02be6dcedb208cd381` |
| `to-questionnaire` | `560491db9f48174ca9f7b5dd1444bc9c3cb7ac2d9e3e673e48289ef3221f164e` |
| `to-spec` | `f525dab8b9bd3961aa4813d8568ef6184f6e24aad5a020e129165ca6c220f836` |
| `to-tickets` | `6eccfac132d92b949821d154679adc7f597bfc3e8c929f3c03786b92f91b961f` |
| `triage` | `40d36a83b7d09c053a12cc647fba2b1dd2af09f5f71551525eed907d90027147` |
| `wait-what` | `d89d9b5abee5ecf9179e331b329382314312c4cbc7f0ab17571d7e69377e0146` |
| `wayfinder` | `62a0ab7262d40119da048328a71aeadaeaa21a4049ee9268d14500921bb6e257` |
| `wizard` | `11cfb2012e7edb66e47e738257db0f06c6db7b76b17e41eee22854b1324459cc` |
| `writing-for-agents` | `dc53f07d1f662137317789b9b5d74cfcc26dbcfc15038a7faf676c844d8638e8` |
