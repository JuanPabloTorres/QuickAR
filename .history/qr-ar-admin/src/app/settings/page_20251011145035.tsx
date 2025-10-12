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
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import {
  Bell,
  Globe,
  Key,
  Monitor,
  Save,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    name: "Admin Usuario",
    email: "admin@quickar.com",
    language: "es",
    theme: "dark",
    notifications: true,
    autoSave: true,
  });

  const languageOptions = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
  ];

  const themeOptions = [
    { value: "dark", label: "Tema Oscuro" },
    { value: "light", label: "Tema Claro" },
    { value: "auto", label: "Automático" },
  ];

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Guardando configuración:", settings);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-orbitron text-white mb-2">
          Configuración{" "}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            del Sistema
          </span>
        </h1>
        <p className="text-slate-300 font-manrope">
          Personaliza tu experiencia en QuickAR
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <FuturisticCard variant="glass">
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-sky-400" />
                Perfil de Usuario
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-4">
              <FuturisticInput
                label="Nombre Completo"
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
                variant="glass"
                icon={<User className="h-4 w-4" />}
              />
              <FuturisticInput
                label="Correo Electrónico"
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
                variant="glass"
                icon={<Key className="h-4 w-4" />}
              />
              <div className="flex space-x-4">
                <div className="flex-1">
                  <FuturisticSelect
                    label="Idioma"
                    options={languageOptions}
                    value={settings.language}
                    onChange={(e) =>
                      setSettings({ ...settings, language: e.target.value })
                    }
                    variant="glass"
                  />
                </div>
                <div className="flex-1">
                  <FuturisticSelect
                    label="Tema"
                    options={themeOptions}
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings({ ...settings, theme: e.target.value })
                    }
                    variant="glass"
                  />
                </div>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* System Preferences */}
          <FuturisticCard variant="neon">
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Monitor className="mr-2 h-5 w-5 text-sky-400" />
                Preferencias del Sistema
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-6">
              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-yellow-400" />
                    <div>
                      <div className="font-medium font-manrope text-white">
                        Notificaciones Push
                      </div>
                      <div className="text-sm text-slate-400">
                        Recibir notificaciones de nuevas visualizaciones
                      </div>
                    </div>
                  </div>
                  <FuturisticButton
                    variant={settings.notifications ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        notifications: !settings.notifications,
                      })
                    }
                  >
                    {settings.notifications ? "Activado" : "Desactivado"}
                  </FuturisticButton>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Save className="h-5 w-5 text-green-400" />
                    <div>
                      <div className="font-medium font-manrope text-white">
                        Guardado Automático
                      </div>
                      <div className="text-sm text-slate-400">
                        Guardar cambios automáticamente cada 30 segundos
                      </div>
                    </div>
                  </div>
                  <FuturisticButton
                    variant={settings.autoSave ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSettings({ ...settings, autoSave: !settings.autoSave })
                    }
                  >
                    {settings.autoSave ? "Activado" : "Desactivado"}
                  </FuturisticButton>
                </div>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* API Configuration */}
          <FuturisticCard variant="default">
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-sky-400" />
                Configuración de API
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-4">
              <FuturisticInput
                label="URL Base de API"
                value="https://localhost:5002"
                readOnly
                variant="neon"
                icon={<Globe className="h-4 w-4" />}
              />
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-medium font-manrope text-green-400">
                    Conectado al Backend
                  </div>
                  <div className="text-sm text-green-300">
                    Estado: Activo • Latencia: 12ms
                  </div>
                </div>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <FuturisticCard variant="glass" glow>
            <FuturisticCardHeader>
              <FuturisticCardTitle>Estadísticas Rápidas</FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 font-manrope">
                  Experiencias creadas
                </span>
                <span className="font-orbitron text-white font-bold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 font-manrope">
                  Tiempo en línea
                </span>
                <span className="font-orbitron text-white font-bold">47h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 font-manrope">
                  Último acceso
                </span>
                <span className="font-orbitron text-white font-bold">Hoy</span>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* Security */}
          <FuturisticCard variant="neon">
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-yellow-400" />
                Seguridad
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-3">
              <FuturisticButton
                variant="outline"
                className="w-full justify-start"
              >
                <Key className="mr-2 h-4 w-4" />
                Cambiar Contraseña
              </FuturisticButton>
              <FuturisticButton
                variant="ghost"
                className="w-full justify-start"
              >
                <Shield className="mr-2 h-4 w-4" />
                Autenticación 2FA
              </FuturisticButton>
              <FuturisticButton
                variant="ghost"
                className="w-full justify-start"
              >
                <Monitor className="mr-2 h-4 w-4" />
                Sesiones Activas
              </FuturisticButton>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* Save Button */}
          <FuturisticButton
            onClick={handleSave}
            className="w-full"
            size="lg"
            glow
          >
            <Save className="mr-2 h-5 w-5" />
            Guardar Configuración
          </FuturisticButton>
        </div>
      </div>
    </div>
  );
}
