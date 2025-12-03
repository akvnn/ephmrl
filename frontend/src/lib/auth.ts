import apiClient from "@/lib/axios";
import type { User } from "@/types/auth";

export interface SignupData {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
}

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetConfirmData {
  token: string;
  new_password: string;
}

export const authService = {
  async signup(data: SignupData): Promise<User> {
    const response = await apiClient.post<User>("/auth/signup", data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("/user/info");
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/refresh");
    return response.data;
  },

  async logout(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/logout");
    return response.data;
  },

  async requestPasswordReset(data: PasswordResetRequestData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/user/password/reset-request", data);
    return response.data;
  },

  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/user/password/reset-confirm", data);
    return response.data;
  },
};
