# Project skills

## Agent Kit selection

The current managed subset, immutable source and update procedure are in [AGENT-KIT.md](AGENT-KIT.md). The manifest owns only those selected folders. The predecessor receipts and local adaptation notes below remain provenance for the other folders; an older whole-set sync recipe does not apply to the managed subset.


The 27 upstream-derived skill directories are copies of [mattpocock/skills](https://github.com/mattpocock/skills)
at commit `a496f5513d4a4cf889bc48e189e579f4b0bdf6aa` (upstream `main` on 2026-10-31). `ship` is project-authored.
The upstream MIT license is in `LICENSE.mattpocock`. Each project owns its harness (owner decision, 2026-10-31).

## Runtime

Codex and OpenCode discover project skills in `.agents/skills`; `.claude/skills` points here for Claude Code.
Root `AGENTS.md` and `docs/agents/` own project rules; a skill reaches them through a pointer line. Reading a `SKILL.md` file is not proof of automatic discovery.

## Project adaptations

Every upstream-derived file matches upstream except the lines below. Project rules live in `docs/agents/`;
a skill adds at most a pointer line to them. Keep these lines when syncing.

| Skill | Adaptation |
| --- | --- |
| `implement` | One added line: project rules win; commit before review, testing levels, [review and delivery rules](../../docs/agents/delivery.md#review-and-corrections) |
| `implement-spec` | One added line: project rules win; no reset of foreign work, delivery through `ship`, safe cleanup |
| `pr` | One added line: project [PR report rules](../../docs/agents/pr.md) extend the template |
| `to-spec` | One added line: content and owner-confirmation rules before publishing |
| `diagnosing-bugs` | One added paragraph: diagnosis alone ends after Phase 4 |
| `code-review` | Immutable base and head SHAs, a bounded issue as a spec source, human checkpoints in the Spec prompt, and the finding format with re-review |

To check a sync, run `diff -r <upstream>/skills/<group>/<skill> .agents/skills/<skill>`: only the lines above may differ.
