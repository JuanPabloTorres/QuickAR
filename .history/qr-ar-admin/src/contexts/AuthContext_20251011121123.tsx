'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType, LoginRequest, RegisterRequest, ChangePasswordRequest } from '@/types/auth';
import authService from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        console.error('Auth initialization failed:', error);
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
        return true;
      } else {
        console.error('Login failed:', response.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
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
        console.error('Registration failed:', response.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
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
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordRequest): Promise<boolean> => {
    try {
      const response = await authService.changePassword(data);
      return response.success;
    } catch (error) {
      console.error('Change password error:', error);
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
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };