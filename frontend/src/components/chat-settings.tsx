import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useOrganizationStore } from "@/hooks/use-organization";
import { usePluginStore } from "@/hooks/use-plugin";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import apiClient from "@/lib/axios";

interface ChatSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModelId: string | null;
  onSelectModel: (modelId: string) => void;
  isConnected: boolean;
  onDisconnect: () => void;
}

interface LLMModel {
  id: string;
  name: string;
  model_name: string;
  is_dedicated: boolean;
}

export function ChatSettings({
  open,
  onOpenChange,
  selectedModelId,
  onSelectModel,
  isConnected,
  onDisconnect,
}: ChatSettingsProps) {
  const { currentOrganization } = useOrganizationStore();
  const {
    installedPlugins,
    selectedPlugin,
    setSelectedPlugin,
    fetchAndSetInstalledPlugins,
  } = usePluginStore();

  const [models, setModels] = useState<LLMModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingPlugins, setLoadingPlugins] = useState(false);

  useEffect(() => {
    if (open && currentOrganization) {
      fetchModels();
      fetchPlugins();
    }
  }, [open, currentOrganization]);

  const fetchModels = async () => {
    if (!currentOrganization) return;

    setLoadingModels(true);
    try {
      const response = await apiClient.get(
        `/llm/models/my/all?organization_id=${currentOrganization.id}`
      );

      setModels(response.data);
    } catch (error) {
      console.error("Failed to fetch models:", error);
      toast.error("Failed to load models");
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchPlugins = async () => {
    if (!currentOrganization) return;

    setLoadingPlugins(true);
    try {
      await fetchAndSetInstalledPlugins(currentOrganization.id);
    } catch (error) {
      console.error("Failed to fetch plugins:", error);
    } finally {
      setLoadingPlugins(false);
    }
  };

  const handlePluginToggle = (pluginSlug: string, enabled: boolean) => {
    if (enabled) {
      setSelectedPlugin(pluginSlug);
      toast.success(`${pluginSlug} plugin enabled for RAG`);
    } else {
      if (selectedPlugin === pluginSlug) {
        setSelectedPlugin(null);
        toast.success("RAG plugin disabled");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription>
            Configure your AI model and RAG plugins
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>AI Model</Label>
            {loadingModels ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <Select
                  value={selectedModelId || ""}
                  onValueChange={onSelectModel}
                  disabled={isConnected}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No models available
                      </div>
                    ) : (
                      models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.model_name})
                          {model.is_dedicated && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              Dedicated
                            </span>
                          )}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {isConnected && (
                  <p className="text-xs text-muted-foreground">
                    Disconnect to change model
                  </p>
                )}
              </>
            )}
          </div>

          {isConnected && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          )}

          <Separator />

          <div className="space-y-4">
            <div>
              <Label>RAG Plugins</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Enable plugins to augment AI responses with your data
              </p>
            </div>

            {loadingPlugins ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : installedPlugins.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No plugins installed
              </div>
            ) : (
              <div className="space-y-3">
                {installedPlugins
                  .filter((plugin) => plugin.enabled)
                  .map((plugin) => (
                    <div
                      key={plugin.plugin_slug}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{plugin.plugin_slug}</p>
                        <p className="text-xs text-muted-foreground">
                          Installed{" "}
                          {new Date(plugin.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {/*TODO: Fix Switch typing*/}
                      <Switch
                        checked={selectedPlugin === plugin.plugin_slug}
                        onCheckedChange={(checked: any) =>
                          handlePluginToggle(plugin.plugin_slug, checked)
                        }
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
