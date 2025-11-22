import type { LLMSubinstance } from "@/types/llm";

interface DeploymentsSummaryProps {
  deployments: LLMSubinstance[];
}

export function DeploymentsSummary({
  deployments,
}: DeploymentsSummaryProps) {
  return (
    <div className="mt-6 rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">Summary</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Deployments</p>
          <p className="text-2xl font-bold">{deployments.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Dedicated Instances</p>
          <p className="text-2xl font-bold">
            {deployments.filter((d) => d.is_dedicated).length}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Shared Instances</p>
          <p className="text-2xl font-bold">
            {deployments.filter((d) => !d.is_dedicated).length}
          </p>
        </div>
      </div>
    </div>
  );
}
