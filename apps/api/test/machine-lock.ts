import { mkdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const lockPath = path.join(tmpdir(), "ai-first-platform-testcontainers.lock");
// A process that died while holding the lock leaves it behind; nobody holds it this long.
const STALE_AFTER_MS = 5 * 60 * 1000;

/**
 * Runs `work` while no other process on this machine runs it. Testcontainers locks container
 * creation only inside one process, so test runs in two worktrees would otherwise each start their
 * own copy of a reused container.
 */
export async function withMachineLock<Result>(work: () => Promise<Result>): Promise<Result> {
  // oxlint-disable-next-line eslint/no-await-in-loop -- polls until the other process is done
  while (!(await tryLock())) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- polls until the other process is done
    await sleep(250);
  }
  try {
    return await work();
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

// mkdir is atomic: of several processes, exactly one creates the directory.
async function tryLock(): Promise<boolean> {
  try {
    await mkdir(lockPath);
    return true;
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) {
      throw error;
    }
    const lockedAt = await stat(lockPath).then(
      ({ mtimeMs }) => mtimeMs,
      () => Date.now(),
    );
    if (Date.now() - lockedAt > STALE_AFTER_MS) {
      await rm(lockPath, { recursive: true, force: true });
    }
    return false;
  }
}
