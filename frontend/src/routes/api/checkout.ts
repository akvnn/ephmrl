import { Checkout } from "@polar-sh/tanstack-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      GET: Checkout({
        accessToken: import.meta.env.VITE_POLAR_ACCESS_TOKEN!,
        successUrl: "http://localhost:3000",
        returnUrl: "http://localhost:3000",
        server: "sandbox",
      }),
    },
  },
});
