# Worktree ownership and shared services

Each independent implementation uses its own worktree and branch. Diagnosis that writes reproductions or instrumentation uses a dedicated diagnosis worktree under the same ownership rules. Reuse the assigned worktree when resuming the same issue. One writer owns a worktree at a time. Read-only reviewers may share a committed snapshot; reviewers that modify files or generate artifacts need their own copy.

## Start or resume

1. Inspect the current path, branch, HEAD, status, and assigned issue or diagnosis target. Preserve existing changes and live work.
2. For independent work, base a new branch/worktree on fetched `origin/main`. Confirm its actual base before editing.
3. If the current copy is already dedicated to the issue, reuse it. Establish ownership before writing. An integration ticket bases its worktree on the integration branch instead of main.
4. Use the host's worktree manager and its version-matched skill when available. Parent/child UI metadata does not prove the Git base. Never reset a foreign checkout to obtain the desired base.
5. Prepare dependencies and local configuration for this copy using the pinned Node/pnpm versions, package scripts, Compose configuration, and `.env.example`. Do not share writable `node_modules` between branches. A worktree does not automatically prepare services or credentials.

Use the root checkout for orientation rather than implementation. Use bounded issue-related names for branches and worktrees. Parallel implementation workers each get a separate writable copy; merge into the integration branch serially.

## Shared resources

[testing.md](testing.md#machine-sharing) and the Compose configuration describe the current shared Testcontainers and Compose stack. Worktrees isolate working files, not credentials, ports, containers, or access permissions.

E2E and smoke use the existing machine-wide lock. A manual Compose/watch/browser session needs one known owner for its entire duration. Do not start a competing watch, rebuild, stop, or cleanup against another session's stack. If ownership is unclear, ask before changing the shared stack. Existing command locks do not protect arbitrary manual commands.

Separate Compose projects, ports, volumes, or service launchers are future infrastructure work; this procedure does not claim that isolation exists.

## Finish

Retain the PR worktree for owner review. Remove only owned child worktrees after their commits are integrated and no active worker needs them. Check for uncommitted/untracked work and preserve evidence first. Cleanup is not permission to force-delete resources or stop another session's services.
