# AI-first Platform

Read [the product brief](BRIEF.md) before discussing the project. Start discovery from the brief and the owner's current input. The previous implementation, closed issues and historical decisions are archival. Consult them only if the owner asks for history.

## Project decisions

- Write replies, issues, specs and PRs in Russian. Write instructions for agents in English.
- Use GitHub Issues for new agreed work. See [tracker conventions](docs/agents/issue-tracker.md) and [triage labels](docs/agents/triage-labels.md).
- Start implementation only when the owner selects `implement` or `implement-spec`. Discussion and diagnosis stay within their assigned scope. Ask the owner before changing requirements.
- Use a separate branch and worktree per implementation. Check for existing work, record the task and exact base, and preserve other writers' changes.
- During discovery, use the installed [skills](.agents/skills/README.md). Record agreed vocabulary in GLOSSARY.md and architectural decisions under docs/adr/ when the first terms or decisions are settled.
- Before a PR, check the pinned skills as described in the skill index and run checks for the changed behavior. Record commands, outcomes and evidence on the PR. Required CI is `ci-ok` on the current head. Add product-specific checks alongside the first implementation.
- Owner-attention classification is disabled. The owner accepts each PR. Report the full head SHA; merge only after explicit owner approval of the handed-off head. Record the approval source and SHA on the PR, then use squash merge with `--match-head-commit`. A changed head needs fresh approval. Deployment requires a separate assignment.

## Task workflow

1. Agree on the outcome, scope, scenarios and decisions reserved for the owner. Link the task or record the assignment on the PR.
2. Implement, run the affected checks and commit. Use independent Standards and Spec reviewers in parallel on the immutable diff. Record findings, make one correction pass and rerun affected checks.
3. When an observed scenario is required, have a fresh verifier exercise it on the corrected revision. Record actor, action, expected and observed results and revision on the PR. For evidence files use the [manifest template](templates/evidence-manifest.json) with synthetic data.
4. Deliver through a PR to main after verification. Keep the worktree for owner acceptance. Before authorized cleanup, verify integration or explicit disposition, preserve evidence and check for active writers or unpublished changes.
