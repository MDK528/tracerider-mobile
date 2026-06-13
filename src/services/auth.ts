import { api } from "./api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface MeResponse {
  fullName: string;
  email: string;
  gender: "male" | "female" | null;
  phone: string;
  address: string | null;
  avatar: string | null;
  role: "passenger" | "driver" | "admin";
}

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;
  gender?: "male" | "female";
  address?: string;
  avatarUrl?: string;
}

export interface UpdateUserResponse {
  id: string;
  fullName: string;
  phone: string;
  gender: "male" | "female" | null;
  address: string | null;
  avatarUrl: string | null;
}

export const getMe = async () => {
  const { data } = await api.get<ApiResponse<MeResponse>>("/auth/get-me");
  return data.data;
};

export const updateUser = async (payload: UpdateUserPayload) => {
  const { data } = await api.patch<ApiResponse<UpdateUserResponse>>("/auth/update-me", payload);
  return data.data;
};