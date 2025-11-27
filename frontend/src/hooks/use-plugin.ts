import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import apiClient from "@/lib/axios";

export interface Plugin {
  slug: string;
  name?: string;
  description?: string;
}

export interface InstalledPlugin {
  org_id: string;
  plugin_slug: string;
  enabled: boolean;
  installed_at: string;
}

interface PluginStore {
  installedPlugins: InstalledPlugin[];
  selectedPlugin: string | null;
  isLoading: boolean;

  setSelectedPlugin: (pluginSlug: string | null) => void;
  setInstalledPlugins: (plugins: InstalledPlugin[]) => void;
  fetchAndSetInstalledPlugins: (organizationId: string) => Promise<void>;
  clearPlugins: () => void;
}

export const usePluginStore = create<PluginStore>()(
  persist(
    (set) => ({
      installedPlugins: [],
      selectedPlugin: null,
      isLoading: false,

      setSelectedPlugin: (pluginSlug: string | null) => {
        set({ selectedPlugin: pluginSlug });
      },

      setInstalledPlugins: (plugins: InstalledPlugin[]) => {
        set({ installedPlugins: plugins });
      },

      fetchAndSetInstalledPlugins: async (organizationId: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.get(
            `/plugins/installed?organization_id=${organizationId}`
          );

          set({
            installedPlugins: response.data,
            isLoading: false,
          });
        } catch (error: any) {
          const message =
            error.response?.data?.detail ||
            "Failed to fetch plugins. Please try again.";
          toast.error(message);
          console.error("Failed to fetch plugins:", error);
          set({ isLoading: false });
        }
      },

      clearPlugins: () => {
        set({ installedPlugins: [], selectedPlugin: null });
      },
    }),
    {
      name: "plugin-storage",
      partialize: (state) => ({
        selectedPlugin: state.selectedPlugin,
      }),
    }
  )
);
