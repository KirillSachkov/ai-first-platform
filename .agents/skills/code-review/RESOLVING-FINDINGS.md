# Resolve review findings

Apply this procedure to agent or human review findings within the active assignment. The implementation author owns corrections; the independent reviewer remains read-only. Record checked base/head and requirement sources with each review. Keep the initial full-diff review when later passes cover only changes.

Validate each finding against code and accepted requirements. Fix confirmed defects within scope. Give rejected findings a reason. Separate optional suggestions from blocking defects; an optional redesign is not an instruction to expand the task.

After corrections, rerun affected checks, commit, and call `code-review` for the changed parts and closure of earlier findings. Supply the earlier report and immutable endpoints. When requirements or wider interactions change, broaden the review. For target-branch updates, use the project's [base renewal rule](../../../docs/agents/delivery.md#verification-evidence). Final coverage must account for all delivered changes, not just the last patch.

Save findings, dispositions, and checked revisions in the issue or PR. Do not claim independent review from self-review or an unavailable reviewer. If decisions are disputed, scope must change, or repeated rounds make no progress, follow [Ask the owner](../../../docs/agents/human-review.md#ask-the-owner). Pause affected work and retain the useful result rather than retrying indefinitely.

Proceed to delivery only when no blocking findings remain unresolved and the required checks cover the result. CI fixes that change code use this same procedure before the result is called ready again.
