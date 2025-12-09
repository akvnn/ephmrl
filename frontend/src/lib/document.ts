import { apiClient } from "./axios";

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
  plugin_slug: string;
  organization_id: string;
  project_id?: string;
  page?: number;
  per_page?: number;
}

export const listDocuments = async (
  params: ListDocumentsParams
): Promise<DocumentPaginationResponse> => {
  const response = await apiClient.get<DocumentPaginationResponse>(
    `/plugins/${params.plugin_slug}/recent_documents_info`,
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
  plugin_slug: string,
  organization_id: string
): Promise<number> => {
  const response = await listDocuments({
    plugin_slug,
    organization_id,
    page: 1,
    per_page: 1,
  });
  return response.total_count ?? 0;
};
