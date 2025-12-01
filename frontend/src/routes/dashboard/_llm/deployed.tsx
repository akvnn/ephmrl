import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { listLLMSubinstances, deprovisionLLMSubinstance } from "@/lib/llm";
import type { LLMSubinstance } from "@/types/llm";
import { useOrganizationStore } from "@/hooks/use-organization";
import { toast } from "sonner";
import { DeploymentsTable } from "@/components/deployed/DeploymentsTable";
import { DeploymentsSummary } from "@/components/deployed/DeploymentsSummary";
import { DeprovisionDialog } from "@/components/deployed/DeprovisionDialog";

export const Route = createFileRoute("/dashboard/_llm/deployed")({
  component: DeployedModelsPage,
});

function DeployedModelsPage() {
  const { currentOrganization } = useOrganizationStore();
  const [deployments, setDeployments] = useState<LLMSubinstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] =
    useState<LLMSubinstance | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDeployments = async () => {
    if (!currentOrganization?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await listLLMSubinstances({
        organization_id: currentOrganization.id,
      });
      setDeployments(data);
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        "Failed to fetch deployments. Please try again.";
      toast.error(message);
      console.error("Failed to fetch deployments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, [currentOrganization?.id]);

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

      // Refresh the list
      await fetchDeployments();
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

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-muted-foreground">Loading deployments...</div>
          </div>
        ) : deployments.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No models deployed yet</p>
              <p className="text-sm text-muted-foreground">
                Visit Browse Models to deploy your first model
              </p>
            </div>
          </div>
        ) : (
          <DeploymentsTable
            deployments={deployments}
            onDeleteClick={handleDeleteClick}
          />
        )}

        {!isLoading && deployments.length > 0 && (
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
