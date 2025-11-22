import { createFileRoute } from "@tanstack/react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";

export const Route = createFileRoute("/auth/callback")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (isLoading) return;

      if (!isAuthenticated || !user) {
        setError("Authentication failed");
        return;
      }

      try {
        const auth0Data = {
          auth0_user_id: user.sub!,
          email: user.email!,
          full_name: user.name,
          avatar_url: user.picture,
          auth_provider: "auth0",
        };

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await axios.post(
          `${API_URL}/auth/oauth/callback`,
          auth0Data
        );

        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);

        navigate({ to: "/dashboard/analytics" });
      } catch (err: any) {
        console.error("Callback error:", err);
        setError(
          err.response?.data?.detail || err.message || "Authentication failed"
        );
      }
    };

    handleCallback();
  }, [user, isAuthenticated, isLoading, navigate]);

  if (error) {
    return (
      <div>
        <h1>Authentication Error</h1>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => navigate({ to: "/" })}>Return Home</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Completing authentication...</h1>
      <p>Please wait while we log you in.</p>
    </div>
  );
}
