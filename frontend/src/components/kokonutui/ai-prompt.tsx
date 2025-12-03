import type React from "react";

import {
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  Loader2,
  Plug,
  Settings2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import SearchButton from "@/components/chat/search-button";

export interface AIModel {
  id: string;
  name: string;
  model_name: string;
  is_dedicated: boolean;
}

export interface InstalledPlugin {
  plugin_slug: string;
  status: string; // "enabled" or "disabled"
  created_at: string;
  enabled: boolean; // computed from status
}

export interface AIPromptProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  models: AIModel[];
  selectedModelId: string | null;
  onModelChange: (modelId: string) => void;
  plugins?: InstalledPlugin[];
  selectedPlugins?: string[];
  onPluginChange?: (pluginSlugs: string[]) => void;
  selectedTools?: string[];
  onToolChange?: (tools: string[]) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  isConnected?: boolean;
  isLoadingModels?: boolean;
  placeholder?: string;
}

export default function AI_Prompt({
  value,
  onChange,
  onSend,
  models,
  selectedModelId,
  onModelChange,
  plugins = [],
  selectedPlugins = [],
  onPluginChange = () => {},
  selectedTools = [],
  onToolChange = () => {},
  disabled = false,
  isStreaming = false,
  isConnected = false,
  isLoadingModels = false,
  placeholder = "Message...",
}: AIPromptProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 300,
  });

  const [showPluginSettings, setShowPluginSettings] = useState(false);
  const pluginPanelRef = useRef<HTMLDivElement>(null);

  const selectedModel = models.find((m) => m.id === selectedModelId);
  const enabledPlugins = plugins.filter((p) => p.enabled);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pluginPanelRef.current &&
        !pluginPanelRef.current.contains(event.target as Node)
      ) {
        setShowPluginSettings(false);
      }
    };

    if (showPluginSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPluginSettings]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && isConnected && !isStreaming) {
        onSend();
        adjustHeight(true);
      }
    }
  };

  const handleSend = () => {
    if (value.trim() && isConnected && !isStreaming) {
      onSend();
      adjustHeight(true);
    }
  };

  const togglePlugin = (pluginSlug: string) => {
    const newPlugins = selectedPlugins.includes(pluginSlug)
      ? selectedPlugins.filter((p) => p !== pluginSlug)
      : [...selectedPlugins, pluginSlug];
    onPluginChange(newPlugins);
  };

  return (
    <div className="w-full relative">
      {/* Main Container */}
      <div className="rounded-2xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="relative">
          {/* Textarea Section */}
          <div
            className="relative overflow-y-auto rounded-t-2xl"
            style={{ maxHeight: "400px" }}
          >
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || !isConnected}
              className={cn(
                "w-full resize-none border-none bg-background px-5 py-4 rounded-t-2xl",
                "text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "min-h-[72px] max-h-96",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/20"
              )}
            />

            {/* Send Button */}
            <button
              aria-label="Send message"
              onClick={handleSend}
              disabled={!value.trim() || !isConnected || isStreaming}
              className={cn(
                "absolute top-0 translate-y-1/2 right-4 rounded-lg p-2.5 transition-all duration-150",
                "border border-border/60 bg-background hover:bg-muted/60",
                "focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:opacity-30 disabled:cursor-not-allowed hover:disabled:bg-background hover:disabled:border-border/60",
                "hover:border-border/80 active:scale-95"
              )}
              type="button"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary dark:text-accent" />
              ) : (
                <ArrowUp
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    value.trim() && isConnected
                      ? "text-primary dark:text-accent"
                      : "text-muted-foreground/50"
                  )}
                />
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Control Bar */}
          <div className="flex flex-col gap-3 px-5 py-3 bg-muted/40 rounded-b-2xl">
            {/* Controls Row */}
            <div className="flex h-10 items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                {/* Model Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium",
                        "bg-background hover:bg-muted/60 border border-border/60",
                        "transition-all duration-150 hover:border-border/80",
                        "focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      variant="ghost"
                      disabled={models.length === 0 || isLoadingModels}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2"
                          exit={{ opacity: 0, y: 5 }}
                          initial={{ opacity: 0, y: -5 }}
                          key={selectedModelId || "empty"}
                          transition={{ duration: 0.15 }}
                        >
                          <Bot className="h-4 w-4 text-muted-foreground/60" />
                          <span className="max-w-[100px] truncate text-foreground text-xs">
                            {isLoadingModels
                              ? "Loading..."
                              : selectedModel?.name || "Select model"}
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                        </motion.div>
                      </AnimatePresence>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className={cn(
                      "min-w-56",
                      "border-border/60",
                      "bg-background shadow-md"
                    )}
                  >
                    {models.length === 0 ? (
                      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                        No models available
                      </div>
                    ) : (
                      models.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onSelect={() => onModelChange(model.id)}
                          className={cn(
                            "flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer text-xs",
                            "hover:bg-muted/60 focus:bg-muted/60 rounded-md transition-colors",
                            selectedModelId === model.id && "bg-muted/70"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Bot className="h-3.5 w-3.5 text-muted-foreground/50" />
                            <span className="font-medium">{model.name}</span>
                          </div>
                          {selectedModelId === model.id && (
                            <Check className="h-3.5 w-3.5 text-accent" />
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Divider */}
                <div className="h-4 w-px bg-border/40" />

                {/* Search Button */}
                <SearchButton
                  isActive={selectedTools.includes("web_search")}
                  onToggle={(active) => {
                    const newTools = active
                      ? [...selectedTools, "web_search"]
                      : selectedTools.filter((t) => t !== "web_search");
                    onToolChange(newTools);
                  }}
                />

                {/* Divider */}
                <div className="h-4 w-px bg-border/40" />

                {/* Plugin Settings Icon */}
                <div className="relative" ref={pluginPanelRef}>
                  <Button
                    onClick={() => setShowPluginSettings(!showPluginSettings)}
                    className={cn(
                      "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium",
                      "bg-background hover:bg-muted/60 border border-border/60",
                      "transition-all duration-150 hover:border-border/80",
                      "focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      showPluginSettings && "border-accent/40 bg-accent/5",
                      selectedPlugins.length > 0 &&
                        "border-accent/40 bg-accent/5"
                    )}
                    variant="ghost"
                  >
                    <Settings2
                      className={cn(
                        "h-4 w-4 transition-colors duration-150",
                        selectedPlugins.length > 0
                          ? "text-primary dark:text-accent"
                          : "text-muted-foreground"
                      )}
                    />
                  </Button>

                  {/* Plugin Settings Panel */}
                  <AnimatePresence>
                    {showPluginSettings && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className="absolute bottom-full left-0 mb-2 w-56 rounded-lg border border-border/60 bg-background shadow-lg"
                      >
                        <div className="p-3 border-b border-border/40">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Plugins
                          </p>
                        </div>

                        <div className="max-h-72 overflow-y-auto">
                          {enabledPlugins.length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                              No plugins installed
                            </div>
                          ) : (
                            enabledPlugins.map((plugin) => (
                              <button
                                key={plugin.plugin_slug}
                                onClick={() => togglePlugin(plugin.plugin_slug)}
                                className={cn(
                                  "w-full flex items-center justify-between gap-3 px-4 py-3 text-xs",
                                  "hover:bg-muted/60 transition-colors border-b border-border/20 last:border-b-0",
                                  "cursor-pointer group"
                                )}
                              >
                                <div className="flex items-center gap-2.5 flex-1">
                                  <Plug className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors" />
                                  <span className="font-medium text-foreground group-hover:text-foreground/90 transition-colors">
                                    {plugin.plugin_slug}
                                  </span>
                                </div>

                                {/* Toggle Switch */}
                                <motion.div
                                  className={cn(
                                    "h-5 w-9 rounded-full border-2 transition-all duration-200 flex items-center",
                                    selectedPlugins.includes(plugin.plugin_slug)
                                      ? "bg-accent border-accent"
                                      : "bg-background border-border/60 hover:border-border/80"
                                  )}
                                  layout
                                >
                                  <motion.div
                                    initial={false}
                                    animate={{
                                      x: selectedPlugins.includes(
                                        plugin.plugin_slug
                                      )
                                        ? 16
                                        : 2,
                                    }}
                                    transition={{
                                      duration: 0.2,
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 30,
                                    }}
                                    className="h-3.5 w-3.5 rounded-full bg-white"
                                  />
                                </motion.div>
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                {/* Connection Status */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold",
                    isConnected
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full animate-pulse",
                      isConnected ? "bg-emerald-500" : "bg-rose-500"
                    )}
                  />
                  {isConnected ? "Ready" : "Offline"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
