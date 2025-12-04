import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { listAllModels, provisionLLMSubinstance } from "@/lib/llm";
import { ListedLLM } from "@/types/llm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOrganizationStore } from "@/hooks/use-organization";
import { toast } from "sonner";
import { ModelCard } from "@/components/models/ModelCard";
import { ModelsTable } from "@/components/models/ModelsTable";
import { DeployDialog } from "@/components/models/DeployDialog";

export const Route = createFileRoute("/dashboard/_llm/models")({
  loader: () => listAllModels(),
  component: ModelsPage,
});

function ModelsPage() {
  const models = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ListedLLM | null>(null);
  const [deploymentName, setDeploymentName] = useState("");
  const [isDedicated, setIsDedicated] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const { currentOrganization } = useOrganizationStore();
  const pageSize = 12;

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false) ||
        model.model_name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [models, searchQuery]);

  const paginatedModels = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredModels.slice(startIndex, startIndex + pageSize);
  }, [filteredModels, currentPage]);

  const totalPages = Math.ceil(filteredModels.length / pageSize);

  const handleDeployModel = (model: ListedLLM) => {
    setSelectedModel(model);
    setDeploymentName(model.name);
    setIsDedicated(false);
    setDeployDialogOpen(true);
  };

  const handleDeployConfirm = async () => {
    if (!selectedModel || !currentOrganization) {
      toast.error("Please select an organization first");
      return;
    }

    if (!deploymentName.trim()) {
      toast.error("Please provide a name for the deployment");
      return;
    }

    try {
      setIsDeploying(true);
      await provisionLLMSubinstance({
        id: selectedModel.id,
        org_id: currentOrganization.id,
        name: deploymentName.trim(),
        is_dedicated: isDedicated,
      });

      toast.success(`Successfully deployed ${selectedModel.name}`);
      setDeployDialogOpen(false);
      setSelectedModel(null);
      setDeploymentName("");
      setIsDedicated(false);
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        "Failed to deploy model. Please try again.";
      toast.error(message);
      console.error("Failed to deploy model:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Browse Models</h1>
          <p className="text-muted-foreground">
            Explore and deploy AI models from our catalog
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search models by name, description, or model type..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-md"
          />
          <div className="text-sm text-muted-foreground">
            {filteredModels.length} model
            {filteredModels.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {paginatedModels.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No models found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onDeploy={handleDeployModel}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        <ModelsTable models={paginatedModels} />
      </div>

      <DeployDialog
        open={deployDialogOpen}
        onOpenChange={setDeployDialogOpen}
        selectedModel={selectedModel}
        deploymentName={deploymentName}
        setDeploymentName={setDeploymentName}
        isDedicated={isDedicated}
        setIsDedicated={setIsDedicated}
        onConfirm={handleDeployConfirm}
        isDeploying={isDeploying}
      />
    </div>
  );
}
