export interface Project {
  id: string;
  org_id: string;
  user_id: string;
  name: string;
  description?: string;
  additional_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ProjectWithOrganization extends Project {
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  additional_metadata?: Record<string, any>;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  additional_metadata?: Record<string, any>;
}
