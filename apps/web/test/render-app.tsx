import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "vitest-browser-react";

import { createAppRouter } from "@/app/router";

/** Renders the whole app at `url` with the real router and TanStack Query; HTTP goes to MSW. */
export function renderApp(url: string) {
  // A fresh cache per test; no query retries, so an error state appears at once.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createAppRouter({
    queryClient,
    history: createMemoryHistory({ initialEntries: [url] }),
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
