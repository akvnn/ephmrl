import { create } from "zustand";
import { persist } from "zustand/middleware";
import { organizationService } from "@/lib/organization";
import type { Organization } from "@/types/organization";
import { toast } from "sonner";
import { usePluginStore } from "./use-plugin";
import { useProjectStore } from "./use-project";

interface OrganizationStore {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;

  setCurrentOrganization: (organization: Organization | null) => void;
  setOrganizations: (organizations: Organization[]) => void;
  fetchAndSetOrganizations: () => Promise<void>;
  clearOrganizations: () => void;
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set, get) => ({
      organizations: [],
      currentOrganization: null,
      isLoading: false,

      setCurrentOrganization: (organization: Organization | null) => {
        const currentOrg = get().currentOrganization;
        set({ currentOrganization: organization });

        // Reset plugin and fetch projects when org changes
        if (currentOrg?.id !== organization?.id && organization) {
          usePluginStore.getState().clearPlugins();
          useProjectStore.getState().fetchAndSetProjects(organization.id);
        }
      },

      setOrganizations: (organizations: Organization[]) => {
        const currentOrganization = get().currentOrganization;

        let newCurrentOrganization: Organization | null = null;

        if (!currentOrganization && organizations.length > 0) {
          newCurrentOrganization = organizations[0];
        } else if (currentOrganization) {
          newCurrentOrganization =
            organizations.find((org) => org.id === currentOrganization.id) ||
            organizations[0] ||
            null;
        }

        set({
          organizations,
          currentOrganization: newCurrentOrganization,
        });
      },

      fetchAndSetOrganizations: async () => {
        set({ isLoading: true });
        try {
          const organizations =
            await organizationService.fetchUserOrganizations();
          const { currentOrganization } = get();

          if (!currentOrganization && organizations.length > 0) {
            set({
              organizations,
              currentOrganization: organizations[0],
              isLoading: false,
            });
          } else if (currentOrganization) {
            const updatedCurrent = organizations.find(
              (org) => org.id === currentOrganization.id
            );
            set({
              organizations,
              currentOrganization: updatedCurrent || organizations[0] || null,
              isLoading: false,
            });
          } else {
            set({ organizations, isLoading: false });
          }
        } catch (error: any) {
          const message =
            error.response?.data?.detail ||
            "Failed to fetch organizations. Please try again.";
          toast.error(message);
          console.error("Failed to fetch organizations:", error);
          set({ isLoading: false });
        }
      },

      clearOrganizations: () => {
        set({ organizations: [], currentOrganization: null });
      },
    }),
    {
      name: "organization-storage",
      partialize: (state) => ({
        currentOrganization: state.currentOrganization,
      }),
    }
  )
);
