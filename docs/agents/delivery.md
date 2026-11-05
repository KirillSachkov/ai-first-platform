# Delivery facts and permissions

Use `ship` to deliver a reviewed branch as a verified PR. Use `pr` to write its body. The testing guide owns local checks and CI levels; the tracker guide owns GitHub operations. Package scripts, pinned Node/pnpm versions, Compose, and `.env.example` define the runnable environment.

## Branches and issues

The target branch for independent work is `main`; a spec uses an integration branch for its tickets. Follow [worktrees.md](worktrees.md) for bases and ownership. Each implementation issue links to a PR. A single integration PR may close the spec and several tickets. Discussion/research issues without repository changes may resolve with an answer rather than a PR.

For a small implementation, open a draft PR after local verification and committed independent review. A spec opens a draft after its first integrated result. `ship` reuses an existing PR instead of creating duplicates. Return a ready PR to draft when material revisions need verification. Mark it ready only after required checks and review cover the current change.

Keep issue delivery state explicit. Link the final PR with closing keywords and retain issues until delivery criteria are met, normally by merge. An integrated child commit may unblock dependent work inside the authorized spec run without pretending that its issue has shipped. Record integration progress in the parent issue or draft PR.

## Main and owner acceptance

Merge is allowed only to the owner or to an agent after the owner's explicit approval. The owner may approve in the PR or in a message to the agent; the owner need not name a SHA. The approved head is the head the agent handed to the owner. Before merge, confirm that the PR head still equals it. For an authorized agent merge, use `gh pr merge <number> --squash --match-head-commit <approved-sha>`. Any new head, including a clean update from main, needs renewed approval. Agent review, an implementation assignment, and green CI do not grant merge authority.

Start agent-authored issue/PR bodies and comments with `Агент (<client>):`. Never write the owner's approval on their behalf. Agents share the owner's GitHub account, so account authorship alone cannot prove human approval. Establish human provenance from the owner's communication; if uncertain, ask the owner before merge. Before merge, record in the PR, as the agent, the approval source (a permalink or the conversation and date) and the approved full SHA. The SHA guard detects a changed head; it does not authenticate a person.

GitHub enforces PR-only squash merge, linear history, an up-to-date branch, and successful `ci-ok` from GitHub Actions, without bypass actors. Auto-merge is off. The current required human review count is zero: the owner approval rule is a process rule, not an enforced human-identity gate. This harness does not enable exceptions.

## Verification evidence

Run the pre-PR level from [testing.md](testing.md#commands-and-levels). Reuse evidence only while its checked tree and requirements remain applicable. Commit metadata alone need not invalidate a successful check on identical contents; record the resulting commit and what was checked. New code, conflict resolutions, or changed requirements need affected checks and review again.

Delivery requires resolved blocking findings and independent review covering all delivered changes. Retain the initial full-diff report when later passes check only corrections. Record unresolved findings and reasons for leaving suggestions in the issue or PR. Optional redesign suggestions do not expand the assignment. For disputed findings, required scope changes, or correction rounds that stop making progress, follow [Ask the owner](human-review.md#ask-the-owner). Apply the same rules to agent and human findings within the active assignment.

After updating from the fetched intended PR target, record a new immutable merge-base with that target. Review the complete resulting PR diff against the new base, including effects of the update and conflict resolutions. Retain earlier reports and record old/new endpoints; do not treat incoming target commits as assigned work. Recheck affected behavior and human checkpoints. Renew merge approval for the new head.

Wait for successful `ci-ok` for the current PR result. Pending, missing, cancelled, or older successful checks do not count. Do not waive a failure or call a rerun proof of correctness. Fix within scope or report the blocker and next step. For red `main`, report its bug issue and propose `implement`; the priority rule does not authorize starting an unrelated fix. Pause dependent work and continue only independent authorized work.

## Human handoff

Follow [human-review.md](human-review.md) for selecting and presenting human checks. Use `pr` to show behavior, evidence, findings, risks, and the owner's next action. Retain the PR worktree for acceptance.
