import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/hooks/use-auth";
import { useOrganizationStore } from "@/hooks/use-organization";
import { useProjectStore } from "@/hooks/use-project";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    if (typeof window === "undefined") {
      return;
    }

    await Promise.all([
      useAuthStore.persist.rehydrate(),
      useOrganizationStore.persist.rehydrate(),
      useProjectStore.persist.rehydrate(),
    ]);

    const authStore = useAuthStore.getState();

    if (!authStore.isInitialized) {
      await authStore.initializeUserContext();
    }

    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: "/auth",
      });
    }
  },
  pendingComponent: AuthLoading,
  component: ControlLayout,
});

function AuthLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function ControlLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate({ to: "/auth" });
    }
  }, [isInitialized, isAuthenticated, navigate]);

  if (!isInitialized || !isAuthenticated) {
    return <AuthLoading />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <Logo variant="full" size="sm" linkTo="/dashboard" />
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
