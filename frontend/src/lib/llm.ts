import apiClient from "./axios";
import type {
  LLMSubinstance,
  LLMSubinstanceCreate,
  LLMSubinstanceParams,
  ListLLMSubinstancesParams,
  ListedLLM,
} from "../types/llm";

export const provisionLLMSubinstance = async (
  data: LLMSubinstanceCreate
): Promise<LLMSubinstance> => {
  const response = await apiClient.post<LLMSubinstance>("/llm/provision", data);
  return response.data;
};

export const listLLMSubinstances = async (
  params: ListLLMSubinstancesParams
): Promise<LLMSubinstance[]> => {
  const response = await apiClient.get<LLMSubinstance[]>("/llm/models/my/all", {
    params: {
      organization_id: params.organization_id,
      skip: params.skip ?? 0,
      limit: params.limit ?? 100,
    },
  });
  return response.data;
};

export const getLLMSubinstance = async (
  params: LLMSubinstanceParams
): Promise<LLMSubinstance> => {
  const response = await apiClient.get<LLMSubinstance>("/llm/models/my", {
    params: {
      id: params.id,
      organization_id: params.organization_id,
    },
  });
  return response.data;
};

export const deprovisionLLMSubinstance = async (
  params: LLMSubinstanceParams
): Promise<void> => {
  await apiClient.post("/llm/deprovision", null, {
    params: {
      id: params.id,
      organization_id: params.organization_id,
    },
  });
};

export const listAllModels = async (params?: {
  skip?: number;
  limit?: number;
}): Promise<ListedLLM[]> => {
  const response = await apiClient.get<ListedLLM[]>("/listed/models/all", {
    params: {
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 100,
    },
  });
  return response.data;
};
