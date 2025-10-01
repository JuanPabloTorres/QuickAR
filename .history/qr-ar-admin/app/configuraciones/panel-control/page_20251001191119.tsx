"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormTextarea } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  Check,
  ChevronRight,
  Clock,
  Code,
  CreditCard,
  Database,
  Download,
  Eye,
  FileText,
  Globe,
  HardDrive,
  Layout,
  Link as LinkIcon,
  Lock,
  Palette,
  Receipt,
  Save,
  Settings,
  Share2,
  Shield,
  Sparkles,
  User,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

type SettingsTab =
  | "profile"
  | "security"
  | "notifications"
  | "language"
  | "ar-config"
  | "templates"
  | "limits"
  | "qr-config"
  | "api"
  | "integrations"
  | "export"
  | "social"
  | "plan"
  | "payment"
  | "invoices"
  | "usage"
  | "members"
  | "roles"
  | "workspace"
  | "domains"
  | "analytics"
  | "logs"
  | "cache"
  | "theme"
  | "accessibility"
  | "timezone"
  | "backup";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaving, setIsSaving] = useState(false);

  const settingsSections = [
    {
      title: "Configuración de Cuenta",
      icon: User,
      items: [
        {
          id: "profile" as SettingsTab,
          label: "Perfil de Usuario",
          icon: User,
        },
        {
          id: "security" as SettingsTab,
          label: "Seguridad y Privacidad",
          icon: Shield,
        },
        {
          id: "notifications" as SettingsTab,
          label: "Notificaciones",
          icon: Bell,
        },
        {
          id: "language" as SettingsTab,
          label: "Preferencias de Idioma",
          icon: Globe,
        },
      ],
    },
    {
      title: "Configuración de Experiencias",
      icon: Settings,
      items: [
        {
          id: "ar-config" as SettingsTab,
          label: "Configuración General de AR",
          icon: Layout,
        },
        {
          id: "templates" as SettingsTab,
          label: "Plantillas Predeterminadas",
          icon: FileText,
        },
        {
          id: "limits" as SettingsTab,
          label: "Límites y Cuotas",
          icon: Activity,
        },
        {
          id: "qr-config" as SettingsTab,
          label: "Configuración de QR Codes",
          icon: Zap,
        },
      ],
    },
    {
      title: "Configuración de Integración",
      icon: Code,
      items: [
        { id: "api" as SettingsTab, label: "API y Webhooks", icon: Code },
        {
          id: "integrations" as SettingsTab,
          label: "Integraciones de Terceros",
          icon: LinkIcon,
        },
        {
          id: "export" as SettingsTab,
          label: "Exportación de Datos",
          icon: Download,
        },
        {
          id: "social" as SettingsTab,
          label: "Conectar con Redes Sociales",
          icon: Share2,
        },
      ],
    },
    {
      title: "Configuración de Facturación",
      icon: CreditCard,
      items: [
        {
          id: "plan" as SettingsTab,
          label: "Plan y Suscripción",
          icon: CreditCard,
        },
        {
          id: "payment" as SettingsTab,
          label: "Métodos de Pago",
          icon: CreditCard,
        },
        {
          id: "invoices" as SettingsTab,
          label: "Historial de Facturas",
          icon: Receipt,
        },
        { id: "usage" as SettingsTab, label: "Uso y Límites", icon: Activity },
      ],
    },
    {
      title: "Configuración de Equipo",
      icon: Users,
      items: [
        {
          id: "members" as SettingsTab,
          label: "Gestión de Miembros",
          icon: Users,
        },
        { id: "roles" as SettingsTab, label: "Roles y Permisos", icon: Lock },
        {
          id: "workspace" as SettingsTab,
          label: "Espacios de Trabajo",
          icon: Briefcase,
        },
      ],
    },
    {
      title: "Configuración Técnica",
      icon: Database,
      items: [
        {
          id: "domains" as SettingsTab,
          label: "Dominios Personalizados",
          icon: Globe,
        },
        {
          id: "analytics" as SettingsTab,
          label: "Analíticas Avanzadas",
          icon: BarChart3,
        },
        {
          id: "logs" as SettingsTab,
          label: "Logs de Actividad",
          icon: FileText,
        },
        {
          id: "cache" as SettingsTab,
          label: "Configuración de Caché",
          icon: Database,
        },
      ],
    },
    {
      title: "Otras Configuraciones",
      icon: Settings,
      items: [
        {
          id: "theme" as SettingsTab,
          label: "Apariencia y Tema",
          icon: Palette,
        },
        {
          id: "accessibility" as SettingsTab,
          label: "Accesibilidad",
          icon: Eye,
        },
        {
          id: "timezone" as SettingsTab,
          label: "Zona Horaria y Región",
          icon: Clock,
        },
        {
          id: "backup" as SettingsTab,
          label: "Respaldo y Recuperación",
          icon: HardDrive,
        },
      ],
    },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Perfil de Usuario
              </h2>
              <p className="text-gray-400">
                Gestiona tu información personal y foto de perfil
              </p>
            </div>

            <div className="flex items-center gap-6 p-6 bg-[#1a2942]/30 rounded-xl">
              <div className="w-24 h-24 bg-gradient-to-br from-[#3DD8B6] to-[#00D4FF] rounded-full flex items-center justify-center text-3xl font-bold text-white">
                JP
              </div>
              <div>
                <Button className="bg-[#3DD8B6] hover:bg-[#3DD8B6]/90 text-[#0F1C2E] font-bold">
                  Cambiar Foto
                </Button>
                <p className="text-gray-400 text-sm mt-2">
                  JPG, PNG o GIF. Máx 2MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Nombre
                </label>
                <Input
                  defaultValue="Juan"
                  className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white"
                />
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Apellido
                </label>
                <Input
                  defaultValue="Pérez"
                  className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-white font-semibold mb-2 block">
                Email
              </label>
              <Input
                defaultValue="juan@ejemplo.com"
                type="email"
                className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white"
              />
            </div>

            <div>
              <label className="text-white font-semibold mb-2 block">
                Biografía
              </label>
              <div>
                <FormTextarea label="" name="bio" />

                <p className="text-gray-400 text-sm mt-2">
                  Máximo 200 caracteres
                </p>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Seguridad y Privacidad
              </h2>
              <p className="text-gray-400">
                Protege tu cuenta y gestiona tu privacidad
              </p>
            </div>

            <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Cambiar Contraseña
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white font-semibold mb-2 block">
                      Contraseña Actual
                    </label>
                    <Input
                      type="password"
                      className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-2 block">
                      Nueva Contraseña
                    </label>
                    <Input
                      type="password"
                      className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white font-semibold mb-2 block">
                      Confirmar Nueva Contraseña
                    </label>
                    <Input
                      type="password"
                      className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Autenticación de Dos Factores (2FA)
                </h3>
                <div className="flex items-center justify-between p-4 bg-[#1a2942]/30 rounded-xl">
                  <div>
                    <p className="text-white font-semibold">2FA Desactivado</p>
                    <p className="text-gray-400 text-sm">
                      Añade una capa extra de seguridad
                    </p>
                  </div>
                  <Button className="bg-[#3DD8B6] hover:bg-[#3DD8B6]/90 text-[#0F1C2E] font-bold">
                    Activar 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Sesiones Activas
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      device: "Chrome en Windows",
                      location: "San Francisco, CA",
                      current: true,
                    },
                    {
                      device: "Safari en iPhone",
                      location: "San Francisco, CA",
                      current: false,
                    },
                  ].map((session, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-[#1a2942]/30 rounded-xl"
                    >
                      <div>
                        <p className="text-white font-semibold">
                          {session.device}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {session.location}
                        </p>
                      </div>
                      {session.current ? (
                        <span className="px-3 py-1 bg-[#3DD8B6]/20 text-[#3DD8B6] rounded-full text-sm font-semibold">
                          Sesión Actual
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-400"
                        >
                          Cerrar Sesión
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Notificaciones
              </h2>
              <p className="text-gray-400">
                Gestiona cómo y cuándo recibes notificaciones
              </p>
            </div>

            {[
              {
                title: "Nuevas experiencias",
                desc: "Notificar cuando se crea una nueva experiencia",
              },
              {
                title: "Escaneos de QR",
                desc: "Alertas de nuevos escaneos de códigos QR",
              },
              {
                title: "Actualizaciones del sistema",
                desc: "Información sobre nuevas funciones y mejoras",
              },
              {
                title: "Recordatorios de facturación",
                desc: "Avisos sobre pagos y renovaciones",
              },
              {
                title: "Actividad del equipo",
                desc: "Notificar cambios realizados por otros miembros",
              },
            ].map((notif, i) => (
              <Card
                key={i}
                className="border-2 border-[#1a2942] bg-[#0F1C2E]/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold mb-1">
                        {notif.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{notif.desc}</p>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-[#1a2942] bg-[#0F1C2E] text-[#3DD8B6]"
                          defaultChecked
                        />
                        <span className="text-white text-sm">Email</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-[#1a2942] bg-[#0F1C2E] text-[#3DD8B6]"
                        />
                        <span className="text-white text-sm">Push</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "plan":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Plan y Suscripción
              </h2>
              <p className="text-gray-400">
                Gestiona tu plan actual y explora opciones
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Free",
                  price: "$0",
                  features: [
                    "5 experiencias",
                    "100 QR scans/mes",
                    "1 GB storage",
                  ],
                  current: true,
                },
                {
                  name: "Pro",
                  price: "$29",
                  features: [
                    "50 experiencias",
                    "10,000 QR scans/mes",
                    "10 GB storage",
                    "Analytics avanzadas",
                  ],
                  current: false,
                },
                {
                  name: "Enterprise",
                  price: "$99",
                  features: [
                    "Ilimitadas experiencias",
                    "QR scans ilimitados",
                    "100 GB storage",
                    "Soporte prioritario",
                  ],
                  current: false,
                },
              ].map((plan, i) => (
                <Card
                  key={i}
                  className={`border-2 ${
                    plan.current
                      ? "border-[#3DD8B6] shadow-xl shadow-[#3DD8B6]/20"
                      : "border-[#1a2942]"
                  } bg-[#0F1C2E]/50`}
                >
                  <CardContent className="p-6 text-center">
                    {plan.current && (
                      <span className="px-3 py-1 bg-[#3DD8B6] text-[#0F1C2E] rounded-full text-xs font-bold mb-4 inline-block">
                        Plan Actual
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF]">
                        {plan.price}
                      </span>
                      <span className="text-gray-400">/mes</span>
                    </div>
                    <ul className="space-y-2 mb-6 text-left">
                      {plan.features.map((feature, j) => (
                        <li
                          key={j}
                          className="flex items-center gap-2 text-gray-300"
                        >
                          <Check className="w-4 h-4 text-[#3DD8B6]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={
                        plan.current
                          ? "bg-[#1a2942] text-white"
                          : "bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] text-[#0F1C2E] font-bold"
                      }
                    >
                      {plan.current ? "Plan Actual" : "Actualizar"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-20">
            <Sparkles className="w-20 h-20 text-[#3DD8B6] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Configuración en Desarrollo
            </h2>
            <p className="text-gray-400 text-lg">
              Esta sección estará disponible pronto
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1C2E] to-[#0a1520] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500 mb-2">
            Configuración
          </h1>
          <p className="text-gray-400 text-lg">
            Personaliza tu experiencia y gestiona tu cuenta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl sticky top-4">
              <CardContent className="p-4">
                <div className="space-y-6">
                  {settingsSections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const IconComponent = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setActiveTab(item.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                isActive
                                  ? "bg-gradient-to-r from-[#3DD8B6]/20 to-[#00D4FF]/20 text-[#3DD8B6] border-2 border-[#3DD8B6]/50"
                                  : "text-gray-400 hover:text-white hover:bg-[#1a2942]/30"
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                              <span className="text-sm font-medium flex-1 text-left truncate">
                                {item.label}
                              </span>
                              {isActive && <ChevronRight className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl">
              <CardContent className="p-8">
                {renderContent()}

                {/* Save Button */}
                {activeTab !== "plan" && (
                  <div className="mt-8 pt-6 border-t-2 border-[#1a2942] flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500 hover:from-[#3DD8B6]/90 hover:via-[#00D4FF]/90 hover:to-purple-500/90 text-[#0F1C2E] font-bold px-8 py-6 text-lg rounded-2xl"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-3 border-[#0F1C2E] border-t-transparent rounded-full animate-spin mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
