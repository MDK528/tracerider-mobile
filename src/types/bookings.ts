export type RideStatus =
  | "requested"
  | "driver_assigned"
  | "driver_arriving"
  | "otp_verified"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentMethod = "cash" | "razorpay";

export type CancelledBy = "passenger" | "driver";

export interface Booking {
  id: string;
  passengerId: string;
  driverId: string | null;

  pickupCity: string;
  pickupLocation: string;
  dropLocation: string;

  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;

  fareAmount: number;
  paymentMethod: PaymentMethod;

  status: RideStatus;

  otp: string | null;

  cancelledBy: CancelledBy | null;
  cancellationReason: string | null;

  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;

  createdAt: string;
  updatedAt: string | null;
}

export interface CreateBookingPayload {
  pickupCity: string;
  pickupLocation: string;
  dropLocation: string;

  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;

  paymentMethod: PaymentMethod;
}

export interface CreateBookingResponse {
  id: string;
  fareAmount: number;
}

export interface VerifyOtpPayload {
  otp: string;
}

export interface CancelRidePayload {
  reason?: string;
}

export interface AcceptRideResponse {
  id: string;
  status: RideStatus;
  driverId: string | null;
}

export interface RideStatusResponse {
  id: string;
  status: RideStatus;
}

export interface CompleteRideResponse {
  id: string;
  status: RideStatus;
  fareAmount: number;
  paymentMethod: PaymentMethod;
}

export interface MessageResponse {
  message: string;
}