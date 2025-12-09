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
import { Mail, CheckCircle2 } from "lucide-react";

const searchSchema = z.object({
  reset_token: z.string().optional(),
});

export const Route = createFileRoute("/auth/")({
  component: AuthPage,
  validateSearch: searchSchema,
});

type AuthMode = "login" | "signup" | "forgot-password" | "reset-password" | "verify-pending";

function AuthPage() {
  const search = useSearch({ from: "/auth/" });
  const [mode, setMode] = useState<AuthMode>("login");
  const [signupEmail, setSignupEmail] = useState<string>("");
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
      case "verify-pending":
        return "Check your email";
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
      case "verify-pending":
        return "We've sent a verification link to your email";
    }
  };

  const handleSignupSuccess = (email: string) => {
    setSignupEmail(email);
    setMode("verify-pending");
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
        return <SignupForm onSuccess={handleSignupSuccess} />;
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
      case "verify-pending":
        return (
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to:
              </p>
              <p className="font-medium text-foreground">{signupEmail}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2 text-left text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Check your inbox and spam folder</span>
              </div>
              <div className="flex items-start gap-2 text-left text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Click the verification link in the email</span>
              </div>
              <div className="flex items-start gap-2 text-left text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Return here to log in once verified</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMode("login")}
            >
              Back to Login
            </Button>
          </div>
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
