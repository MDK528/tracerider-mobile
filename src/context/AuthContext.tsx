import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { api } from "@/services/api";
import { storage } from "@/services/storage";
import type { AuthState, AuthAction, User, Gender, Role } from "@/types/auth";

// ─── Reducer ─────────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "UPDATE_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  address: string;
  avatarUrl: string;
  password: string;
  role: Role;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On app start — check token and fetch current user
  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getAccessToken();
        if (!token) {
          dispatch({ type: "SET_LOADING", payload: false });
          return;
        }
        const res = await api.get<{ data: User }>("/auth/get-me");
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: res.data.data, accessToken: token },
        });
      } catch {
        await storage.clearAll();
        dispatch({ type: "SET_LOADING", payload: false });
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{
      data: { id: string; accessToken: string; refreshToken: string };
    }>("/auth/sign-in", { email, password });

    const { accessToken, refreshToken } = res.data.data;
    await storage.setAccessToken(accessToken);
    await storage.setRefreshToken(refreshToken);

    // Fetch full user profile after login
    const userRes = await api.get<{ data: User }>("/auth/get-me");
    dispatch({
      type: "LOGIN_SUCCESS",
      payload: { user: userRes.data.data, accessToken },
    });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    // Register returns only id, so login automatically after
    await api.post("/auth/sign-up", data);
    await login(data.email, data.password);
  }, [login]);

  const logout = useCallback(async () => {
    await storage.clearAll();
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}