# Testing

Run local checks from the project root. Set `AGENT_KIT` to the Agent Kit checkout at
the revision pinned in the [skill manifest](../../.agents/skills-manifest.json).

| Behavior | Check |
| --- | --- |
| Installed skills match their pinned contents, lock and client discovery paths | `python3 "$AGENT_KIT/tools/skills.py" check --project .` |
| The product brief exists and has content | `test -s BRIEF.md` |

The [CI workflow](../../.github/workflows/ci.yml) runs both checks in the harness job
and scans PR commits with Gitleaks. Required CI is `ci-ok` on the delivered head.

Add product-specific tests alongside the first implementation. For each new test
kind, record the behavior, an example test, its command and any required fixtures
or services. Record actual results on the PR. For required observed scenarios,
use synthetic data and the [evidence manifest](../../templates/evidence-manifest.json).
