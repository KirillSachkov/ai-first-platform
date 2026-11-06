# Coding standards

This document guides the Standards reviewer. Apply contextual rules here and the relevant sources below.

## Review sources

- For domain ownership and terminology, read `docs/agents/domain.md` and the relevant ADRs.
- For backend changes, read `apps/api/AGENTS.md`. For frontend changes, read `apps/web/AGENTS.md`.
- For test judgement, read `docs/agents/testing.md`. Keep its rules there rather than copying them here.
- For instructions, skills, and context pointers, read `.agents/skills/writing-for-agents/SKILL.md` and its skill-mechanics reference when applicable.
- `pnpm check` already enforces formatting, compiler diagnostics, lint rules, module and layer boundaries, and generated API drift.

## Contextual checks

For a changed cross-module collaboration, apply the ownership and state-transition decisions in ADR-0003. An allowed import does not establish that a module owns the business decision or that an interaction is a read. Cite the authoritative decision and the actual behavior when reporting a violation.

For backend changes, apply the command/query distinction from `apps/api/AGENTS.md`. Judge whether domain invariants are preserved rather than inferring correctness from class names.

## Findings

Report the source rule, the changed location, the triggering condition, and the consequence. Separate violations of accepted project decisions from optional design suggestions. Shared generic code smells remain in `code-review`; this document does not copy that baseline.

## Maintenance

Use concrete missed defects or recurring review friction to propose additions, clarification, or removal. State the observed case and why existing rules/checks missed it. For a new contextual rule, give its trigger, what to inspect, the consequence, and the source. Confirm new policy with the owner before treating it as a requirement.

If a rule can be checked mechanically, propose an applicable lint, architecture, or CI check instead. Once tooling enforces it, remove duplicate reviewer work. Preserve one authoritative source for each rule.
