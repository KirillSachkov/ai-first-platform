import { createFileRoute } from "@tanstack/react-router";

import { SystemPage } from "@/pages/system";

export const Route = createFileRoute("/system")({ component: SystemPage });
