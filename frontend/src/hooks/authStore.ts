import { create } from "zustand";
import { authService, type SignupData, type LoginData } from "@/lib/auth";
import type { User } from "@/types/auth";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (data: LoginData) => {
    set({ isLoading: true });
    try {
      await authService.login(data);
      set({
        user: { email: data.email } as User,
        isAuthenticated: true,
      });
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
      set({
        user: {
          email: data.email,
          full_name: data.full_name,
        } as User,
        isAuthenticated: true,
      });
      toast.success("Account created successfully!");
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
      toast.success("Logged out successfully!");
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
      });
      toast.error("Logout failed, but you've been logged out locally.");
    }
  },
}));
