import {
  ApiResponse,
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth";

// Get the API base URL - client-side dynamic detection
const getApiBaseUrl = () => {
  // Server-side
  if (typeof window === "undefined") {
    return process.env.API_INTERNAL_BASE_URL || "http://localhost:5001";
  }

  // Client-side
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isNetworkIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

  // Use env var if set
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Network IP (phone/tablet)
  if (isNetworkIP) {
    return `http://${hostname}:5001`;
  }

  // Localhost (desktop)
  if (isLocalhost) {
    return "http://localhost:5001";
  }

  return "http://localhost:5001";
};

const API_BASE_URL = getApiBaseUrl();

class AuthService {
  private baseUrl = `${API_BASE_URL}/api/v1/auth`;

  // Helper method to make API requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add authorization header if token exists
    if (
      token &&
      !endpoint.includes("/login") &&
      !endpoint.includes("/register")
    ) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      console.log("🔐 Making auth request to:", url);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Try to parse response
      let data: ApiResponse<T>;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        return {
          success: false,
          message: "Error al procesar la respuesta del servidor",
          errors: ["La respuesta del servidor no es válida"],
        };
      }

      if (!response.ok) {
        // Only log in development mode
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ API request failed:", {
            status: response.status,
            statusText: response.statusText,
            url,
          });
        }

        // Provide more specific error messages based on status code
        if (response.status === 401) {
          return {
            ...data,
            message:
              data.message ||
              "Credenciales inválidas. Verifica tu email y contraseña.",
            errors: data.errors || ["Usuario o contraseña incorrectos"],
          };
        } else if (response.status === 404) {
          return {
            ...data,
            message: data.message || "Usuario no encontrado",
            errors: data.errors || ["El usuario no existe en el sistema"],
          };
        } else if (response.status === 400) {
          return {
            ...data,
            message: data.message || "Datos inválidos",
            errors: data.errors || ["Verifica los datos ingresados"],
          };
        } else if (response.status >= 500) {
          return {
            ...data,
            message: data.message || "Error del servidor",
            errors: data.errors || [
              "El servidor encontró un problema. Intenta más tarde.",
            ],
          };
        }

        return data;
      }

      console.log("✅ Auth request successful");
      return data;
    } catch (error) {
      console.error("Network error:", error);

      // More specific network error messages
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError")
      ) {
        return {
          success: false,
          message: "No se pudo conectar al servidor",
          errors: [
            "Verifica tu conexión a internet",
            "Asegúrate de que el backend esté ejecutándose",
            `URL intentada: ${url}`,
          ],
        };
      }

      return {
        success: false,
        message: "Error de red",
        errors: [errorMessage || "No se pudo conectar con el servidor"],
      };
    }
  }

  // Login user
  async login(loginData: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    console.log("🔐 authService.login called with:", loginData.email);
    const response = await this.makeRequest<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(loginData),
    });

    console.log("🔐 authService.login response:", {
      success: response.success,
      message: response.message,
      hasData: !!response.data,
      errors: response.errors,
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response;
  }

  // Register user
  async register(
    registerData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(registerData),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response;
  }

  // Get current user info
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>("/me");
  }

  // Change password
  async changePassword(
    passwordData: ChangePasswordRequest
  ): Promise<ApiResponse<boolean>> {
    return this.makeRequest<boolean>("/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await this.makeRequest<boolean>("/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      this.clearAuthData();
    }
  }

  // Token management
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  }

  clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  }

  // User data management
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userData = localStorage.getItem("auth_user");
    return userData ? JSON.parse(userData) : null;
  }

  setUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_user", JSON.stringify(user));
  }

  clearUser(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_user");
  }

  // Clear all auth data
  clearAuthData(): void {
    this.clearToken();
    this.clearUser();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;

      if (payload.exp < now) {
        this.clearAuthData();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      this.clearAuthData();
      return false;
    }
  }

  // Get user info from token
  getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.nameid,
        email: payload.email,
        username: payload.name,
        firstName: payload.FirstName || "",
        lastName: payload.LastName || "",
        role: payload.role,
        isActive: true,
        isEmailConfirmed: true,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
