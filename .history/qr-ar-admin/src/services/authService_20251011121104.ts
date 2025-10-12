import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, ChangePasswordRequest, User } from '@/types/auth';

// Get the API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5002';

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
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authorization header if token exists
    if (token && !endpoint.includes('/login') && !endpoint.includes('/register')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();
      
      if (!response.ok) {
        console.error('API request failed:', data);
        return data;
      }

      return data;
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        message: 'Network error occurred',
        errors: ['Failed to connect to server']
      };
    }
  }

  // Login user
  async login(loginData: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response;
  }

  // Register user
  async register(registerData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/register', {
      method: 'POST',
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
    return this.makeRequest<User>('/me');
  }

  // Change password
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<boolean>> {
    return this.makeRequest<boolean>('/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await this.makeRequest<boolean>('/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  }

  // User data management
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('auth_user');
    return userData ? JSON.parse(userData) : null;
  }

  setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  clearUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_user');
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
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp < now) {
        this.clearAuthData();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      this.clearAuthData();
      return false;
    }
  }

  // Get user info from token
  getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.nameid,
        email: payload.email,
        username: payload.name,
        firstName: payload.FirstName || '',
        lastName: payload.LastName || '',
        role: payload.role,
        isActive: true,
        isEmailConfirmed: true,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;