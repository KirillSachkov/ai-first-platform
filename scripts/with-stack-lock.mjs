// Runs a command while it holds the host-wide lock on the shared Compose stack.
// Usage: node scripts/with-stack-lock.mjs <command> [args...]
//
// All worktrees share one stack (the project name and host ports are fixed), and `pnpm smoke`
// stops PostgreSQL in it. So `pnpm test:e2e` and `pnpm smoke` take this lock and wait for each
// other. The lock is a directory outside the repository; mkdir creates it atomically.
// It holds the PID of its owner, so a lock left by a killed process is taken over.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// A fixed /tmp path, not os.tmpdir(): sandboxed agent sessions may get their own TMPDIR.
const lockDir = join(
  process.platform === "win32" ? tmpdir() : "/tmp",
  "ai-first-platform-stack.lock",
);
const ownerFile = join(lockDir, "owner");
const pollMs = 2_000;

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Usage: node scripts/with-stack-lock.mjs <command> [args...]");
  process.exit(2);
}

await acquire();
// Ctrl+C reaches the child too; the wrapper only waits for it to exit and then releases the lock.
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => {});
process.on("exit", release);

const child = spawn(command, args, { stdio: "inherit" });
child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
child.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});

async function acquire() {
  let announced = false;
  for (;;) {
    try {
      mkdirSync(lockDir);
      writeFileSync(ownerFile, `${process.pid}\n${process.cwd()}\n`);
      return;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
    const owner = readOwner();
    if (owner ? !isAlive(owner.pid) : isOrphan()) {
      console.error(`Removing a stale stack lock left by process ${owner?.pid ?? "unknown"}.`);
      rmSync(lockDir, { recursive: true, force: true });
      continue;
    }
    if (!announced) {
      const holder = owner ? `process ${owner.pid} in ${owner.cwd}` : "another process";
      console.error(`The Compose stack is in use by ${holder}. Waiting for it (${lockDir})…`);
      announced = true;
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}

function readOwner() {
  try {
    const [pid, cwd] = readFileSync(ownerFile, "utf8").split("\n");
    return { pid: Number(pid), cwd };
  } catch {
    // The owner has created the directory but not written the file yet, or has just released it.
    return undefined;
  }
}

// A lock directory without an owner file for 10 s means its creator died before writing the file.
function isOrphan() {
  try {
    return Date.now() - statSync(lockDir).mtimeMs > 10_000;
  } catch {
    return false;
  }
}

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}

function release() {
  if (readOwner()?.pid === process.pid) {
    rmSync(lockDir, { recursive: true, force: true });
  }
}
