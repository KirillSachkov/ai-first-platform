# PR report rules

These rules extend the `pr` template. Write a report the owner understands without reading the conversation or every changed line. Root `AGENTS.md` sets the language, including headings.

## Shape

The first line is the agent provenance line from [delivery](delivery.md#main-and-owner-acceptance); it is not a preamble. Use the template sections in the team language, scaled to the change. Summary leads with the changed behavior. Then:

- **What the owner needs to do** follows Summary: the concrete action or question, expected result, reason, and evidence. Present additional checks as [human-review.md](human-review.md#present-the-result) requires, or give a short reason why none is needed.
- **Evidence** keeps the short verification result and its important limit visible. A `<details>` block below it holds the checked head (commit permalink), the review base (full SHA), and a table of every check actually run on the delivered result: check, actual result, what it confirms.
- **Merge Danger** also states reversibility, rollback, and residual uncertainty.

Omit empty sections and replace every placeholder.

## Evidence

Distinguish current evidence from earlier runs, planned work, skipped checks, and unavailable checks. For a bug, show the reproduction or regression test failing before the fix and passing after it, when observed. For changed assertions, explain the old and new expectation and the requirement that changed it. A screenshot demonstrates visible state; permissions and side effects need evidence at their boundary. Label examples and proposed experiments as unexecuted. Give each image alt text and a caption naming the scenario and the observed result. Link only real, accessible artifacts; never invent screenshots, upload URLs, or status badges.

Link each finding to its disposition. Explain a rejected finding or a deferred item instead of hiding it in a green summary. Mark an owner action complete only from the owner's recorded result. Keep readiness, acceptance, and merge distinct.

## Language and presentation

Use plain, concrete sentences with one idea each. Introduce unfamiliar terms. Prefer behavior and consequences to an inventory of files; add file links only where they help inspection.

A diagram reads on its own: start at the real trigger, name actors by role, and show what each connection carries. Translate labels into the team language. A diagram shows a process or model; it is not execution evidence.

Keep the conclusion, required human actions, blockers, and material uncertainty outside collapsed sections. Collapse supporting detail once, without nested disclosures, and keep blank lines around Markdown inside HTML. Use one GitHub alert (`> [!IMPORTANT]`) only for information that changes the acceptance decision. Let native CI checks carry live status; any status in the body names its run and revision. Colour or emoji alone never carries meaning.

Link the issue, CI run, evidence, and code at the checked revision with accessible GitHub links; local paths and private session artifacts are not shared evidence. Read the rendered PR before handoff; if rendering cannot be inspected, state that limit.
