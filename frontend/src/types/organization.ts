export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billing_cycle: string;
  features?: Record<string, any>;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan_id: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface OrganizationMember {
  user_id: string;
  org_id: string;
  joined_at: string;
  invited_by?: string;
}

export interface OrganizationWithMembers extends Organization {
  members: OrganizationMember[];
}

export interface CreateOrganizationData {
  name: string;
  slug?: string;
}
