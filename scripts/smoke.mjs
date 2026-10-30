// Smoke check of the local stack: starts it with Docker Compose, checks readiness and the
// end-to-end request through the web proxy, then stops PostgreSQL to check that the backend
// reports it as unavailable and recovers without a restart. Leaves the stack running.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

if (!existsSync(".env")) {
  fail("No .env in the repository root. Create it with `cp .env.example .env`.");
}
process.loadEnvFile(".env");
const web = `http://127.0.0.1:${process.env.WEB_HOST_PORT ?? "5173"}`;

try {
  await step("docker compose up --build --wait", () => {
    compose("up", "--build", "--detach", "--wait");
  });

  await step("web serves the SPA", async () => {
    const response = await fetch(`${web}/`);
    expect(response.ok, `GET / returned ${response.status}`);
    expect((await response.text()).includes('<div id="root">'), "GET / did not return index.html");
  });

  await step("backend is ready through the web proxy", async () => {
    const body = await getJson("/api/health/ready", 200);
    expect(body.dependencies.database.status === "ok", "database is not ok");
    expect(body.dependencies.rabbitmq.status === "ok", "rabbitmq is not ok");
  });

  await step("system status answers through the web proxy", async () => {
    const body = await getJson("/api/system/status", 200);
    expect(body.service === "api", "unexpected service name");
    expect(body.dependencies.database === "ok", "database is not ok");
    expect(body.dependencies.rabbitmq === "ok", "rabbitmq is not ok");
  });

  try {
    await step("stop postgres", () => compose("stop", "postgres"));

    await step("readiness reports the database as unavailable", async () => {
      await eventually(async () => {
        const body = await getJson("/api/health/ready", 503);
        expect(body.dependencies.database.status === "unavailable", "database still reported ok");
        expect(body.dependencies.rabbitmq.status === "ok", "rabbitmq should stay ok");
      });
    });

    await step("api process keeps running", () => {
      const running = compose("ps", "--status", "running", "--services").split("\n");
      expect(running.includes("api"), "api container is not running");
    });
  } finally {
    await step("start postgres", () => compose("start", "postgres"));
  }

  await step("backend recovers without a restart", async () => {
    await eventually(() => getJson("/api/health/ready", 200), 60_000);
  });

  console.log(
    "\nSmoke check passed. The stack is still running; stop it with `docker compose down`.",
  );
} catch (error) {
  console.error(`\n${error.message}`);
  process.exitCode = 1;
}

function compose(...args) {
  return execFileSync("docker", ["compose", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
}

async function getJson(path, expectedStatus) {
  const response = await fetch(`${web}${path}`, { signal: AbortSignal.timeout(5_000) });
  const body = await response.json();
  expect(
    response.status === expectedStatus,
    `GET ${path} returned ${response.status}, expected ${expectedStatus}: ${JSON.stringify(body)}`,
  );
  return body;
}

async function eventually(check, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      return await check();
    } catch (error) {
      if (Date.now() > deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
}

async function step(name, run) {
  process.stdout.write(`- ${name}… `);
  try {
    await run();
    console.log("ok");
  } catch (error) {
    console.log("failed");
    throw error;
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
