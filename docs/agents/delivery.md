# Delivery facts and permissions

Use `ship` to deliver a reviewed branch as a verified PR. Use `pr` to write its body. The testing guide owns local checks and CI levels; the tracker guide owns GitHub operations. Package scripts, pinned Node/pnpm versions, Compose, and `.env.example` define the runnable environment.

## Branches and issues

The target branch for independent work is `main`; a spec uses an integration branch for its tickets. Follow [worktrees.md](worktrees.md) for bases and ownership. Each implementation issue links to a PR. A single integration PR may close the spec and several tickets. Discussion/research issues without repository changes may resolve with an answer rather than a PR.

For a small implementation, open the PR after local verification and committed independent review. A spec opens a draft after its first integrated result. `ship` reuses an existing PR instead of creating duplicates. PR creation starts PR CI; it does not establish readiness. Mark the result ready only after required checks and review cover the current change.

Keep issue delivery state explicit. Link the final PR with closing keywords and retain issues until delivery criteria are met, normally by merge. An integrated child commit may unblock dependent work inside the authorized spec run without pretending that its issue has shipped. Record integration progress in the parent issue or draft PR.

## Main and owner acceptance

Merge is allowed only to the owner or to an agent after the owner's explicit approval in that PR. Agent review, an earlier assignment to implement, and green CI do not replace this approval. Apply approval to the inspected result; changes to that result return to the owner as needed.

GitHub enforces PR-only squash merge, linear history, an up-to-date branch, and successful `ci-ok` from GitHub Actions, without bypass actors. Auto-merge is off. The current required human review count is zero: the owner approval rule is a process rule, not an enforced human-identity gate. This harness does not enable exceptions.

## Verification evidence

Run the pre-PR level from [testing.md](testing.md#commands-and-levels). Reuse evidence only while its checked tree and requirements remain applicable. Commit metadata alone need not invalidate a successful check on identical contents; record the resulting commit and what was checked. New code, conflict resolutions, or changed requirements need affected checks and review again.

Wait for successful `ci-ok` for the current PR result. Pending, missing, cancelled, or older successful checks do not count. Do not waive a failure or call a rerun proof of correctness. Fix within scope or report the blocker and next step. Red `main` follows the existing testing policy.

## Human handoff

Follow [human-review.md](human-review.md) for agreed manual checkpoints and questions. The PR states behavior changes, actual checks and their limits, reviewed base/head, finding dispositions, risks, and what the owner must do. Readiness, acceptance, and merge are separate states. Retain the PR worktree for acceptance.
