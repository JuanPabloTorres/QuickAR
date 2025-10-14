"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import {
  EasterEggProvider,
  MotivationalQuote,
} from "@/components/ui/easter-eggs";
import {
  AchievementNotification,
  FloatingDecoration,
} from "@/components/ui/floating-particles";
import { FuturisticButton } from "@/components/ui/futuristic-button";
import {
  FuturisticCard,
  FuturisticCardContent,
  FuturisticCardHeader,
  FuturisticCardTitle,
} from "@/components/ui/futuristic-card";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import {
  CalendarIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  MailIcon,
  SaveIcon,
  ShieldIcon,
  TrophyIcon,
  UserIcon,
} from "@/components/ui/svg-icons";
import { useAuth } from "@/contexts/AuthContext";
import { ChangePasswordRequest } from "@/types/auth";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, changePassword, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    email: user?.email || "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const success = await updateProfile(profileData);

      if (success) {
        setMessage({
          type: "success",
          text: "Perfil actualizado exitosamente",
        });
        setIsEditing(false);

        // Trigger achievement
        setNewAchievement({
          title: "🎯 Perfil Actualizado",
          description: "¡Has personalizado tu perfil!",
        });
        setShowAchievement(true);
      } else {
        setMessage({ type: "error", text: "Error al actualizar el perfil" });
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      setMessage({
        type: "error",
        text: error?.message || "Error al actualizar el perfil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      setIsLoading(false);
      return;
    }

    try {
      const success = await changePassword(passwordData);
      if (success) {
        setMessage({
          type: "success",
          text: "Contraseña actualizada exitosamente",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setShowChangePassword(false);

        // Trigger achievement
        setNewAchievement({
          title: "🔐 Seguridad Mejorada",
          description: "¡Has actualizado tu contraseña!",
        });
        setShowAchievement(true);
      } else {
        setMessage({ type: "error", text: "Error al cambiar la contraseña" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al cambiar la contraseña" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-400 mx-auto"></div>
            <p className="mt-4 text-slate-400">Cargando perfil...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <FloatingDecoration />
      <EasterEggProvider
        onActivate={() => {
          setNewAchievement({
            title: "👨‍💻 Code Master",
            description: "¡Descubriste el easter egg del perfil!",
          });
          setShowAchievement(true);
        }}
      />
      <MotivationalQuote />
      <AchievementNotification
        achievement={newAchievement || undefined}
        show={showAchievement}
        onClose={() => setShowAchievement(false)}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center animate-in fade-in-50 slide-in-from-top-4 duration-1000">
          <div className="flex items-center justify-center mb-6">
            <QuickArLogo size={64} animated className="mr-4" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-orbitron text-white mb-2">
                Mi{" "}
                <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  Perfil
                </span>
              </h1>
              <p className="text-slate-300 font-manrope">
                Gestiona tu información personal y configuración de cuenta
              </p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            } animate-in fade-in-50 duration-500`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <FuturisticCard
              variant="glass"
              glow
              className="animate-in fade-in-50 duration-500"
            >
              <FuturisticCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserIcon size={24} className="text-sky-400" />
                    <FuturisticCardTitle>
                      Información Personal
                    </FuturisticCardTitle>
                  </div>
                  <FuturisticButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sky-400 hover:text-sky-300"
                  >
                    <EditIcon size={16} className="mr-2" />
                    {isEditing ? "Cancelar" : "Editar"}
                  </FuturisticButton>
                </div>
              </FuturisticCardHeader>
              <FuturisticCardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nombre
                      </label>
                      {isEditing ? (
                        <FuturisticInput
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              firstName: e.target.value,
                            })
                          }
                          placeholder="Tu nombre"
                          icon={<UserIcon size={20} />}
                        />
                      ) : (
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-white">
                          {profileData.firstName || "No especificado"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Apellido
                      </label>
                      {isEditing ? (
                        <FuturisticInput
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              lastName: e.target.value,
                            })
                          }
                          placeholder="Tu apellido"
                          icon={<UserIcon size={20} />}
                        />
                      ) : (
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-white">
                          {profileData.lastName || "No especificado"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nombre de Usuario
                    </label>
                    {isEditing ? (
                      <FuturisticInput
                        type="text"
                        value={profileData.username}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            username: e.target.value,
                          })
                        }
                        placeholder="Tu nombre de usuario"
                        icon={<UserIcon size={20} />}
                      />
                    ) : (
                      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-white">
                        {profileData.username}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-slate-400">
                      <div className="flex items-center space-x-2">
                        <MailIcon size={16} />
                        <span>{profileData.email}</span>
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                          No editable
                        </span>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4">
                      <FuturisticButton
                        type="submit"
                        glow
                        disabled={isLoading}
                        className="flex-1"
                      >
                        <SaveIcon size={16} className="mr-2" />
                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                      </FuturisticButton>
                    </div>
                  )}
                </form>
              </FuturisticCardContent>
            </FuturisticCard>

            {/* Password Change Section */}
            <FuturisticCard
              variant="neon"
              className="animate-in fade-in-50 duration-500 delay-150"
            >
              <FuturisticCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <KeyIcon size={24} className="text-yellow-400" />
                    <FuturisticCardTitle>Seguridad</FuturisticCardTitle>
                  </div>
                  <FuturisticButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <KeyIcon size={16} className="mr-2" />
                    {showChangePassword ? "Cancelar" : "Cambiar Contraseña"}
                  </FuturisticButton>
                </div>
              </FuturisticCardHeader>
              {showChangePassword && (
                <FuturisticCardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Contraseña Actual
                      </label>
                      <div className="relative">
                        <FuturisticInput
                          type={passwordVisible.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="Ingresa tu contraseña actual"
                          icon={<KeyIcon size={20} />}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPasswordVisible({
                              ...passwordVisible,
                              current: !passwordVisible.current,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        >
                          {passwordVisible.current ? (
                            <EyeOffIcon size={20} />
                          ) : (
                            <EyeIcon size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <FuturisticInput
                          type={passwordVisible.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Ingresa tu nueva contraseña"
                          icon={<KeyIcon size={20} />}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPasswordVisible({
                              ...passwordVisible,
                              new: !passwordVisible.new,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        >
                          {passwordVisible.new ? (
                            <EyeOffIcon size={20} />
                          ) : (
                            <EyeIcon size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="relative">
                        <FuturisticInput
                          type={passwordVisible.confirm ? "text" : "password"}
                          value={passwordData.confirmNewPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmNewPassword: e.target.value,
                            })
                          }
                          placeholder="Confirma tu nueva contraseña"
                          icon={<KeyIcon size={20} />}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPasswordVisible({
                              ...passwordVisible,
                              confirm: !passwordVisible.confirm,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        >
                          {passwordVisible.confirm ? (
                            <EyeOffIcon size={20} />
                          ) : (
                            <EyeIcon size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    <FuturisticButton
                      type="submit"
                      glow
                      disabled={isLoading}
                      className="w-full"
                    >
                      <SaveIcon size={16} className="mr-2" />
                      {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                    </FuturisticButton>
                  </form>
                </FuturisticCardContent>
              )}
            </FuturisticCard>
          </div>

          {/* Sidebar - Account Info */}
          <div className="space-y-8">
            {/* Account Status */}
            <FuturisticCard
              variant="default"
              className="animate-in fade-in-50 duration-500 delay-300"
            >
              <FuturisticCardHeader>
                <div className="flex items-center space-x-3">
                  <ShieldIcon size={24} className="text-green-400" />
                  <FuturisticCardTitle>Estado de la Cuenta</FuturisticCardTitle>
                </div>
              </FuturisticCardHeader>
              <FuturisticCardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-sm text-slate-300">Estado</span>
                  <span className="text-green-400 font-medium">
                    {user.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <span className="text-sm text-slate-300">
                    Email Verificado
                  </span>
                  <span
                    className={
                      user.isEmailConfirmed
                        ? "text-green-400"
                        : "text-yellow-400"
                    }
                  >
                    {user.isEmailConfirmed ? "Sí" : "Pendiente"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <span className="text-sm text-slate-300">Rol</span>
                  <span className="text-sky-400 font-medium capitalize">
                    {user.role}
                  </span>
                </div>
              </FuturisticCardContent>
            </FuturisticCard>

            {/* Account Timeline */}
            <FuturisticCard
              variant="glass"
              className="animate-in fade-in-50 duration-500 delay-450"
            >
              <FuturisticCardHeader>
                <div className="flex items-center space-x-3">
                  <CalendarIcon size={24} className="text-purple-400" />
                  <FuturisticCardTitle>Timeline</FuturisticCardTitle>
                </div>
              </FuturisticCardHeader>
              <FuturisticCardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-sky-400 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm text-white font-medium">
                      Cuenta Creada
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>

                {user.lastLoginAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <div className="text-sm text-white font-medium">
                        Último Acceso
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDate(user.lastLoginAt)}
                      </div>
                    </div>
                  </div>
                )}
              </FuturisticCardContent>
            </FuturisticCard>

            {/* Profile Achievement */}
            <FuturisticCard
              variant="neon"
              className="animate-in fade-in-50 duration-500 delay-600"
            >
              <FuturisticCardHeader>
                <div className="flex items-center space-x-3">
                  <TrophyIcon size={24} className="text-yellow-400" />
                  <FuturisticCardTitle>Logro del Perfil</FuturisticCardTitle>
                </div>
              </FuturisticCardHeader>
              <FuturisticCardContent>
                <div className="text-center">
                  <div className="mb-3">
                    <UserIcon size={48} className="mx-auto text-sky-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">
                    Perfil Configurado
                  </h3>
                  <p className="text-sm text-slate-300">
                    ¡Has completado tu perfil en QuickAR!
                  </p>
                </div>
              </FuturisticCardContent>
            </FuturisticCard>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
