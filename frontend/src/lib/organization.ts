import apiClient from "@/lib/axios";
import type {
  Organization,
  OrganizationWithMembers,
  CreateOrganizationData,
} from "@/types/organization";

export const organizationService = {
  async fetchUserOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<Organization[]>(
      "/organization/me/all"
    );
    return response.data;
  },

  async fetchOrganizationById(organizationId: string): Promise<Organization> {
    const response = await apiClient.get<Organization>("/organization/me", {
      params: { organization_id: organizationId },
    });
    return response.data;
  },

  async fetchOrganizationWithMembers(
    organizationId: string
  ): Promise<OrganizationWithMembers> {
    const response = await apiClient.get<OrganizationWithMembers>(
      "/organization/members",
      {
        params: { organization_id: organizationId },
      }
    );
    return response.data;
  },

  async createOrganization(
    data: CreateOrganizationData
  ): Promise<Organization> {
    const response = await apiClient.post<Organization>("/organization", data);
    return response.data;
  },
};
