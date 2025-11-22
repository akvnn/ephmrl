import type { Organization } from "./organization";
import type { Project } from "./project";

export interface OrganizationWithProjects extends Organization {
  projects?: Project[];
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  auth_providers: string[];
  password_hash?: string;
  auth0_user_ids: string[];
  organizations?: OrganizationWithProjects[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserCreateFromAuth0 {
  auth0_user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  auth_provider?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  handleCallback: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}
