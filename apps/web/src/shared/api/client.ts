import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import type { paths } from "./schema.gen";

// Typed from apps/api/openapi/openapi.json. Regenerate with `pnpm api:generate` after changing
// backend endpoint schemas.
const fetchClient = createFetchClient<paths>({ baseUrl: "/api" });

// Failures outside the API contract (the dev proxy cannot reach the backend, a gateway error)
// carry no JSON body; turn them into errors that say what happened.
fetchClient.use({
  onResponse({ response }) {
    const isJson = response.headers.get("content-type")?.includes("json") ?? false;
    if (!response.ok && !isJson) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }
  },
});

export const $api = createClient(fetchClient);
