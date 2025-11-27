import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";

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
  SidebarRail,
} from "@/components/ui/sidebar";

const navMain = [
  {
    title: "Navigation",
    url: "#",
    items: [
      {
        title: "Home",
        url: "/",
      },
    ],
  },
  {
    title: "Workspace",
    url: "#",
    items: [
      {
        title: "Analytics",
        url: "/dashboard/analytics",
      },
    ],
  },
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

  return (
    <Sidebar {...props}>
      <SidebarHeader>
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
      <SidebarRail />
    </Sidebar>
  );
}
