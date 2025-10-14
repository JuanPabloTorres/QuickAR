"use client";

import authService from "@/services/authService";
import {
  AuthContextType,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from "@/types/auth";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = authService.getToken();
        const savedUser = authService.getUser();

        if (savedToken && authService.isAuthenticated()) {
          setToken(savedToken);

          // If we have a saved user, use it, otherwise try to get current user from API
          if (savedUser) {
            setUser(savedUser);
          } else {
            const response = await authService.getCurrentUser();
            if (response.success && response.data) {
              setUser(response.data);
              authService.setUser(response.data);
            } else {
              // Token is invalid, clear auth data
              authService.clearAuthData();
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        authService.clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const loginData: LoginRequest = { email, password };
      const response = await authService.login(loginData);

      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        console.log("✅ Login successful in AuthContext");
        return true;
      } else {
        console.error("❌ Login failed in AuthContext:", {
          success: response.success,
          message: response.message,
          errors: response.errors,
        });
        // Throw the complete response so login page can access all error details
        throw response;
      }
    } catch (error: any) {
      console.error("❌ Login error in AuthContext:", {
        hasSuccess: "success" in error,
        success: error.success,
        message: error.message,
        errors: error.errors,
        type: typeof error,
      });
      // Re-throw the error to let the login page handle it
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.register(data);

      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        return true;
      } else {
        console.error(
          "Registration failed:",
          response.message || "Unknown error"
        );
        // Throw the complete response so register page can access all error details
        throw response;
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Re-throw the error to let the register page handle it
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setToken(null);

      // Redirect to login after logout
      console.log("🚪 Logout successful, redirecting to login...");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local data and redirect
      setUser(null);
      setToken(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (
    data: ChangePasswordRequest
  ): Promise<boolean> => {
    try {
      const response = await authService.changePassword(data);
      return response.success;
    } catch (error) {
      console.error("Change password error:", error);
      return false;
    }
  };

  const updateProfile = async (
    data: UpdateProfileRequest
  ): Promise<boolean> => {
    try {
      const response = await authService.updateProfile(data);
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  };

  const isAuthenticated = !!token && !!user && authService.isAuthenticated();

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthContext };
