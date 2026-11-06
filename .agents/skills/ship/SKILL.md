---
name: ship
description: "Deliver reviewed work as a verified PR for owner acceptance. Use after implement or implement-spec, or when asked to deliver a reviewed branch."
---

Deliver the assigned, committed, independently reviewed branch under [delivery](../../../docs/agents/delivery.md). Complete missing evidence under its rules.

1. Push the owned branch. Call `pr` for the body. Create or update the PR through the [tracker](../../../docs/agents/issue-tracker.md), following draft timing and issue linkage. Return a ready PR to draft while material revisions need verification.
2. Wait for `ci-ok` on the current PR head. For in-scope failures, fix, commit, and repeat affected checks and independent review. Report blockers under [Ask the owner](../../../docs/agents/human-review.md#ask-the-owner).
3. Record checked revisions, finding dispositions, evidence and its limits, and agreed human checks in the PR. Resolve any human decision due before handoff.
4. When readiness criteria hold, mark the draft ready. Hand off under [Main and owner acceptance](../../../docs/agents/delivery.md#main-and-owner-acceptance): the PR, the handed-off head, and the owner's concrete next action. Retain or clean owned resources under [worktree rules](../../../docs/agents/worktrees.md#finish).

Delivery ends at owner handoff. Deployment and automatic merge are outside this procedure.
