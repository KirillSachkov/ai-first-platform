# Human participation

The owner chooses desired behavior, scope, acceptance criteria, and implementation entrypoint. Routine implementation, commits, push, PR creation/update, and fixes to confirmed review/CI findings proceed within that assignment. Requirements changes follow [requirements.md](requirements.md#when-requirements-change). [delivery.md](delivery.md) owns merge authority; a green check or agent review does not grant it.

## Plan additional acceptance

When preparing an issue or spec, agree any additional human checks. For each, name the person or role, the behavior or decision to inspect, the evidence to provide, the point at which it is needed, and the condition for continuing. A small issue may explicitly need no checks beyond the normal final PR acceptance. Tickets inherit relevant parent checks and identify any additional ones.

## Choose additional human checks

Use the change's consequences, not its size or file extension. Require a focused human decision or inspection for:

- Changed permissions, identity, data visibility, or access revocation.
- Destructive data changes, irreversible actions, or consequential external effects.
- Changed business rules, shared contracts, or architecture that establishes a new pattern.
- Material changes to a user journey, interaction, or message whose meaning needs human judgment.
- Changes to CI, release controls, or agent authority, including instructions that change these controls.
- Missing or conflicting expectations, insufficient evidence, or a scenario requiring human-only access.

Name the affected behavior, a plausible failure and its consequence, and the remaining human question. The owner or designated specialist inspects that question; this need not mean reading the entire diff or repeating passing automated tests. Link existing evidence where it answers the question. A sensitive path is a search aid; changes elsewhere can trigger the same rule.

Agree known checks during issue/spec preparation. Surface newly discovered checks when their decision is needed. Before handoff, the independent Spec reviewer compares requirements, agreed checkpoints, the complete delivered diff, and current evidence. Report omitted triggers, stale evidence, and unsupported claims. Keep agreed checks until the owner resolves them; an agent cannot waive them.

If no additional check is needed, give a short reason in the PR. Every final PR still goes to the owner for acceptance. Automated checks and independent review remain applicable. Automatic risk classifiers and exceptions to owner acceptance are future policy work.

## Present the result

Lead with changed behavior and the owner's next action. For each additional check, state who acts, what to inspect or decide, why it matters, the expected result, and evidence with its limits. Say when the check is due and what must happen to continue. For an unresolved expectation, ask for the decision rather than inventing an expected result.

Keep required human actions, unresolved questions, and material limitations visible. Put detailed commands, logs, and revision records behind a disclosure. Use `pr` for presentation. A screenshot demonstrates visible state; permissions and side effects need evidence at the relevant boundary. Mark planned or unavailable checks as such.

## Ask the owner

Ask when expected behavior is missing or contradictory, requirements must change, a finding requires a disputed decision, authority is insufficient, or an agreed human check is due. State one concrete question, recommend an answer with its consequences, and link the current issue/PR and relevant evidence. Explain which work is waiting and how it can resume.

Record the question and next step in the existing issue or PR, and notify the owner in the current conversation. Pause the affected work; continue independent authorized work. Do not invent an answer from silence or keep retrying without progress.

## Keep results inspectable

Record agent verification and progress in comments or the PR. Preserve the issue's agreed criteria and their acceptance checkboxes; the owner controls acceptance marks. Earlier agent marks are not evidence of owner acceptance. Keep the issue open until its delivery criteria are met, normally by its linked PR merging.

Readiness, human acceptance, and merge are separate states. Reviews name commits and requirement inputs; [delivery.md](delivery.md#verification-evidence) owns revision changes and renewed merge approval.
