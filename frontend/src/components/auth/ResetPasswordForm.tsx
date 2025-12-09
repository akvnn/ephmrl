import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { PasswordInput } from "./PasswordInput";
import { toast } from "sonner";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function ResetPasswordForm({
  token,
  onSuccess,
  onBack,
}: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      await authService.confirmPasswordReset({
        token,
        new_password: values.password,
      });
      toast.success(
        "Password has been reset successfully. You can now log in."
      );
      onSuccess();
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        "Invalid or expired reset link. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <PasswordInput field={field} label="New Password" />
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <PasswordInput field={field} label="Confirm New Password" />
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset password"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
        >
          Back to login
        </Button>
      </form>
    </Form>
  );
}
