# Human participation

The owner chooses desired behavior, scope, acceptance criteria, and implementation entrypoint. Routine implementation, commits, push, PR creation/update, and fixes to confirmed review/CI findings proceed within that assignment. Requirements changes follow [requirements.md](requirements.md#when-requirements-change). [delivery.md](delivery.md) owns merge authority; a green check or agent review does not grant it.

## Plan additional acceptance

When preparing an issue or spec, agree any additional human checks. For each, name the person or role, the behavior or decision to inspect, the evidence to provide, the point at which it is needed, and the condition for continuing. A small issue may explicitly need no checks beyond the normal final PR acceptance. Tickets inherit relevant parent checks and identify any additional ones.

Examples include interface judgment, a scenario needing human-only access, and a decision about permissions. Automated tests and independent review still run where applicable; a manual step does not silently replace them.

Every final PR goes to the owner for acceptance. Present the changed behavior, factual checks and their limits, review findings and dispositions, risks, and any manual steps. The owner need not read every line to start acceptance, but evidence gaps and consequential code may need a closer review. An agent cannot waive an agreed human checkpoint.

## Ask the owner

Ask when expected behavior is missing or contradictory, requirements must change, a finding requires a disputed decision, authority is insufficient, or an agreed human check is due. State one concrete question, recommend an answer with its consequences, and link the current issue/PR and relevant evidence. Explain which work is waiting and how it can resume.

Record the question and next step in the existing issue or PR, and notify the owner in the current conversation. Pause the affected work; continue independent authorized work. Do not invent an answer from silence or keep retrying without progress.

## Keep results inspectable

Readiness, human acceptance, and merge are separate states. A review applies to named commits and requirement inputs. New material changes need applicable checks and review again; obtain a new owner decision when they change the accepted result. Keep the issue open until its delivery criteria are met, normally by its linked PR merging.

Auto-merge exceptions, automatic risk classifiers, and compulsory extra reviewers are future policy work. They are not enabled by this document.
