import axe from "axe-core";
import { expect } from "vitest";

/** Runs axe in the real browser on `element` and fails with the rule ids and nodes it violates. */
export async function expectNoAxeViolations(element: Element) {
  const { violations } = await axe.run(element);
  const found = violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ html }) => html) }));
  expect(found).toStrictEqual([]);
}
