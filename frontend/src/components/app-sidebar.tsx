import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useThemeStore } from "@/hooks/use-theme";
import { Settings, Sun, Moon, LogOut, ChevronDown, Loader2 } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";

import { Logo } from "@/components/Logo";
import { SearchForm } from "@/components/search-form";
import { ContextSwitcher } from "@/components/context-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navMain = [
  {
    title: "Models",
    url: "#",
    items: [
      {
        title: "Deployed Models",
        url: "/dashboard/deployed",
      },
      {
        title: "Browse Models",
        url: "/dashboard/models",
      },
    ],
  },
  {
    title: "Workspace",
    url: "#",
    items: [
      {
        title: "Metrics",
        url: "/dashboard/metrics",
      },
    ],
  },
  {
    title: "Documents & Data",
    url: "#",
    items: [
      {
        title: "Documents",
        url: "/dashboard/documents",
      },
      {
        title: "AI Chat",
        url: "/dashboard/chat",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { resolvedTheme, setTheme } = useThemeStore();
  const { logout, isLoading } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="px-2 py-1">
          <Logo variant="full" size="sm" linkTo="/" />
        </div>
        <ContextSwitcher />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === subItem.url}
                    >
                      <Link to={subItem.url}>{subItem.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                  <ChevronDown
                    className={`ml-auto h-4 w-4 transition-transform ${
                      settingsOpen ? "rotate-180" : ""
                    }`}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-2 py-2">
                <div className="space-y-2">
                  <p className="text-xs text-sidebar-foreground/60 px-2">
                    Theme
                  </p>
                  <button
                    onClick={() =>
                      setTheme(resolvedTheme === "dark" ? "light" : "dark")
                    }
                    className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <span className="flex items-center gap-2">
                      {resolvedTheme === "dark" ? (
                        <Sun className="h-3 w-3" />
                      ) : (
                        <Moon className="h-3 w-3" />
                      )}
                      {resolvedTheme === "dark" ? "Light" : "Dark"}
                    </span>
                  </button>
                </div>
                <div className="space-y-2 mt-3 pt-3 border-t border-sidebar-border">
                  <p className="text-xs text-sidebar-foreground/60 px-2">
                    Account
                  </p>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <LogOut className="h-3 w-3" />
                      )}
                      {isLoading ? "Logging out..." : "Logout"}
                    </span>
                  </button>
                </div>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <LogOut className="h-4 w-4" />
                <span>Exit</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
