import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { shouldRedirectAuthError } from "./lib/demoSession";
import { PRESENTATION_STOP_EVENT } from "./lib/presentation";
import "./index.css";

const queryClient = new QueryClient();
let redirecting = false;
const procedureName = (key: readonly unknown[] | undefined) =>
  Array.isArray(key?.[0]) ? key[0].join(".") : String(key?.[0] ?? "");
const redirectToLoginIfUnauthorized = (error: unknown, procedure: string) => {
  if (!(error instanceof TRPCClientError) || typeof window === "undefined") return;
  if (error.data?.code !== "UNAUTHORIZED" || redirecting) return;
  // Public chat and failed gate/login/renewal requests retain their local error UI.
  if (!shouldRedirectAuthError(window.location.pathname, procedure)) return;
  redirecting = true;
  window.dispatchEvent(new Event(PRESENTATION_STOP_EVENT));
  window.location.assign("/login");
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.query.state.error, procedureName(event.query.queryKey));
  }
});
queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.mutation.state.error, procedureName(event.mutation.options.mutationKey));
  }
});

const trpcClient = trpc.createClient({
  links: [httpBatchLink({
    url: "/api/trpc",
    transformer: superjson,
    fetch(input, init) {
      return globalThis.fetch(input, { ...(init ?? {}), credentials: "include" });
    },
  })],
});
createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
  </trpc.Provider>
);
