import { createFileRoute } from "@tanstack/react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

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
        setError("Authentication failed. Please try again.");
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

        await apiClient.post("/auth/oauth/callback", auth0Data);

        await useAuthStore.getState().initializeUserContext();
        navigate({ to: "/dashboard/metrics" });
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>
              Something went wrong during sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground text-center">
                {error}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate({ to: "/auth" })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl">Completing Sign In</CardTitle>
          <CardDescription>
            Please wait while we set up your session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Verifying your identity
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse delay-150" />
              <span className="text-sm text-muted-foreground">
                Setting up your account
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary/30 animate-pulse delay-300" />
              <span className="text-sm text-muted-foreground">
                Redirecting to dashboard
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
