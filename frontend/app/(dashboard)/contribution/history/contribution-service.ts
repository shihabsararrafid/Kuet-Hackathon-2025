// Type definitions
export interface Contribution {
  id: string;
  banglishText: string;
  banglaText: string;
  isApproved: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContributionCreateDto {
  banglishText: string;
  banglaText: string;
}

class ContributionService {
  private baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/contribution`;

  // Helper method to handle fetch requests
  private async fetchWithCredentials(
    url: string,
    method: string = "GET",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const options: RequestInit = {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "An error occurred");
    }

    return response.json();
  }

  // Create a new contribution
  async createContribution(data: ContributionCreateDto): Promise<Contribution> {
    try {
      const result = await this.fetchWithCredentials(
        `${this.baseUrl}/create`,
        "POST",
        data
      );

      // Assuming the API returns data in result.data
      return result.data;
    } catch (error) {
      console.error("Contribution creation failed:", error);
      throw error;
    }
  }

  // Get user's contributions
  async getUserContributions(isApproved?: boolean): Promise<Contribution[]> {
    try {
      const url = new URL(`${this.baseUrl}/my-contributions`);
      if (isApproved !== undefined) {
        url.searchParams.append("isApproved", isApproved.toString());
      }

      const result = await this.fetchWithCredentials(url.toString());
      return result.data;
    } catch (error) {
      console.error("Fetching contributions failed:", error);
      throw error;
    }
  }

  // Get all contributions (admin)
  async getAllContributions(isApproved?: boolean): Promise<Contribution[]> {
    try {
      const url = new URL(`${this.baseUrl}/all`);
      if (isApproved !== undefined) {
        url.searchParams.append("isApproved", isApproved.toString());
      }

      const result = await this.fetchWithCredentials(url.toString());
      return result.data;
    } catch (error) {
      console.error("Fetching all contributions failed:", error);
      throw error;
    }
  }

  // Get contribution by ID
  async getContributionById(id: string): Promise<Contribution> {
    try {
      const result = await this.fetchWithCredentials(`${this.baseUrl}/${id}`);
      return result.data;
    } catch (error) {
      console.error("Fetching contribution failed:", error);
      throw error;
    }
  }

  // Update a contribution
  async updateContribution(
    id: string,
    data: Partial<ContributionCreateDto>
  ): Promise<Contribution> {
    try {
      const result = await this.fetchWithCredentials(
        `${this.baseUrl}/${id}`,
        "PUT",
        data
      );
      return result.data;
    } catch (error) {
      console.error("Updating contribution failed:", error);
      throw error;
    }
  }

  // Update contribution approval status (admin)
  async updateApprovalStatus(
    id: string,
    isApproved: boolean
  ): Promise<Contribution> {
    try {
      const result = await this.fetchWithCredentials(
        `${this.baseUrl}/${id}/approval`,
        "PATCH",
        { isApproved }
      );
      return result.data;
    } catch (error) {
      console.error("Updating contribution status failed:", error);
      throw error;
    }
  }

  // Delete a contribution
  async deleteContribution(id: string): Promise<void> {
    try {
      await this.fetchWithCredentials(`${this.baseUrl}/${id}`, "DELETE");
    } catch (error) {
      console.error("Deleting contribution failed:", error);
      throw error;
    }
  }
}

export const contributionService = new ContributionService();
