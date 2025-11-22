import type { LLMSubinstance } from "@/types/llm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DeploymentsTableProps {
  deployments: LLMSubinstance[];
  onDeleteClick: (deployment: LLMSubinstance) => void;
}

export function DeploymentsTable({
  deployments,
  onDeleteClick,
}: DeploymentsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cost/Hour</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.map((deployment) => (
            <TableRow key={deployment.id}>
              <TableCell className="font-medium">{deployment.name}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-sm">
                    {deployment.llm_instance?.listed_llm?.name ||
                      deployment.llm_instance?.name ||
                      "Unknown"}
                  </span>
                  <code className="text-xs text-muted-foreground">
                    {deployment.llm_instance?.model_name || "N/A"}
                  </code>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={deployment.is_dedicated ? "default" : "secondary"}
                >
                  {deployment.is_dedicated ? "Dedicated" : "Shared"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    deployment.llm_instance?.status === "active"
                      ? "default"
                      : "secondary"
                  }
                >
                  {deployment.llm_instance?.status || "Unknown"}
                </Badge>
              </TableCell>
              <TableCell>{deployment.credit_price_per_hour} credits</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(deployment.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteClick(deployment)}
                  >
                    Deprovision
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
