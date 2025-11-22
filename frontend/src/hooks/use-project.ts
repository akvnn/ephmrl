import { create } from "zustand";
import { persist } from "zustand/middleware";
import { projectService } from "@/lib/project";
import type { Project } from "@/types/project";
import { toast } from "sonner";

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;

  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  fetchAndSetProjects: (organizationId: string) => Promise<void>;
  clearProjects: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,

      setCurrentProject: (project: Project | null) => {
        set({ currentProject: project });
      },

      setProjects: (projects: Project[]) => {
        const state = get();
        const currentProject = state.currentProject;

        let newCurrentProject: Project | null = null;

        if (projects.length === 0) {
          newCurrentProject = null;
        } else if (!currentProject) {
          newCurrentProject = projects[0];
        } else {
          newCurrentProject =
            projects.find((p) => p.id === currentProject.id) ||
            projects[0] ||
            null;
        }

        set({
          projects,
          currentProject: newCurrentProject,
        });
      },

      fetchAndSetProjects: async (organizationId: string) => {
        set({ isLoading: true });
        try {
          const projects =
            await projectService.fetchProjectsByOrganization(organizationId);
          const { currentProject } = get();

          if (!currentProject && projects.length > 0) {
            set({
              projects,
              currentProject: projects[0],
              isLoading: false,
            });
          } else if (projects.length === 0) {
            set({
              projects,
              currentProject: null,
              isLoading: false,
            });
          } else if (currentProject) {
            const updatedCurrent = projects.find(
              (p) => p.id === currentProject.id
            );
            set({
              projects,
              currentProject: updatedCurrent || projects[0] || null,
              isLoading: false,
            });
          } else {
            set({ projects, isLoading: false });
          }
        } catch (error: any) {
          const message =
            error.response?.data?.detail ||
            "Failed to fetch projects. Please try again.";
          toast.error(message);
          console.error("Failed to fetch projects:", error);
          set({ isLoading: false });
        }
      },

      clearProjects: () => {
        set({ projects: [], currentProject: null });
      },
    }),
    {
      name: "project-storage",
      partialize: (state) => ({
        currentProjectId: state.currentProject?.id || null,
      }),
    }
  )
);
