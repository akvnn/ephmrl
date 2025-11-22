import { ListedLLM } from "@/types/llm";
import { Button } from "@/components/ui/button";

export function ModelCard({
  model,
  onDeploy,
}: {
  model: ListedLLM;
  onDeploy: (model: ListedLLM) => void;
}) {
  const parameters = model.base_config?.parameters;
  const maxTokens = model.base_config?.max_tokens;

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4">
        <h3 className="mb-1 text-lg font-semibold">{model.name}</h3>
        <p className="text-xs text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5">
            {model.model_name}
          </code>
        </p>
      </div>

      <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
        {model.description || "No description available"}
      </p>

      <div className="mb-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Slug:</span>
          <code className="font-mono">{model.slug}</code>
        </div>
        {parameters && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Parameters:</span>
            <span className="font-medium">{parameters}</span>
          </div>
        )}
        {maxTokens && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Max Tokens:</span>
            <span>{maxTokens.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          className="flex-1 cursor-pointer"
          size="sm"
          onClick={() => onDeploy(model)}
        >
          Deploy Model
        </Button>
        <Button variant="outline" size="sm" className="cursor-pointer">
          Details
        </Button>
      </div>
    </div>
  );
}
