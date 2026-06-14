import { api } from "./api";
import type {
  Booking,
  CreateBookingPayload,
  CreateBookingResponse,
  AcceptRideResponse,
  RideStatusResponse,
  CompleteRideResponse,
} from "@/types/bookings";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ---- Passenger ----

export const createBooking = async (payload: CreateBookingPayload) => {
  const { data } = await api.post<ApiResponse<CreateBookingResponse>>("/bookings", payload);
  return data.data;
};

export const getMyRides = async () => {
  const { data } = await api.get<ApiResponse<Booking[]>>("/bookings/my-rides");
  return data.data;
};

export const verifyOtp = async (bookingId: string, otp: string) => {
  const { data } = await api.post<ApiResponse<RideStatusResponse>>(
    `/bookings/${bookingId}/verify-otp`,
    { otp }
  );
  return data.data;
};

// ---- Driver ----

export const getAvailableRequests = async () => {
  const { data } = await api.get<ApiResponse<Booking[]>>("/bookings/available");
  return data.data;
};

export const getMyActiveRide = async () => {
  const { data } = await api.get<ApiResponse<Booking | null>>("/bookings/my-active-ride");
  return data.data;
};

export const getPassengerActiveRide = async () => {
  const { data } = await api.get<ApiResponse<Booking | null>>("/bookings/passenger/active-ride");
  return data.data;
};

export const acceptRide = async (bookingId: string) => {
  const { data } = await api.patch<ApiResponse<AcceptRideResponse>>(`/bookings/${bookingId}/accept`);
  return data.data;
};

export const rejectRide = async (bookingId: string) => {
  const { data } = await api.patch<ApiResponse<null>>(`/bookings/${bookingId}/reject`);
  return data.message;
};

export const markArriving = async (bookingId: string) => {
  const { data } = await api.patch<ApiResponse<RideStatusResponse>>(`/bookings/${bookingId}/arrive`);
  return data.data;
};

export const completeRide = async (bookingId: string) => {
  const { data } = await api.patch<ApiResponse<CompleteRideResponse>>(`/bookings/${bookingId}/complete`);
  return data.data;
};

// ---- Shared (passenger or driver) ----

export const getBooking = async (bookingId: string) => {
  const { data } = await api.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
  return data.data;
};

export const cancelRide = async (bookingId: string, reason?: string) => {
  const { data } = await api.patch<ApiResponse<RideStatusResponse>>(`/bookings/${bookingId}/cancel`, {
    reason,
  });
  return data.data;
};

export const getShareToken = async (bookingId: string) => {
  const { data } = await api.get<ApiResponse<{ token: string }>>(`/bookings/${bookingId}/share-token`);
  return data.data.token;
};