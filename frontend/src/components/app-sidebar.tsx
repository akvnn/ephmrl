import * as React from "react";
import { Link } from "@tanstack/react-router";

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

const data = {
  versions: ["Free Tier", "Pro", "Enterprise"],
  navMain: [
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
          isActive: true,
        },
        {
          title: "Projects",
          url: "#",
        },
        {
          title: "Usage Analytics",
          url: "#",
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
          title: "Model Playground",
          url: "#",
        },
        {
          title: "Browse Models",
          url: "/dashboard/models",
        },
        {
          title: "Deploy New",
          url: "#",
        },
      ],
    },
    {
      title: "Documents & Data",
      url: "#",
      items: [
        {
          title: "All Documents",
          url: "#",
        },
        {
          title: "Upload",
          url: "#",
        },
        {
          title: "RAG Collections",
          url: "#",
        },
      ],
    },
    {
      title: "API & Integration",
      url: "#",
      items: [
        {
          title: "API Keys",
          url: "#",
        },
        {
          title: "Endpoints",
          url: "#",
        },
        {
          title: "Webhooks",
          url: "#",
        },
        {
          title: "Documentation",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      items: [
        {
          title: "Profile",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Preferences",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <ContextSwitcher />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton asChild isActive={subItem.isActive}>
                      {subItem.url === "#" ? (
                        <a href={subItem.url}>{subItem.title}</a>
                      ) : (
                        <Link to={subItem.url}>{subItem.title}</Link>
                      )}
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
