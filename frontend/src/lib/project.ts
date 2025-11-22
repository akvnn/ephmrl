import apiClient from "@/lib/axios";
import type {
  Project,
  ProjectWithOrganization,
  CreateProjectData,
  UpdateProjectData,
} from "@/types/project";

export const projectService = {
  async fetchProjectsByOrganization(
    organizationId: string
  ): Promise<Project[]> {
    const response = await apiClient.get<Project[]>("/project/me", {
      params: { organization_id: organizationId },
    });
    return response.data;
  },

  async fetchProjectById(
    projectId: string,
    organizationId: string
  ): Promise<ProjectWithOrganization> {
    const response = await apiClient.get<ProjectWithOrganization>(
      `/project/${projectId}`,
      {
        params: { organization_id: organizationId },
      }
    );
    return response.data;
  },

  async createProject(
    organizationId: string,
    data: CreateProjectData
  ): Promise<Project> {
    const response = await apiClient.post<Project>("/project", data, {
      params: { organization_id: organizationId },
    });
    return response.data;
  },

  async updateProject(
    projectId: string,
    organizationId: string,
    data: UpdateProjectData
  ): Promise<Project> {
    const response = await apiClient.put<Project>(
      `/project/${projectId}`,
      data,
      {
        params: { organization_id: organizationId },
      }
    );
    return response.data;
  },
};
