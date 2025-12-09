import { Bot, Check, ChevronDown, Plug, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface AIModel {
  id: string;
  name: string;
  model_name: string;
  is_dedicated: boolean;
}

export interface InstalledPlugin {
  org_id: string;
  plugin_slug: string;
  enabled: boolean;
  installed_at: string;
}

export interface ChatControlPanelProps {
  models: AIModel[];
  selectedModelId: string | null;
  onModelChange: (modelId: string) => void;
  plugins?: InstalledPlugin[];
  selectedPlugin: string | null;
  onPluginChange: (pluginSlug: string | null) => void;
  isConnected?: boolean;
  isLoadingModels?: boolean;
}

export function ChatControlPanel({
  models,
  selectedModelId,
  onModelChange,
  plugins = [],
  selectedPlugin,
  onPluginChange,
  isConnected = false,
  isLoadingModels = false,
}: ChatControlPanelProps) {
  const selectedModel = models.find((m) => m.id === selectedModelId);
  const enabledPlugins = plugins.filter((p) => p.enabled);

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 hover:bg-background/80"
              disabled={models.length === 0 || isLoadingModels}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                  exit={{ opacity: 0, scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  key={selectedModelId}
                  transition={{ duration: 0.15 }}
                >
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <span className="max-w-[140px] truncate text-sm font-medium">
                    {isLoadingModels
                      ? "Loading..."
                      : selectedModel?.name || "Select model"}
                  </span>
                </motion.div>
              </AnimatePresence>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {models.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No models available
              </div>
            ) : (
              models.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onSelect={() => onModelChange(model.id)}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.model_name}
                      </span>
                    </div>
                  </div>
                  {selectedModelId === model.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-px bg-border/50" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-2 hover:bg-background/80",
                selectedPlugin && "text-primary"
              )}
            >
              <Plug
                className={cn(
                  "h-4 w-4",
                  selectedPlugin ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className="max-w-[120px] truncate text-sm font-medium">
                {selectedPlugin || "No RAG"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuItem
              onSelect={() => onPluginChange(null)}
              className="flex items-center justify-between py-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">No RAG</span>
                  <span className="text-xs text-muted-foreground">
                    Direct LLM response
                  </span>
                </div>
              </div>
              {!selectedPlugin && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>

            {enabledPlugins.length > 0 && <DropdownMenuSeparator />}

            {enabledPlugins.map((plugin) => (
              <DropdownMenuItem
                key={plugin.plugin_slug}
                onSelect={() => onPluginChange(plugin.plugin_slug)}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Plug className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {plugin.plugin_slug}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      RAG enabled
                    </span>
                  </div>
                </div>
                {selectedPlugin === plugin.plugin_slug && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}

            {enabledPlugins.length === 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                  No plugins installed.
                  <br />
                  Install plugins from the marketplace.
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          isConnected
            ? "bg-green-500/10 text-green-600 dark:text-green-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        )}
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
          )}
        />
        {isConnected ? "Connected" : "Disconnected"}
      </div>
    </div>
  );
}
