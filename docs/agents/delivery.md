# Delivery facts and permissions

Use `ship` to deliver a reviewed branch as a verified PR. Use `pr` to write its body under [PR report rules](pr.md). [testing.md](testing.md) owns local checks and CI levels; [issue-tracker.md](issue-tracker.md) owns GitHub operations.

## Branches and issues

The target branch for independent work is `main`; a spec uses an integration branch for its tickets. Follow [worktrees.md](worktrees.md) for bases and ownership. Each implementation issue links to a PR. A single integration PR may close the spec and several tickets. Discussion/research issues without repository changes may resolve with an answer rather than a PR.

For a small implementation, the draft PR follows local verification and committed independent review. A spec's draft follows its first integrated result. A ready PR requires checks and review covering the current change.

Keep issue delivery state explicit. Link the final PR with closing keywords and retain issues until delivery criteria are met, normally by merge. An integrated child commit may unblock dependent work inside the authorized spec run without pretending that its issue has shipped. Record integration progress in the parent issue or draft PR.

## Review and corrections

These rules apply to `implement` and `implement-spec`. Where they differ from the skill steps, they win.

1. Before editing, record the starting HEAD and an immutable review base that covers the complete assigned change, including earlier commits when resuming. A spec run records its base against the intended target.
2. Before a spec run, confirm the approved spec, tickets, criteria, blockers, and human checkpoints. The owner's start authorizes the agreed child tasks, not new requirements. Each ticket worker confirms its ownership and actual integration base and reports a mismatch instead of resetting foreign work. Ticket workers use `tdd` and observe inherited human checkpoints; they do not start the user-only `implement`.
3. Commit the assigned changes before review. Call `code-review` with the base SHA, the reviewed head SHA, and the requirement source. A spec run reviews the complete integration diff after project checks pass.
4. Fix findings within the assignment. In `implement` the main agent fixes them; in `implement-spec` one fresh implementer subagent fixes the integration review findings. Rerun affected checks, commit the corrections, and call `code-review` with the earlier report.
5. Deliver the verified result with `ship`, reusing any draft PR.

Delivery requires resolved blocking findings and independent review covering all delivered changes. Retain the initial full-diff report when later passes check only corrections. Record unresolved findings and reasons for leaving suggestions in the issue or PR. Optional redesign suggestions do not expand the assignment. For disputed findings, required scope changes, or correction rounds that stop making progress, follow [Ask the owner](human-review.md#ask-the-owner). Apply the same rules to agent and human findings within the active assignment.

## Verification evidence

Run the pre-PR level from [testing.md](testing.md#commands-and-levels). Reuse evidence only while its checked tree and requirements remain applicable. Commit metadata alone need not invalidate a successful check on identical contents; record the resulting commit and what was checked. New code, conflict resolutions, or changed requirements need affected checks and review again.

After updating from the fetched intended PR target, record a new immutable merge-base with that target. Review the complete resulting PR diff against the new base, including effects of the update and conflict resolutions. Retain earlier reports and record old/new endpoints; do not treat incoming target commits as assigned work. Recheck affected behavior and human checkpoints. Renew merge approval for the new head.

Delivery requires successful `ci-ok` for the current PR head. Missing, pending, cancelled, or earlier green checks are not success. Failures remain blockers until resolved. Do not waive a failure or call a rerun proof of correctness.

A failed `main` run opens or comments on an issue labelled `bug`. Report that issue and propose `implement`; the priority does not authorize starting an unrelated fix. Pause dependent work and continue only independent authorized work.

## Main and owner acceptance

Merge is allowed only to the owner or to an agent after the owner's explicit approval. The owner may approve in the PR or in a message to the agent. The owner need not name a SHA. At handoff, the agent states the full SHA of the PR head: the **handed-off head**. Approval applies to the handed-off head. For an authorized agent merge, use `gh pr merge <number> --squash --match-head-commit <handed-off-head>`; the flag rejects a changed head. Any new head, including a clean update from main, needs renewed approval. Agent review, an implementation assignment, and green CI do not grant merge authority.

Start agent-authored issue/PR bodies and comments with `Агент (<client>):`. Never write the owner's approval on their behalf. Attribute a decision to the owner only with a quote of their message and where they wrote it; otherwise state that the agent decided and why. Merge approval is recorded by the PR comment rule below. Agents share the owner's GitHub account, so account authorship alone cannot prove human approval. Establish human provenance from the owner's communication; if uncertain, ask the owner before merge. Before merge, add an agent comment to the PR. Record the approval source there: a permalink, or the conversation and its date. Record the handed-off head there too. Approval relayed by another agent is valid only with the full chain recorded there: where and when the owner answered, who relayed it, and the handed-off head it covers. The SHA guard detects a changed head; it does not authenticate a person.

GitHub enforces PR-only squash merge, linear history, an up-to-date branch, and successful `ci-ok` from GitHub Actions, without bypass actors. Auto-merge is off. The current required human review count is zero: the owner approval rule is a process rule, not an enforced human-identity gate. This harness does not enable exceptions.

## Human handoff

Follow [human-review.md](human-review.md) for selecting and presenting human checks. Retain the PR worktree for acceptance.
