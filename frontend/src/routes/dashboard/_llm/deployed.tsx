import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { listLLMSubinstances, deprovisionLLMSubinstance } from "@/lib/llm";
import type { LLMSubinstance } from "@/types/llm";
import { useOrganizationStore } from "@/hooks/use-organization";
import { toast } from "sonner";
import { DeploymentsTable } from "@/components/deployed/DeploymentsTable";
import { DeploymentsSummary } from "@/components/deployed/DeploymentsSummary";
import { DeprovisionDialog } from "@/components/deployed/DeprovisionDialog";
import { Server, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/_llm/deployed")({
  loader: ({ context }) => {
    const org = context.getOrganization();
    if (!org?.id) return [];
    return listLLMSubinstances({ organization_id: org.id }).catch(() => []);
  },
  component: DeployedModelsPage,
});

function DeployedModelsPage() {
  const router = useRouter();
  const { currentOrganization } = useOrganizationStore();
  const deployments = Route.useLoaderData();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] =
    useState<LLMSubinstance | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (deployment: LLMSubinstance) => {
    setSelectedDeployment(deployment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeployment || !currentOrganization?.id) return;

    try {
      setIsDeleting(true);
      await deprovisionLLMSubinstance({
        id: selectedDeployment.id,
        organization_id: currentOrganization.id,
      });

      toast.success(`Successfully deprovisioned ${selectedDeployment.name}`);
      setDeleteDialogOpen(false);
      setSelectedDeployment(null);

      router.invalidate();
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        "Failed to deprovision model. Please try again.";
      toast.error(message);
      console.error("Failed to deprovision model:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentOrganization) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="px-4">
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">
              Please select an organization to view deployed models
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Deployed Models</h1>
          <p className="text-muted-foreground">
            Manage your organization's deployed LLM instances
          </p>
        </div>

        {deployments.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="flex flex-col items-center gap-4 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Server className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight">
                  No models deployed yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Deploy your first LLM instance to start using AI capabilities
                  in your organization.
                </p>
              </div>
              <Button asChild className="mt-2">
                <Link to="/dashboard/models">
                  Browse Models
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <DeploymentsTable
            deployments={deployments}
            onDeleteClick={handleDeleteClick}
          />
        )}

        {deployments.length > 0 && (
          <DeploymentsSummary deployments={deployments} />
        )}
      </div>

      <DeprovisionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        selectedDeployment={selectedDeployment}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
