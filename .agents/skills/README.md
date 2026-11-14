# Project skills

## Managed procedures

All 28 existing engineering procedures are now pinned Agent Kit copies. [AGENT-KIT.md](AGENT-KIT.md) records the source, selection, reconciliation and update path. The manifest owns the selected whole folders; edit project policy in root `AGENTS.md` and `docs/agents/`, then update procedures through the installer rather than patching locked files.

## Runtime

Codex and OpenCode discover `.agents/skills`; `.claude/skills` is the relative alias `../.agents/skills` for Claude Code. `ask` replaces `ask-matt`; use `/ask`. No live references to the old folder remain. Native metadata is shipped unchanged; automatic discovery is distinct from reading a file. Implementation still requires the owner's explicit selection of `implement` or `implement-spec`, regardless of implicit discovery metadata.

## Provenance

The predecessor was 27 adaptations of mattpocock/skills at `a496f5513d4a4cf889bc48e189e579f4b0bdf6aa` plus project-authored `ship`. Twelve folders were previously adopted via Agent Harness `5e051a49287724bff80a2568d73512d9b334d692` and pinned to Agent Kit `b0570c6006289437cd587a362d26b4594c987e26`. The remaining 16 variants were semantically reconciled, verified against exact tracked whole-folder bytes and modes at the starting commit, explicitly adopted with a private temporary catalog, then updated normally. That private catalog is not a consumer dependency.

The original root `LICENSE.mattpocock` remains. Each selected folder includes complete provider notices, attribution, native metadata and supporting files; optional legal and design references are preserved with their folder.
