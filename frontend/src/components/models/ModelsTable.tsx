import { ListedLLM } from "@/types/llm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ModelsTable({ models }: { models: ListedLLM[] }) {
  return (
    <div className="mt-12">
      <h2 className="mb-4 text-xl font-semibold">Model Details</h2>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Model Type</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parameters</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.id}>
                <TableCell className="font-medium">{model.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    {model.model_name}
                  </code>
                </TableCell>
                <TableCell>
                  <code className="text-xs">{model.slug}</code>
                </TableCell>
                <TableCell className="text-sm">
                  {model.base_config?.parameters || "N/A"}
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {model.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
