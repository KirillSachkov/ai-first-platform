# Selected Agent Kit skills

Shared source: [KirillSachkov/agent-kit](https://github.com/KirillSachkov/agent-kit/tree/b1608ac14d8f934a8686a0c583f1110466a18b18), commit `b1608ac14d8f934a8686a0c583f1110466a18b18`.
[Manifest](../skills-manifest.json) selects 28 existing procedures; [lock](../skills-lock.json) records whole-folder bytes and executable modes, including notices.

Selected skills: `ask`, `code-review`, `codebase-design`, `diagnosing-bugs`, `domain-modeling`, `grill-me`, `grill-with-docs`, `grilling`, `handoff`, `implement`, `implement-spec`, `improve-codebase-architecture`, `pr`, `prototype`, `research`, `retro`, `setup-matt-pocock-skills`, `ship`, `tdd`, `teach`, `to-questionnaire`, `to-spec`, `to-tickets`, `triage`, `wait-what`, `wayfinder`, `wizard`, `writing-for-agents`.

No communication, content-canon, provider or application skill was added. Every pre-existing skill folder was an engineering procedure and is selected; there are zero nonselected skill folders. The four communication skills in the source catalog remain uninstalled. Root license, product documents, GLOSSARY and ADRs retain their original identities.

## Reconciliation into the project harness

Starting base and complete review base: `1ca63b8dbd8be327a3fd645e727573d539fe3c61`. Issue: [#73](https://github.com/KirillSachkov/ai-first-platform/issues/73).

| Local requirement previously carried by a skill | Owning project policy after normalization |
| --- | --- |
| `implement` named start; commit before review; checks | Root `AGENTS.md` Start and authority; `docs/agents/delivery.md` Review and corrections; `docs/agents/testing.md` Commands and levels |
| `implement-spec` integration branch, fresh correction implementer, safe bases and cleanup | `docs/agents/delivery.md` Branches and issues / Review and corrections; `docs/agents/worktrees.md` |
| `code-review` immutable full endpoints, bounded issue, human checks, correction coverage | `docs/agents/delivery.md` Review and corrections; `docs/agents/human-review.md` Before handoff |
| `diagnosing-bugs` stops after Phase 4 without implementation | Root `AGENTS.md` assignment boundary; portable procedure explicitly retains the phase boundary; diagnosis worktree in `docs/agents/worktrees.md` |
| `to-spec` preserved behavior, owner confirmation and human checkpoints | `docs/agents/requirements.md` Content and human decisions |
| `tdd` accepted public seams; new seam needs agreement | `docs/agents/testing.md` Test kinds and seams; no separate repeat approval for an already accepted seam |
| Domain filenames and ownership | `docs/agents/domain.md`: `GLOSSARY.md`, `docs/adr/`; no migration to DOMAIN names |
| `pr` readable evidence and human action | `docs/agents/pr.md`, reached through `docs/agents/delivery.md` |
| `ship` draft/ready, current-head ci-ok, owner handoff, no deploy/automatic merge | `docs/agents/delivery.md`; the former body-only draft return and endpoint bounds now live there |
| Prototype primary source and Wayfinder research branch retention | `docs/agents/worktrees.md` Exploratory evidence; domain boards keep their own policy |
| `ask-matt` router | Canonical `ask`, with all references resolved; no duplicate old skill |

All other compared changes are portable procedure improvements: client fallback, target policy lookup, language, optional design/legal references and the accepted wizard dotenv repair. The normalized lower steps no longer instruct reset of foreign work, review before commit or an unconditional full test suite. Project authority remains explicit in its own harness.

## Update

From an explicitly selected clone of the public source, run `python3 tools/skills.py select --project /path/to/project --ref FULL_SHA --skill NAME --client both --apply` for the intended subset, then `preview`, `install`, `check` with the same `--project`. See [distribution instructions](https://github.com/KirillSachkov/agent-kit/blob/b1608ac14d8f934a8686a0c583f1110466a18b18/docs/distribution.md).

Local modifications stop installation. Exact adoption is separate from updating; use a source tied to the exact tracked immutable revision only after semantic reconciliation. Preserve raw backups. Installer backups and synchronization locks are local ignored artifacts; never commit temporary provider entries or private source paths. Installed copies and the relative Claude alias work without Home or sibling clones.

## Preservation evidence

Preflight inventory contains 28 engineering folders, all selected; the nonselected folder set is empty both before and after. No provider, canon or product skill folder exists in this project. The historical root notice is outside the selection and stays byte-identical. Git object identities at the starting base (checked again against the delivered diff):

| Preserved path | Starting object | Final comparison |
| --- | --- | --- |
| `GLOSSARY.md` | `cc79ce65b55dc78e43d8de13e91f6c4e3053560c` | unchanged |
| `docs/adr` | `84a4a6d6cbaf29fdf3f19779d02be05ff30bbb78` | unchanged |
| `customer-requirements.md` | `63a9107407c61d884452f0451a5e181fbfe3dc36` | unchanged |
| `apps` | `58608cc5eaf15d3333a3e8c09a72994db59c679d` | unchanged |
| `packages` | `13f09f2d53e4e151f35e44b1c9fca389ca25d5f7` | unchanged |
| `.agents/skills/LICENSE.mattpocock` | `f1dd2c09108dde1a5f56097cee8461b3ea834499` | unchanged |
