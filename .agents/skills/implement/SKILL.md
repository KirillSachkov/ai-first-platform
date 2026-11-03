---
name: implement
description: "Implement an agreed issue and deliver a verified PR."
disable-model-invocation: true
---

Implement the work explicitly assigned by the owner. Read root `AGENTS.md` and its implementation pointers first.

Fetch the issue and comments, state its title, and check its agreed scope, criteria, blockers, and human checkpoints. A missing or ambiguous issue needs preparation before implementation.

Use the assigned dedicated worktree. Record starting HEAD and an immutable review base covering the entire issue branch against its intended PR base, including earlier commits when resuming. Preserve foreign work.

Call the client's skill mechanism with `tdd` where the project's testing rules require it, at pre-agreed seams. Run targeted checks during the loop and the project's pre-PR verification level at the end.

Commit assigned changes before calling `code-review` with the recorded base, reviewed head, and issue. Follow [finding resolution](../code-review/RESOLVING-FINDINGS.md) for corrections and independent re-review.

Then call `ship` to deliver the reviewed branch.
