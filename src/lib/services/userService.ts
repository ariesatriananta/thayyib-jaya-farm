import { fetchJson } from "./apiClient";

export type UserItem = {
  id: string;
  username: string;
  name: string;
  role: "admin" | "staff";
  createdAt?: string;
  updatedAt?: string;
};

export const userService = {
  async getAll(): Promise<UserItem[]> {
    return fetchJson<UserItem[]>("/api/users");
  },

  async create(payload: {
    username: string;
    name: string;
    role: "admin" | "staff";
    password: string;
  }): Promise<UserItem> {
    return fetchJson<UserItem>("/api/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: { name: string; role: "admin" | "staff" }): Promise<UserItem> {
    return fetchJson<UserItem>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async remove(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/users/${id}`, {
      method: "DELETE",
    });
  },
};
