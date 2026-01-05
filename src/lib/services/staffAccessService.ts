import { fetchJson } from "./apiClient";

export type StaffAccessItem = {
  userId: string;
  username: string;
  name: string;
  kandangIds: string[];
  kandangNames: string[];
};

export const staffAccessService = {
  async getAll(): Promise<StaffAccessItem[]> {
    return fetchJson<StaffAccessItem[]>("/api/staff-kandang-access");
  },

  async getByUser(userId: string): Promise<{ userId: string; kandangIds: string[] }> {
    return fetchJson<{ userId: string; kandangIds: string[] }>(
      `/api/staff-kandang-access?userId=${encodeURIComponent(userId)}`
    );
  },

  async update(userId: string, kandangIds: string[]): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>("/api/staff-kandang-access", {
      method: "PUT",
      body: JSON.stringify({ userId, kandangIds }),
    });
  },
};
