// Project rules that oxlint has no built-in equivalent for. Oxlint loads this file as an ESLint-compatible JS plugin.

const DISABLE_DIRECTIVE = /^\s*(?:eslint|oxlint)-disable(?:-next-line|-line)?(?<rest>\s[\s\S]*)?$/u;

/** A rule may be disabled in code only with a reason: `// oxlint-disable-next-line rule -- why`. */
const requireDisableReason = {
  meta: {
    type: "suggestion",
    docs: { description: "Require a reason after `--` in every disable directive." },
    messages: {
      missingReason:
        "Explain why the rule does not apply here: add ` -- <reason>` after the rule names, " +
        "for example `// oxlint-disable-next-line eslint/no-await-in-loop -- steps must run in order`. " +
        "If the rule should not apply anywhere, change the shared config in packages/oxlint-config instead.",
    },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const match = DISABLE_DIRECTIVE.exec(comment.value);
          if (match === null) {
            continue;
          }
          const reason = match.groups?.rest?.split(" -- ")[1]?.trim() ?? "";
          if (reason === "") {
            context.report({ loc: comment.loc, messageId: "missingReason" });
          }
        }
      },
    };
  },
};

export default {
  meta: { name: "platform" },
  rules: { "require-disable-reason": requireDisableReason },
};
