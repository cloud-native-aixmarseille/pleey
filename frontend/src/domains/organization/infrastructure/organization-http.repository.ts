import { API_URL } from '../../../shared/config/api.config';
import { Organization, OrganizationDashboard, OrganizationMember } from '../../../shared/types';
import { IOrganizationRepository } from '../ports/organization.repository.interface';

/**
 * Organization HTTP Repository
 * Implements organization data operations via HTTP
 */
export class OrganizationHttpRepository implements IOrganizationRepository {
  async getMyOrganizations(token: string): Promise<Organization[]> {
    const response = await fetch(`${API_URL}/api/organizations/my-organizations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('organization.errors.fetchFailed');
    }
    
    const data = await response.json();
    return data.organizations || [];
  }

  async createOrganization(
    token: string,
    name: string,
    description?: string
  ): Promise<Organization> {
    const response = await fetch(`${API_URL}/api/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      throw new Error('organization.errors.createFailed');
    }

    return await response.json();
  }

  async getOrganizationDashboard(
    token: string,
    organizationId: number
  ): Promise<OrganizationDashboard> {
    const response = await fetch(
      `${API_URL}/api/organizations/${organizationId}/dashboard`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error('organization.errors.dashboardFailed');
    }

    return await response.json();
  }

  async addMember(
    token: string,
    organizationId: number,
    userId: number,
    role: 'owner' | 'admin' | 'member'
  ): Promise<OrganizationMember> {
    const response = await fetch(
      `${API_URL}/api/organizations/${organizationId}/members`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role }),
      }
    );

    if (!response.ok) {
      throw new Error('organization.errors.addMemberFailed');
    }

    return await response.json();
  }

  async removeMember(token: string, memberId: number): Promise<void> {
    const response = await fetch(
      `${API_URL}/api/organizations/members/${memberId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error('organization.errors.removeMemberFailed');
    }
  }
}

export const organizationRepository = new OrganizationHttpRepository();
