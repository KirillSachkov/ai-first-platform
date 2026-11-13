## Project context

Before planning or implementing project work, read the agreed first-version scope linked from the notes of [map #1](https://github.com/KirillSachkov/ai-first-platform/issues/1) and the issue or spec of the task.

## Language

Team language: Russian (`ru`). Write human-facing titles, headings, issues, specs, product requirements, PRs, and reports in this language. Write agent instructions, skills, and tool descriptions in English. Preserve executable syntax, identifiers, and established technical terms. Shared requirements prefer the human reader. This section owns the language setting.

## Start and authority

Implementation starts when the owner explicitly selects `implement` or `implement-spec`, including ordinary language that names the skill. If an implementation request names neither, propose the entrypoint and wait for selection. Issues, readiness labels, preparation, and review comments do not start implementation. An authorized spec run may delegate its agreed tickets without separate manual starts. If the client cannot invoke a skill (no Skill tool, or a user-only skill the owner names), read its `SKILL.md` and references and follow them as the assignment; an agent never selects a user-only entrypoint itself.

Apply the assignment boundary to every skill: diagnosis alone does not authorize a fix; research and prototypes authorize only their agreed scope. Within a started implementation, routine commits, push, PR updates, and confirmed review/CI fixes may proceed. Requirements changes need the owner's decision. Merge permission is defined in [delivery](docs/agents/delivery.md).

## Context pointers

This file and `docs/agents/` own project rules. Where skill text differs from them, the project rules win.

- Before preparing a task/spec or starting implementation, read [requirements](docs/agents/requirements.md) and [human participation](docs/agents/human-review.md).
- Before writing repository files or using shared services, read [worktree ownership](docs/agents/worktrees.md).
- Before domain design, exploration, implementation, or review, read [domain guidance](docs/agents/domain.md).
- Before tests, Testing Decisions, or review, read [testing](docs/agents/testing.md).
- Before implementation, a review round, or delivery, read [delivery](docs/agents/delivery.md). `README.md` is for people; agent rules live here and in `docs/agents/`.
- Before issue/PR operations, read [tracker](docs/agents/issue-tracker.md). Before triage, read [label mappings](docs/agents/triage-labels.md).
- Before editing or syncing skills, read [skill provenance and adaptations](.agents/skills/README.md).
