export type Role = "passenger" | "driver";
export type Gender = "male" | "female";

export interface User {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  address: string;
  avatar: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; accessToken: string } }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: User };