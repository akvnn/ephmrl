import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Plus, Folder } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrganizationStore } from "@/hooks/use-organization";
import { useProjectStore } from "@/hooks/use-project";
import { organizationService } from "@/lib/organization";
import { projectService } from "@/lib/project";

export function ContextSwitcher() {
  const router = useRouter();
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false);
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] =
    useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const organizations = useOrganizationStore((state) => state.organizations);
  const currentOrganization = useOrganizationStore(
    (state) => state.currentOrganization
  );
  const setCurrentOrganization = useOrganizationStore(
    (state) => state.setCurrentOrganization
  );

  const handleOrganizationChange = (org: typeof currentOrganization) => {
    if (org?.id === currentOrganization?.id) return;
    setCurrentOrganization(org);
    router.invalidate();
  };

  const projects = useProjectStore((state) => state.projects);
  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const projectsLoading = useProjectStore((state) => state.isLoading);

  const handleProjectChange = (project: typeof currentProject) => {
    if (project?.id === currentProject?.id) return;
    setCurrentProject(project);
    router.invalidate();
  };

  const selectedOrg = currentOrganization;
  const selectedProject = currentProject;

  useEffect(() => {
    if (
      selectedOrg &&
      !projectsLoading &&
      projects.length === 0 &&
      !isCreateProjectDialogOpen &&
      !isCreateOrgDialogOpen
    ) {
      setIsCreateProjectDialogOpen(true);
    }
  }, [selectedOrg, projectsLoading, projects.length, isCreateProjectDialogOpen, isCreateOrgDialogOpen]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName) return;

    try {
      setCreating(true);
      const newOrg = await organizationService.createOrganization({
        name: organizationName,
      });

      try {
        await organizationService.installPlugin(
          newOrg.id,
          "document-intelligence"
        );
      } catch (pluginError) {
        console.error("Plugin installation failed:", pluginError);
      }

      setIsCreateOrgDialogOpen(false);
      setOrganizationName("");
      setIsCreateProjectDialogOpen(true);

      await useOrganizationStore.getState().fetchAndSetOrganizations();
      const orgs = useOrganizationStore.getState().organizations;
      const createdOrg = orgs.find((org) => org.id === newOrg.id);
      if (createdOrg) {
        handleOrganizationChange(createdOrg);
      }
    } catch (error) {
      console.error("Organization creation failed:", error);
      alert("Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !selectedOrg) return;

    try {
      setCreating(true);
      const newProject = await projectService.createProject(selectedOrg.id, {
        name: projectName,
        description: projectDescription,
      });

      setIsCreateProjectDialogOpen(false);
      setProjectName("");
      setProjectDescription("");

      await useProjectStore.getState().fetchAndSetProjects(selectedOrg.id);
      const projs = useProjectStore.getState().projects;
      const createdProject = projs.find((p) => p.id === newProject.id);
      if (createdProject) {
        handleProjectChange(createdProject);
      }
    } catch (error) {
      console.error("Project creation failed:", error);
      alert("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!selectedOrg || organizations.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <span className="text-sm font-semibold">...</span>
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-sm font-semibold">
                    {getInitials(selectedOrg.name)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{selectedOrg.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedOrg.plan?.name || "Free"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width]"
              align="start"
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onSelect={() => handleOrganizationChange(org)}
                  className="gap-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
                    <span className="text-xs font-medium">
                      {getInitials(org.name)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm">{org.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {org.plan?.name || "Free"}
                    </span>
                  </div>
                  {org.id === selectedOrg?.id && (
                    <Check className="ml-auto size-4" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setIsCreateOrgDialogOpen(true)}
                className="gap-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Create Organization
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                disabled={projectsLoading}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                  <Folder className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">
                    {projectsLoading
                      ? "Loading..."
                      : selectedProject
                        ? selectedProject.name
                        : "No Project"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedProject
                      ? selectedProject.description || "No description"
                      : "Create a project"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width]"
              align="start"
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Projects
              </DropdownMenuLabel>
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onSelect={() => handleProjectChange(project)}
                  className="gap-2"
                >
                  <Folder className="size-4" />
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm">{project.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {project.description || "No description"}
                    </span>
                  </div>
                  {selectedProject?.id === project.id && (
                    <Check className="ml-auto size-4" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setIsCreateProjectDialogOpen(true)}
                className="gap-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Create Project
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog
        open={isCreateOrgDialogOpen}
        onOpenChange={setIsCreateOrgDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to manage your projects and documents
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrganization} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Enter organization name"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOrgDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateProjectDialogOpen}
        onOpenChange={setIsCreateProjectDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Create a new project in {selectedOrg.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project description (optional)"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateProjectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
