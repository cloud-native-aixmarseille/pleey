import type {
  Organization,
  OrganizationDashboard,
  OrganizationMember,
} from "../../domains/organization/types";
import { OrganizationRepository } from "../../domains/organization/ports/organization.repository";
import {
  apiClient,
  fetchClient,
  queryClient,
} from "../shared/http/api/openapiClient";
import { castRequestBody } from "../shared/http/api/castRequestBody";

/**
 * Organization HTTP Repository
 * Implements organization data operations via HTTP
 */
export class OrganizationHttpRepository implements OrganizationRepository {
  async getMyOrganizations(token: string): Promise<Organization[]> {
    if (!token) {
      return [];
    }

    const { data, error } = await fetchClient.GET(
      "/api/organizations/my-organizations",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (error || !data) {
      return [];
    }

    const result = data as { organizations?: Organization[] } | Organization[];

    if (Array.isArray(result)) {
      return result;
    }

    return result.organizations ?? [];
  }

  async createOrganization(
    token: string,
    name: string,
    description?: string,
  ): Promise<Organization> {
    const { data, error } = await fetchClient.POST("/api/organizations", {
      body: castRequestBody({ name, description }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (error || !data) {
      throw new Error("organization.errors.createFailed");
    }

    await queryClient.invalidateQueries({
      queryKey: ["get", "/api/organizations/my-organizations"],
    });

    return data as Organization;
  }

  async getOrganizationDashboard(
    token: string,
    organizationId: number,
  ): Promise<OrganizationDashboard> {
    if (!token) {
      throw new Error("organization.errors.dashboardFailed");
    }

    const data = await queryClient.fetchQuery(
      apiClient.queryOptions("get", "/api/organizations/{id}/dashboard", {
        params: {
          path: {
            id: organizationId,
          },
        },
      }),
    );

    if (!data) {
      throw new Error("organization.errors.dashboardFailed");
    }

    return data as OrganizationDashboard;
  }

  async addMember(
    token: string,
    organizationId: number,
    userId: number,
    role: "owner" | "admin" | "member",
  ): Promise<OrganizationMember> {
    const { data, error } = await fetchClient.POST(
      "/api/organizations/{id}/members",
      {
        params: {
          path: {
            id: organizationId,
          },
        },
        body: castRequestBody({ userId, role }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (error || !data) {
      throw new Error("organization.errors.addMemberFailed");
    }

    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        query.queryKey[0] === "get" &&
        query.queryKey[1] === "/api/organizations/{id}/dashboard",
    });

    return data as OrganizationMember;
  }

  async removeMember(token: string, memberId: number): Promise<void> {
    const { error } = await fetchClient.DELETE(
      "/api/organizations/members/{memberId}",
      {
        params: {
          path: {
            memberId,
          },
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (error) {
      throw new Error("organization.errors.removeMemberFailed");
    }

    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        query.queryKey[0] === "get" &&
        query.queryKey[1] === "/api/organizations/{id}/dashboard",
    });
  }
}


export const organizationRepository = new OrganizationHttpRepository();
