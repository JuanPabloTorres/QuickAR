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
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Lock, Mail, Shield, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});
  const [registerError, setRegisterError] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);

  const { register, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/experiences");
    }
  }, [isAuthenticated, loading, router]);

  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "El nombre es requerido";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "El apellido es requerido";
    }

    if (!formData.email.trim()) {
      errors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El formato del email no es válido";
    }

    if (!formData.password) {
      errors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.acceptTerms) {
      errors.acceptTerms = "Debes aceptar los términos y condiciones";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setErrorDetails([]);

    if (!validateForm()) {
      return;
    }

    setIsRegistering(true);

    try {
      console.log("📝 Attempting registration for:", formData.email);
      await register({
        username: formData.email, // Use email as username for now
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      console.log("✅ Registration successful, redirecting...");
      router.push("/experiences");
    } catch (error: any) {
      console.error("❌ Registration error:", error);

      // Extract error details and provide user-friendly messages
      let message = "Error al crear la cuenta";
      let details: string[] = [];

      // Check if it's an API response error
      if (error?.success === false) {
        message = error.message || "Error de registro";
        details = error.errors || [];
      } else if (error?.response) {
        // HTTP error response
        const status = error.response.status;
        if (status === 400) {
          message = "Datos de registro inválidos";
          details = error.errors || [
            "Verifica que todos los campos estén correctos",
            "El email debe ser válido",
            "La contraseña debe tener al menos 6 caracteres",
          ];
        } else if (status === 409 || (error.message && error.message.includes("existe"))) {
          message = "El email ya está registrado";
          details = [
            "Este correo electrónico ya tiene una cuenta asociada",
            "Intenta iniciar sesión o usa otro correo",
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
          "Verifica que el backend esté ejecutándose",
          "Comprueba tu conexión a internet",
        ];
      } else if (error?.message) {
        message = error.message;
        details = error.errors || (Array.isArray(error) ? error : []);
      } else {
        message = "Error desconocido al crear la cuenta";
        details = [
          "Por favor, intenta nuevamente",
          "Si el problema persiste, contacta al soporte",
        ];
      }

      setRegisterError(message);
      setErrorDetails(details);

      // Scroll to top to make error visible
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute animate-bounce ${
                i % 3 === 0
                  ? "top-1/4 left-1/4"
                  : i % 3 === 1
                  ? "top-3/4 right-1/4"
                  : "top-1/2 left-1/2"
              } ${
                i % 4 === 0
                  ? "animate-pulse"
                  : i % 4 === 1
                  ? "animate-bounce"
                  : i % 4 === 2
                  ? "animate-ping"
                  : "animate-pulse"
              }`}
            >
              <Sparkles className="w-2 h-2 text-sky-400/60" />
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto p-6">
          <FuturisticCard variant="glass" glow className="overflow-hidden">
            <FuturisticCardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <QuickArLogo size={80} animated />
              </div>
              <FuturisticCardTitle className="text-3xl font-bold font-orbitron mb-2">
                <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  Crear Cuenta
                </span>
              </FuturisticCardTitle>
              <p className="text-slate-400 font-manrope">
                Únete a la plataforma de realidad aumentada más avanzada
              </p>
            </FuturisticCardHeader>

            <FuturisticCardContent className="px-8 pb-8">
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FuturisticInput
                      type="text"
                      name="firstName"
                      placeholder="Nombre"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      icon={<User className="w-4 h-4" />}
                      error={formErrors.firstName}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <FuturisticInput
                      type="text"
                      name="lastName"
                      placeholder="Apellido"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      icon={<User className="w-4 h-4" />}
                      error={formErrors.lastName}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Email field */}
                <div className="space-y-2">
                  <FuturisticInput
                    type="email"
                    name="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={<Mail className="w-4 h-4" />}
                    error={formErrors.email}
                    className="w-full"
                  />
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <div className="relative">
                    <FuturisticInput
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Contraseña (mín. 6 caracteres)"
                      value={formData.password}
                      onChange={handleInputChange}
                      icon={<Lock className="w-4 h-4" />}
                      error={formErrors.password}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors z-10"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field */}
                <div className="space-y-2">
                  <div className="relative">
                    <FuturisticInput
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirmar contraseña"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      icon={<Shield className="w-4 h-4" />}
                      error={formErrors.confirmPassword}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors z-10"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms and conditions */}
                <div className="space-y-2">
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
                          formData.acceptTerms
                            ? "border-sky-400 bg-sky-400/20"
                            : "border-slate-600 group-hover:border-slate-500"
                        }`}
                      >
                        {formData.acceptTerms && (
                          <div className="w-2 h-2 bg-sky-400 rounded-sm mx-auto mt-0.5"></div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-slate-300 font-manrope">
                      Acepto los{" "}
                      <Link
                        href="/privacy"
                        className="text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        términos y condiciones
                      </Link>{" "}
                      y la{" "}
                      <Link
                        href="/privacy"
                        className="text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        política de privacidad
                      </Link>
                    </span>
                  </label>
                  {formErrors.acceptTerms && (
                    <p className="text-red-400 text-sm font-manrope">
                      {formErrors.acceptTerms}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <FuturisticButton
                  type="submit"
                  size="lg"
                  glow
                  disabled={isRegistering}
                  className="w-full"
                >
                  {isRegistering ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </FuturisticButton>

                {/* Error message */}
                {registerError && (
                  <div className="mt-4 p-4 border border-red-500/50 bg-red-500/10 rounded-lg">
                    <p className="text-red-400 text-sm font-manrope text-center">
                      {registerError}
                    </p>
                  </div>
                )}

                {/* Login link */}
                <div className="text-center pt-4 border-t border-slate-700/50">
                  <p className="text-slate-400 font-manrope text-sm">
                    ¿Ya tienes una cuenta?{" "}
                    <Link
                      href="/login"
                      className="text-sky-400 hover:text-sky-300 transition-colors font-medium"
                    >
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </form>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* Additional features showcase */}
          <div className="mt-8 text-center">
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-sky-400" />
                </div>
                <p className="text-xs text-slate-400 font-manrope">Seguro</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-xs text-slate-400 font-manrope">Innovador</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-xs text-slate-400 font-manrope">Fácil</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
