import { create } from "zustand";
import { authService, type SignupData, type LoginData } from "@/lib/auth";
import type { User } from "@/types/auth";
import { toast } from "sonner";
import { useOrganizationStore } from "./use-organization";
import { useProjectStore } from "./use-project";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  initializeUserContext: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  login: async (data: LoginData) => {
    set({ isLoading: true });
    try {
      await authService.login(data);
      set({ isInitialized: false });
      toast.success("Logged in successfully!");
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Login failed. Please try again.";
      toast.error(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (data: SignupData) => {
    set({ isLoading: true });
    try {
      await authService.signup(data);
      set({ isInitialized: false });
      toast.success(
        "Account created successfully! Please check your email to verify."
      );
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Signup failed. Please try again.";
      toast.error(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
      });

      useOrganizationStore.getState().clearOrganizations();
      useProjectStore.getState().clearProjects();

      toast.success("Logged out successfully!");
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
      });

      useOrganizationStore.getState().clearOrganizations();
      useProjectStore.getState().clearProjects();

      toast.error("Logout failed, but you've been logged out locally.");
    }
  },

  initializeUserContext: async () => {
    if (get().isInitialized) {
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
      });

      await useOrganizationStore.getState().fetchAndSetOrganizations();

      const currentOrganization =
        useOrganizationStore.getState().currentOrganization;

      if (currentOrganization) {
        await useProjectStore
          .getState()
          .fetchAndSetProjects(currentOrganization.id);
      }
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    }
  },
}));
