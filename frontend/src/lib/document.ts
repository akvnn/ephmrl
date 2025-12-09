import axios from "axios";
import { getConfigSync } from "./config";

const documentClient = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

documentClient.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getConfigSync()?.documentApiUrl || "http://localhost:8001";
  }
  return config;
});

export interface DocumentInfo {
  id: string;
  document_uploaded_name: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DocumentPaginationResponse {
  items: DocumentInfo[];
  total_count: number | null;
  page: number | null;
  per_page: number | null;
  total_pages: number | null;
  has_next: boolean | null;
  has_previous: boolean | null;
}

export interface ListDocumentsParams {
  organization_id: string;
  project_id?: string;
  page?: number;
  per_page?: number;
}

export const listDocuments = async (
  params: ListDocumentsParams
): Promise<DocumentPaginationResponse> => {
  const response = await documentClient.get<DocumentPaginationResponse>(
    "/recent_documents_info",
    {
      params: {
        organization_id: params.organization_id,
        project_id: params.project_id,
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
      },
    }
  );
  return response.data;
};

export const getDocumentCount = async (
  organization_id: string
): Promise<number> => {
  const response = await listDocuments({
    organization_id,
    page: 1,
    per_page: 1,
  });
  return response.total_count ?? 0;
};
