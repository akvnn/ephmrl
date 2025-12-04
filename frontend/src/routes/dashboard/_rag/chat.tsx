import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, User, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrganizationStore } from "@/hooks/use-organization";
import { useProjectStore } from "@/hooks/use-project";
import { usePluginStore } from "@/hooks/use-plugin";
import { toast } from "sonner";
import apiClient from "@/lib/axios";
import AI_Prompt, { type AIModel } from "@/components/kokonutui/ai-prompt";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/dashboard/_rag/chat")({
  loader: ({ context }) => {
    const org = context.getOrganization();
    if (!org?.id) return { models: [] };
    return apiClient
      .get(`/llm/models/my/all?organization_id=${org.id}`)
      .then((res) => ({ models: res.data }));
  },
  component: ChatPage,
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function ChatPage() {
  const { currentOrganization } = useOrganizationStore();
  const { currentProject } = useProjectStore();
  const { installedPlugins, fetchAndSetInstalledPlugins } = usePluginStore();
  const { models: preloadedModels } = Route.useLoaderData();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [models, setModels] = useState<AIModel[]>(preloadedModels);
  const [isLoadingModels, setIsLoadingModels] = useState(
    preloadedModels.length === 0
  );
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentMessageRef = useRef<string>("");

  const fetchModelsAndConnect = useCallback(async () => {
    if (!currentOrganization) return;

    setIsLoadingModels(true);
    try {
      const response = await apiClient.get(
        `/llm/models/my/all?organization_id=${currentOrganization.id}`
      );

      const fetchedModels = response.data;
      setModels(fetchedModels);

      if (fetchedModels.length > 0 && !isConnected) {
        const modelToConnect = selectedModelId || fetchedModels[0].id;
        setSelectedModelId(modelToConnect);
        connectWebSocket(modelToConnect);
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
    } finally {
      setIsLoadingModels(false);
    }
  }, [currentOrganization, isConnected, selectedModelId]);

  useEffect(() => {
    setMessages([]);
    fetchModelsAndConnect();

    if (currentOrganization?.id) {
      fetchAndSetInstalledPlugins(currentOrganization.id);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentOrganization?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const connectWebSocket = (modelId: string) => {
    if (!currentOrganization) {
      toast.error("Please select an organization");
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
    const wsHost = apiUrl.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}://${wsHost}/inference/${modelId}/chat?organization_id=${currentOrganization.id}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      toast.success("Connected to AI");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "token") {
          currentMessageRef.current += data.content;

          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];

            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content = currentMessageRef.current;
            } else {
              newMessages.push({
                id: Date.now().toString(),
                role: "assistant",
                content: currentMessageRef.current,
                timestamp: new Date(),
              });
            }

            return newMessages;
          });
        } else if (data.type === "done") {
          console.log("Stream complete");
          setIsStreaming(false);
          currentMessageRef.current = "";
        } else if (data.type === "error") {
          console.error("Stream error:", data.message);
          toast.error(data.message);
          setIsStreaming(false);
          currentMessageRef.current = "";
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Connection error");
      setIsConnected(false);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      setIsStreaming(false);
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  const handleModelChange = (modelId: string) => {
    if (modelId === selectedModelId) return;

    disconnectWebSocket();
    setSelectedModelId(modelId);
    connectWebSocket(modelId);
  };

  const sendMessage = async () => {
    if (!input.trim() || !isConnected || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    currentMessageRef.current = "";

    const payload = {
      prompt: userMessage.content,
      plugin_slug: selectedPlugins.length > 0 ? selectedPlugins[0] : undefined,
      tools: selectedTools.length > 0 ? selectedTools : undefined,
      project_id: currentProject?.id || undefined,
      plugin_chunks_limit: 3,
      max_tokens: 2000,
      temperature: 0.7,
    };

    wsRef.current?.send(JSON.stringify(payload));
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <p className="text-sm text-muted-foreground">
          Chat with AI using your connected models
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Start a conversation</p>
              <p className="text-sm mt-2">
                Select a model and optionally enable RAG with a plugin
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === "assistant" && (
                    <Bot className="h-5 w-5 mt-0.5 shrink-0" />
                  )}
                  {message.role === "user" && (
                    <User className="h-5 w-5 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    {message.role === "assistant" ? (
                      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))}

          {isStreaming &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] p-4 bg-muted">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </Card>
              </div>
            )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="max-w-3xl mx-auto">
          <AI_Prompt
            value={input}
            onChange={setInput}
            onSend={() => {
              sendMessage();
              setInput("");
            }}
            models={models}
            selectedModelId={selectedModelId}
            onModelChange={handleModelChange}
            plugins={installedPlugins}
            selectedPlugins={selectedPlugins}
            onPluginChange={setSelectedPlugins}
            selectedTools={selectedTools}
            onToolChange={setSelectedTools}
            isConnected={isConnected}
            isStreaming={isStreaming}
            isLoadingModels={isLoadingModels}
            placeholder={
              isConnected
                ? "Type your message..."
                : isLoadingModels
                  ? "Loading models..."
                  : "Select a model to connect..."
            }
          />
        </div>
      </div>
    </div>
  );
}
