import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { authService } from "@/lib/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/user/verify")({
  component: VerifyEmailPage,
  validateSearch: searchSchema,
});

function VerifyEmailPage() {
  const search = useSearch({ from: "/user/verify" });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!search.token) {
        setError("No verification token provided");
        toast.error("No verification token provided");
        setIsLoading(false);
        return;
      }

      try {
        await authService.verifyEmail(search.token);
        toast.success("Email verified successfully!");
        navigate({ to: "/auth" });
      } catch (err: any) {
        const message =
          err.response?.data?.detail || "Failed to verify email. The token may be invalid or expired.";
        setError(message);
        toast.error(message);
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [search.token, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate({ to: "/auth" })}>
          Go to Login
        </Button>
      </div>
    </div>
  );
}
