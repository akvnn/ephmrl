import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
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
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useAuthStore } from "@/hooks/use-auth";

const searchSchema = z.object({
  reset_token: z.string().optional(),
});

export const Route = createFileRoute("/auth/")({
  component: AuthPage,
  validateSearch: searchSchema,
});

type AuthMode = "login" | "signup" | "forgot-password" | "reset-password";

function AuthPage() {
  const search = useSearch({ from: "/auth/" });
  const [mode, setMode] = useState<AuthMode>("login");
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (search.reset_token) {
      setMode("reset-password");
      return;
    }

    if (isAuthenticated) {
      navigate({ to: "/dashboard/deployed" });
    }
  }, [search.reset_token, isAuthenticated, navigate]);

  const handleSuccess = () => {
    navigate({ to: "/dashboard/deployed" });
    useAuthStore.getState().initializeUserContext();
  };

  const handleResetSuccess = () => {
    navigate({ to: "/auth", search: {} });
    setMode("login");
  };

  const handleBackToLogin = () => {
    navigate({ to: "/auth", search: {} });
    setMode("login");
  };

  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Welcome back";
      case "signup":
        return "Create an account";
      case "forgot-password":
        return "Reset your password";
      case "reset-password":
        return "Set new password";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "login":
        return "Sign in to your account to continue";
      case "signup":
        return "Enter your details below to create your account";
      case "forgot-password":
        return "Enter your email and we'll send you a reset link";
      case "reset-password":
        return "Enter your new password below";
    }
  };

  const renderForm = () => {
    switch (mode) {
      case "login":
        return (
          <LoginForm
            onSuccess={handleSuccess}
            onForgotPassword={() => setMode("forgot-password")}
          />
        );
      case "signup":
        return <SignupForm onSuccess={handleSuccess} />;
      case "forgot-password":
        return <ForgotPasswordForm onBack={handleBackToLogin} />;
      case "reset-password":
        return (
          <ResetPasswordForm
            token={search.reset_token || ""}
            onSuccess={handleResetSuccess}
            onBack={handleBackToLogin}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(mode === "login" || mode === "signup") && (
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
          )}

          {renderForm()}

          {(mode === "login" || mode === "signup") && <OAuthButtons />}
        </CardContent>
      </Card>
    </div>
  );
}
