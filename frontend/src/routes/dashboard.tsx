import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
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
  component: ControlLayout,
});

function ControlLayout() {
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
