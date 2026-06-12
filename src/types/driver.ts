export interface DriverProfile {
  id: string;
  isAvailable: boolean;
  isVerified: boolean;
  totalTrips: number;
  state: string;
  serviceArea: string[];
  vehicleModel: string;
  vehicleNo: string;
  licenceNo: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
}

export interface PublicDriverProfile {
  id: string;
  isAvailable: boolean;
  totalTrips: number;
  vehicleModel: string;
  vehicleNo: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface UpdateDriverProfilePayload {
  state?: string;
  serviceArea?: string[];
  vehicleModel?: string;
  vehicleNo?: string;
  licenceNo?: string;
}

export interface UpdateDriverProfileResponse {
  id: string;
  state: string;
  serviceArea: string[];
  vehicleModel: string;
  vehicleNo: string;
  licenceNo: string;
}

export interface ToggleAvailabilityResponse {
  id: string;
  isAvailable: boolean;
}