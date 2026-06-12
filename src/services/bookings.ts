import { api } from "./api";
import type {
  Booking,
  CreateBookingPayload,
  CreateBookingResponse,
  VerifyOtpPayload,
  CancelRidePayload,
  AcceptRideResponse,
  RideStatusResponse,
  CompleteRideResponse,
  MessageResponse,
} from "@/types/bookings.ts";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const createBooking = async (payload: CreateBookingPayload) => {
  const { data } = await api.post<ApiResponse<CreateBookingResponse>>(
    "/bookings",
    payload
  );

  return data.data;
};

export const getMyRides = async () => {
  const { data } = await api.get<ApiResponse<Booking[]>>(
    "/bookings/my-rides"
  );

  return data.data;
};

export const getBooking = async (id: string) => {
  const { data } = await api.get<ApiResponse<Booking>>(
    `/bookings/${id}`
  );

  return data.data;
};

export const verifyOtp = async (
  bookingId: string,
  payload: VerifyOtpPayload
) => {
  const { data } = await api.post<ApiResponse<RideStatusResponse>>(
    `/bookings/${bookingId}/verify-otp`,
    payload
  );

  return data.data;
};

export const getAvailableRequests = async () => {
  const { data } = await api.get<ApiResponse<Booking[]>>(
    "/bookings/available"
  );

  return data.data;
};

export const acceptRide = async (bookingId: string) => {
  const { data } = await api.patch<ApiResponse<AcceptRideResponse>>(
    `/bookings/${bookingId}/accept`
  );

  return data.data;
};

export const rejectRide = async (bookingId: string) => {
  const { data } = await api.patch<ApiResponse<MessageResponse>>(
    `/bookings/${bookingId}/reject`
  );

  return data.data;
};

export const markArriving = async (bookingId: string) => {
  const { data } = await api.patch<ApiResponse<RideStatusResponse>>(
    `/bookings/${bookingId}/arrive`
  );

  return data.data;
};

export const completeRide = async (bookingId: string) => {
  const { data } = await api.patch<ApiResponse<CompleteRideResponse>>(
    `/bookings/${bookingId}/complete`
  );

  return data.data;
};

export const cancelRide = async (
  bookingId: string,
  payload?: CancelRidePayload
) => {
  const { data } = await api.patch<ApiResponse<RideStatusResponse>>(
    `/bookings/${bookingId}/cancel`,
    payload
  );

  return data.data;
};