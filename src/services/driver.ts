import { api } from "./api";
import type {
  DriverProfile,
  PublicDriverProfile,
  UpdateDriverProfilePayload,
  UpdateDriverProfileResponse,
  ToggleAvailabilityResponse,
} from "@/types/driver";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getDriverProfile = async () => {
  const { data } = await api.get<ApiResponse<DriverProfile>>("/drivers/profile");
  return data.data;
};

export const updateDriverProfile = async (payload: UpdateDriverProfilePayload) => {
  const { data } = await api.patch<ApiResponse<UpdateDriverProfileResponse>>("/drivers/profile", payload);
  return data.data;
};

export const toggleAvailability = async (isAvailable: boolean) => {
  const { data } = await api.patch<ApiResponse<ToggleAvailabilityResponse>>("/drivers/availability", { isAvailable });
  return data.data;
};

export const getPublicDriverProfile = async (id: string) => {
  const { data } = await api.get<ApiResponse<PublicDriverProfile>>(`/drivers/${id}`);
  return data.data;
};