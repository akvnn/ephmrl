import { ListedLLM } from "@/types/llm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DeployDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel: ListedLLM | null;
  deploymentName: string;
  setDeploymentName: (name: string) => void;
  isDedicated: boolean;
  setIsDedicated: (dedicated: boolean) => void;
  onConfirm: () => void;
  isDeploying: boolean;
}

export function DeployDialog({
  open,
  onOpenChange,
  selectedModel,
  deploymentName,
  setDeploymentName,
  isDedicated,
  setIsDedicated,
  onConfirm,
  isDeploying,
}: DeployDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deploy Model</DialogTitle>
          <DialogDescription>
            Configure and deploy {selectedModel?.name} to your organization
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="deployment-name">Deployment Name</Label>
            <Input
              id="deployment-name"
              value={deploymentName}
              onChange={(e) => setDeploymentName(e.target.value)}
              placeholder="Enter a name for this deployment"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-dedicated"
              checked={isDedicated}
              onChange={(e) => setIsDedicated(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is-dedicated" className="cursor-pointer">
              Dedicated Instance (Higher cost, exclusive resources)
            </Label>
          </div>

          {selectedModel && (
            <div className="rounded-lg border p-4 text-sm">
              <div className="mb-2 font-medium">Model Details</div>
              <div className="space-y-1 text-muted-foreground">
                <div>Model: {selectedModel.model_name}</div>
                <div>Slug: {selectedModel.slug}</div>
                {selectedModel.base_config?.parameters && (
                  <div>Parameters: {selectedModel.base_config.parameters}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeploying}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isDeploying}>
            {isDeploying ? "Deploying..." : "Deploy Model"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
