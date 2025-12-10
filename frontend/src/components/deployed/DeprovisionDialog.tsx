import type { LLMSubinstance } from "@/types/llm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeprovisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDeployment: LLMSubinstance | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeprovisionDialog({
  open,
  onOpenChange,
  selectedDeployment,
  onConfirm,
  isDeleting,
}: DeprovisionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deprovision Model</DialogTitle>
          <DialogDescription>
            Are you sure you want to deprovision{" "}
            <span className="font-semibold">{selectedDeployment?.name}</span>?
            This action will remove the model from your organization.
          </DialogDescription>
        </DialogHeader>

        {selectedDeployment && (
          <div className="rounded-lg border p-4 text-sm">
            <div className="mb-2 font-medium">Deployment Details</div>
            <div className="space-y-1 text-muted-foreground">
              <div>Name: {selectedDeployment.name}</div>
              <div>
                Type: {selectedDeployment.is_dedicated ? "Dedicated" : "Shared"}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deprovisioning..." : "Deprovision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
