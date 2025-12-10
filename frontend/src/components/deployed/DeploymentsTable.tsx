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
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.map((deployment) => (
            <TableRow key={deployment.id}>
              <TableCell className="font-medium">{deployment.name}</TableCell>
              <TableCell>
                <Badge
                  variant={deployment.is_dedicated ? "default" : "secondary"}
                >
                  {deployment.is_dedicated ? "Dedicated" : "Shared"}
                </Badge>
              </TableCell>
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
