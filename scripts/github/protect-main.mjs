#!/usr/bin/env node
// Applies the `main` ruleset and the merge and Actions settings of the repository.
// Idempotent: run it again after a change here, it updates the ruleset by name.
// Needs `gh` signed in as a repository admin. Usage: pnpm github:protect-main [owner/repo]
import { execFileSync } from "node:child_process";

const RULESET_NAME = "main";
// GitHub Actions app: the `ci-ok` check must come from a workflow, not from any status sender.
const GITHUB_ACTIONS_APP_ID = 15368;

const repo =
  process.argv[2] ??
  execFileSync("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"], {
    encoding: "utf8",
  }).trim();

function gh(method, path, body) {
  const args = ["api", "--method", method, `repos/${repo}${path}`];
  if (body !== undefined) args.push("--input", "-");
  const out = execFileSync("gh", args, {
    encoding: "utf8",
    input: body === undefined ? undefined : JSON.stringify(body),
  });
  return out.trim() === "" ? undefined : JSON.parse(out);
}

const ruleset = {
  name: RULESET_NAME,
  target: "branch",
  enforcement: "active",
  // No exceptions, the owner included.
  bypass_actors: [],
  conditions: { ref_name: { include: ["refs/heads/main"], exclude: [] } },
  rules: [
    { type: "deletion" },
    { type: "non_fast_forward" },
    { type: "required_linear_history" },
    {
      type: "pull_request",
      parameters: {
        required_approving_review_count: 0,
        dismiss_stale_reviews_on_push: false,
        require_code_owner_review: false,
        require_last_push_approval: false,
        required_review_thread_resolution: false,
        allowed_merge_methods: ["squash"],
      },
    },
    {
      type: "required_status_checks",
      parameters: {
        // The branch must be up to date with `main` before merge.
        strict_required_status_checks_policy: true,
        do_not_enforce_on_create: false,
        required_status_checks: [{ context: "ci-ok", integration_id: GITHUB_ACTIONS_APP_ID }],
      },
    },
  ],
};

const existing = gh("GET", "/rulesets").find((r) => r.name === RULESET_NAME);
const applied = existing
  ? gh("PUT", `/rulesets/${existing.id}`, ruleset)
  : gh("POST", "/rulesets", ruleset);
console.log(`Ruleset "${applied.name}" (id ${applied.id}) ${existing ? "updated" : "created"}.`);

const mergeSettings = {
  allow_squash_merge: true,
  allow_merge_commit: false,
  allow_rebase_merge: false,
  allow_auto_merge: false,
};
const updatedRepo = gh("PATCH", "", mergeSettings);
for (const [key, value] of Object.entries(mergeSettings)) {
  if (updatedRepo[key] !== value)
    throw new Error(`${key} is ${updatedRepo[key]}, expected ${value}`);
}
console.log("Merge settings: squash only, auto-merge off.");

gh("PUT", "/actions/permissions/workflow", {
  default_workflow_permissions: "read",
  can_approve_pull_request_reviews: false,
});
console.log("GITHUB_TOKEN default: read only, cannot approve pull requests.");
