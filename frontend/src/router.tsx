import { createRouter } from "@tanstack/react-router";
import { useOrganizationStore } from "@/hooks/use-organization";
import { useProjectStore } from "@/hooks/use-project";
import NotFound from "@/components/NotFound";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 3000,
    defaultPreload: "viewport",
    context: {
      getOrganization: () =>
        useOrganizationStore.getState().currentOrganization,
      getProject: () => useProjectStore.getState().currentProject,
    },
    defaultNotFoundComponent: NotFound,
  });

  return router;
};
