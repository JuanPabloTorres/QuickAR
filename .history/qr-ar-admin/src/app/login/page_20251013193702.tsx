"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { FuturisticButton } from "@/components/ui/futuristic-button";
import {
  FuturisticCard,
  FuturisticCardContent,
  FuturisticCardHeader,
  FuturisticCardTitle,
} from "@/components/ui/futuristic-card";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import QuickArLogo from "@/components/ui/quick-ar-logo";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Lock, Mail, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loginError, setLoginError] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/experiences");
    }
  }, [isAuthenticated, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setErrorDetails([]);
    setIsLoggingIn(true);

    try {
      console.log("🔐 Attempting login for:", formData.email);
      const success = await login(formData.email, formData.password);

      if (success) {
        // If we get here, login was successful
        console.log("✅ Login successful, redirecting...");
        router.push("/experiences");
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      console.log("Error details:", {
        hasSuccess: "success" in error,
        success: error?.success,
        message: error?.message,
        errors: error?.errors,
        hasResponse: "response" in error,
        response: error?.response,
        type: typeof error,
        keys: Object.keys(error || {}),
      });

      // Extract error details and provide user-friendly messages
      let message = "Error al iniciar sesión";
      let details: string[] = [];

      // Check if it's an API response error
      if (error?.success === false) {
        message = error.message || "Error de autenticación";
        details = error.errors || [];
      } else if (error?.response) {
        // HTTP error response
        const status = error.response.status;
        if (status === 401) {
          message = "Credenciales inválidas";
          details = [
            "El correo electrónico o la contraseña son incorrectos",
            "Verifica tus datos e intenta nuevamente",
          ];
        } else if (status === 400) {
          message = "Datos de inicio de sesión inválidos";
          details = error.errors || [
            "Por favor verifica el formato de tu correo electrónico",
            "La contraseña debe tener al menos 6 caracteres",
          ];
        } else if (status >= 500) {
          message = "Error del servidor";
          details = [
            "El servidor está experimentando problemas",
            "Por favor, intenta nuevamente en unos momentos",
          ];
        }
      } else if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        error?.message?.includes("fetch") ||
        error?.message?.includes("conectar")
      ) {
        message = "Error de conexión con el servidor";
        details = [
          "No se pudo conectar con el servidor",
          "Verifica que el backend esté ejecutándose en http://localhost:5001",
          "Comprueba tu conexión a internet",
        ];
      } else if (error?.message) {
        message = error.message;
        details = error.errors || Array.isArray(error) ? error : [];
      } else {
        message = "Error desconocido al iniciar sesión";
        details = [
          "Por favor, intenta nuevamente",
          "Si el problema persiste, contacta al soporte",
        ];
      }

      setLoginError(message);
      setErrorDetails(details);

      // Scroll to top to make error visible
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Error Alert Modal - Positioned at top */}
          {loginError && (
            <div className="mb-6 animate-in slide-in-from-top duration-500">
              <div className="relative bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-500/50 rounded-xl p-5 shadow-2xl backdrop-blur-sm">
                {/* Close button */}
                <button
                  onClick={() => {
                    setLoginError("");
                    setErrorDetails([]);
                  }}
                  className="absolute top-3 right-3 text-red-300 hover:text-red-100 transition-colors"
                  aria-label="Cerrar alerta de error"
                  title="Cerrar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>

                {/* Error Icon and Title */}
                <div className="flex items-start mb-3">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 bg-red-500/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-red-300"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-red-100 font-bold text-base font-orbitron mb-1">
                      {loginError}
                    </h3>
                    {errorDetails.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {errorDetails.map((detail, index) => (
                          <li
                            key={index}
                            className="flex items-start text-sm text-red-200/90 font-manrope"
                          >
                            <span className="mr-2 text-red-400 font-bold">
                              •
                            </span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Pulse animation border */}
                <div className="absolute inset-0 border-2 border-red-500/30 rounded-xl animate-pulse pointer-events-none"></div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-2xl">
                  <QuickArLogo />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400/50 to-indigo-500/50 rounded-xl blur-xl animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-3xl font-bold font-orbitron text-white mb-2">
              QuickAR{" "}
              <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                Admin
              </span>
            </h1>
          </div>

          {/* Login Form */}
          <FuturisticCard variant="glass" glow>
            <FuturisticCardHeader>
              <FuturisticCardTitle className="text-center flex items-center justify-center">
                <Shield className="mr-2 h-5 w-5 text-sky-400" />
                Iniciar Sesión
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Input */}
                <FuturisticInput
                  label="Correo Electrónico"
                  type="email"
                  placeholder="admin@quickar.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  variant="glass"
                  icon={<Mail className="h-4 w-4" />}
                  required
                />

                {/* Password Input */}
                <div className="relative">
                  <FuturisticInput
                    label="Contraseña"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    variant="glass"
                    icon={<Lock className="h-4 w-4" />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rememberMe: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-sky-400 bg-transparent border-2 border-white/30 rounded focus:ring-sky-400 focus:ring-2"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 text-sm text-slate-300 font-manrope"
                    >
                      Recordarme
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-sky-400 hover:text-sky-300 transition-colors font-manrope"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Login Button */}
                <FuturisticButton
                  type="submit"
                  className="w-full"
                  size="lg"
                  glow
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-5 w-5" />
                      Iniciar Sesión
                    </>
                  )}
                </FuturisticButton>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/80 text-slate-400 font-manrope">
                    O continuar con
                  </span>
                </div>
              </div>

              {/* Alternative Login Methods */}
              <div className="space-y-3">
                <FuturisticButton variant="outline" className="w-full" disabled>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google SSO (Próximamente)
                </FuturisticButton>

                <FuturisticButton variant="ghost" className="w-full" disabled>
                  <Shield className="mr-2 h-5 w-5" />
                  Autenticación Empresarial (Próximamente)
                </FuturisticButton>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* Footer */}
          <div className="text-center mt-8 space-y-4">
            <p className="text-sm text-slate-400 font-manrope">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/register"
                className="text-sky-400 hover:text-sky-300 transition-colors"
              >
                Crear cuenta
              </Link>
            </p>

            <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
              <Link
                href="/privacy"
                className="hover:text-sky-400 transition-colors"
              >
                Privacidad
              </Link>
              <span>•</span>
              <Link
                href="/support"
                className="hover:text-sky-400 transition-colors"
              >
                Soporte
              </Link>
              <span>•</span>
              <Link
                href="/docs"
                className="hover:text-sky-400 transition-colors"
              >
                Documentación
              </Link>
            </div>

            <p className="text-xs text-slate-500 font-manrope">
              © 2024 QuickAR Platform. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
