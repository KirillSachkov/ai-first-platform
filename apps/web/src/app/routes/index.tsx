import { createFileRoute, redirect } from "@tanstack/react-router";

// No product pages exist yet; the system page is the only screen.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/system" });
  },
});
