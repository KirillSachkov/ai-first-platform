// Architecture boundaries of the backend (ADR-0003, ADR-0004), checked by `pnpm boundaries`.
// Each rule's comment is the message an agent sees on a violation: it says why and where code goes.

/**
 * Allowed synchronous dependencies between modules: a module may use the contracts/ of the
 * modules listed for it. The graph must stay acyclic: Employees -> Access -> Projects.
 * Events (`*.events.ts`) are asynchronous and any module may subscribe to them.
 */
const syncGraph = {
  employees: ["access"],
  access: ["projects"],
  projects: [],
  "agent-connections": [],
};

const syncGraphRules = Object.entries(syncGraph).map(([module, allowed]) => ({
  name: `sync-graph-${module}`,
  severity: "error",
  comment:
    `Module '${module}' may synchronously call only: ${allowed.join(", ") || "no other module"}. ` +
    "Change data in another module by publishing an integration event from this module " +
    "(contracts/<module>.events.ts) and handling it there; never add a synchronous call that " +
    "creates a cycle. Security checks (sign-in, account activity, access) belong to src/edge " +
    "(ADR-0004), not to calls between modules. Changing the graph needs an ADR.",
  from: { path: `^src/modules/${module}/` },
  to: {
    path: "^src/modules/[^/]+/contracts/",
    pathNot: [
      String.raw`^src/modules/[^/]+/contracts/[^/]+\.events\.ts$`,
      `^src/modules/${module}/`,
      ...allowed.map((other) => `^src/modules/${other}/`),
    ],
  },
}));

module.exports = {
  forbidden: [
    {
      name: "module-internals-from-outside",
      severity: "error",
      comment:
        "Only a module's contracts/ is public. Call the module through a token from its " +
        "contracts/<module>.contract.ts, or subscribe to contracts/<module>.events.ts. If the " +
        "contract lacks what you need, add it to the contract and implement it inside the module.",
      from: { path: "^src/", pathNot: ["^src/modules/", String.raw`^src/app\.module\.ts$`] },
      to: { path: "^src/modules/[^/]+/", pathNot: "^src/modules/[^/]+/contracts/" },
    },
    {
      name: "app-module-registration-only",
      severity: "error",
      comment:
        "src/app.module.ts only registers modules: import a module's <module>.module.ts, nothing deeper.",
      from: { path: String.raw`^src/app\.module\.ts$` },
      to: {
        path: "^src/modules/[^/]+/",
        pathNot: [
          "^src/modules/[^/]+/contracts/",
          String.raw`^src/modules/[^/]+/[^/]+\.module\.ts$`,
        ],
      },
    },
    {
      name: "cross-module-internals",
      severity: "error",
      comment:
        "A module may reach another module only through that module's contracts/. Move shared " +
        "domain logic into the owning module and expose it through its contract; reference other " +
        "modules' entities by id only.",
      from: { path: "^src/modules/([^/]+)/" },
      to: {
        path: "^src/modules/",
        pathNot: ["^src/modules/$1/", "^src/modules/[^/]+/contracts/"],
      },
    },
    {
      name: "contracts-stand-alone",
      severity: "error",
      comment:
        "contracts/ is the public surface: it declares tokens, interfaces and event types only. " +
        "It must not import other modules or this module's domain, features or infrastructure; " +
        "declare plain types in the contract (shared/ technical types are fine).",
      from: { path: "^src/modules/([^/]+)/contracts/" },
      to: { path: "^src/modules/", pathNot: "^src/modules/$1/contracts/" },
    },
    ...syncGraphRules,
    {
      name: "domain-is-pure",
      severity: "error",
      comment:
        "domain/ holds entities, value objects and rules in plain TypeScript. Keep NestJS, Drizzle " +
        "and other infrastructure out: define a port (interface) in domain/ and implement it in " +
        "infrastructure/; put wiring and HTTP in features/.",
      from: { path: "^src/modules/[^/]+/domain/" },
      to: {
        path: [
          "^src/modules/[^/]+/(features|infrastructure)/",
          "^src/(edge|system)/",
          "^src/shared/(database|messaging|http|health|config)/",
          "node_modules/(@nestjs|drizzle-orm|drizzle-kit|pg|amqplib|fastify|nestjs-pino|pino)/",
        ],
      },
    },
    {
      name: "features-are-independent",
      severity: "error",
      comment:
        "Vertical slices must not import each other. Move what both slices need into the " +
        "module's domain/ (rules) or infrastructure/ (persistence), or duplicate a small query.",
      from: { path: "^src/modules/([^/]+)/features/([^/]+)/" },
      to: {
        path: "^src/modules/$1/features/",
        pathNot: "^src/modules/$1/features/$2/",
      },
    },
    {
      name: "system-slices-are-independent",
      severity: "error",
      comment:
        "System slices must not import each other. Shared technical code belongs in src/shared/.",
      from: { path: "^src/system/([^/]+)/" },
      to: { path: "^src/system/[^/]+/", pathNot: "^src/system/$1/" },
    },
    {
      name: "modules-do-not-use-edge-or-system",
      severity: "error",
      comment:
        "Modules never call the edge layer or system endpoints. Features receive the RequestContext " +
        "as input and declare access with decorators from src/shared/http/.",
      from: { path: "^src/modules/" },
      to: { path: "^src/(edge|system)/" },
    },
    {
      name: "shared-is-technical",
      severity: "error",
      comment:
        "src/shared/ holds technical code only (async, database, messaging, config, http, health, " +
        "request context) " +
        "and must not depend on modules, the edge layer or system endpoints. Domain code belongs " +
        "in its module.",
      from: { path: "^src/shared/" },
      to: { path: "^src/(modules|edge|system)/" },
    },
    {
      name: "app-built-only-in-app-ts",
      severity: "error",
      comment:
        "Only src/app.ts builds the application from AppModule with createNestApp; call createApp " +
        "from src/app.ts. Only tests register additional modules, in test/start-app.ts.",
      from: { path: "^src/", pathNot: String.raw`^src/app\.ts$` },
      to: { path: String.raw`^src/(app\.module|nest-app)\.ts$` },
    },
    {
      name: "production-code-does-not-import-tests",
      severity: "error",
      comment:
        "test/ holds test infrastructure. Production code must not import it; move what " +
        "production needs into src/.",
      from: { path: "^src/", pathNot: String.raw`\.test\.ts$` },
      to: { path: "^test/" },
    },
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular imports break initialization order. Extract the shared part or invert it.",
      from: {},
      to: { circular: true },
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      comment: "The import does not resolve. Fix the path or add the dependency to package.json.",
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    // Type-only imports are dependencies too: a contract type is still a coupling.
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".ts", ".js"],
    },
  },
};
