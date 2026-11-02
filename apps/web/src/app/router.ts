import type { QueryClient } from "@tanstack/react-query";
import type { RouterHistory } from "@tanstack/react-router";
import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./route-tree.gen";

interface AppRouterOptions {
  queryClient: QueryClient;
  /** Browser history in the app, memory history in component tests. */
  history: RouterHistory;
}

/** One router setup for the app and its component tests, so tests exercise the real routes. */
export function createAppRouter({ queryClient, history }: AppRouterOptions) {
  return createRouter({ routeTree, history, context: { queryClient }, defaultPreload: "intent" });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
