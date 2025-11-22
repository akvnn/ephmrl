import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { useAuthStore } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth/")({
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate({ to: "/dashboard/analytics" });

    useAuthStore.getState().initializeUserContext();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Sign in to your account to continue"
              : "Enter your details below to create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "login" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("login")}
            >
              Log in
            </Button>
            <Button
              type="button"
              variant={mode === "signup" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("signup")}
            >
              Sign up
            </Button>
          </div>

          {mode === "login" ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <SignupForm onSuccess={handleSuccess} />
          )}

          <OAuthButtons />
        </CardContent>
      </Card>
    </div>
  );
}
