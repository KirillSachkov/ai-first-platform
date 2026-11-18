# Project skills

[Agent Kit](https://github.com/KirillSachkov/agent-kit) supplies the procedures. The [manifest](../skills-manifest.json) pins their revisions and the [lock](../skills-lock.json) records installed content. Codex discovers this directory directly. Claude uses the relative alias at `.claude/skills`.

From the project root, with a checkout of Agent Kit at the selected revision, run:

```sh
python3 "$AGENT_KIT/tools/skills.py" check --project .
```

Set `AGENT_KIT` to that checkout. To update, follow the [distribution instructions](https://github.com/KirillSachkov/agent-kit/blob/0850d3732fd5181b0bbd7272228c2b92d3b8d0a4/docs/distribution.md): select the intended skills and full SHA, preview, install, and check. Update the provider checkout ref in CI together with the manifest. Keep project-specific policy in the root AGENTS.md.
