export interface ListedLLM {
  id: string;
  name: string;
  model_name: string;
  slug: string;
  base_config: Record<string, any>;
  description?: string;
}

export interface LLMInstance {
  id: string;
  name: string;
  model_name: string;
  model_type: string;
  base_config: Record<string, any>;
  status: string;
  maximum_tenants: number;
  listed_llm_id: string;
  created_at: string;
  deleted_at?: string;
  listed_llm?: ListedLLM;
}

export interface LLMSubinstance {
  id: string;
  org_id: string;
  name: string;
  is_dedicated: boolean;
  created_at: string;
}

export interface LLMSubinstanceCreate {
  id: string; // listed_llm_id
  org_id: string;
  name: string;
  is_dedicated?: boolean;
}

export interface LLMSubinstanceParams {
  id: string;
  organization_id: string;
}

export interface ListLLMSubinstancesParams {
  organization_id: string;
  skip?: number;
  limit?: number;
}
