"use client";

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
  AlertCircle,
  Book,
  Bug,
  Clock,
  HelpCircle,
  Lightbulb,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function Support() {
  const [ticket, setTicket] = useState({
    subject: "",
    category: "",
    priority: "",
    description: "",
    email: "",
  });

  const categories = [
    { value: "technical", label: "Problema Técnico" },
    { value: "billing", label: "Facturación" },
    { value: "feature", label: "Solicitud de Función" },
    { value: "bug", label: "Reporte de Error" },
    { value: "other", label: "Otro" },
  ];

  const priorities = [
    { value: "low", label: "Baja" },
    { value: "medium", label: "Media" },
    { value: "high", label: "Alta" },
    { value: "urgent", label: "Urgente" },
  ];

  const faqItems = [
    {
      question: "¿Cómo subo un modelo 3D a QuickAR?",
      answer:
        "Puedes subir modelos 3D en formato .glb o .gltf a través del panel de administración. Ve a 'Crear Experiencia' y selecciona tu archivo.",
      category: "getting-started",
    },
    {
      question: "¿Qué formatos de archivo son compatibles?",
      answer:
        "Soportamos modelos 3D (.glb, .gltf), imágenes (.jpg, .png, .webp) y videos (.mp4, .webm) para experiencias AR.",
      category: "technical",
    },
    {
      question: "¿Cómo genero un código QR para mi experiencia?",
      answer:
        "Una vez creada tu experiencia AR, se genera automáticamente un código QR único que puedes descargar desde el dashboard.",
      category: "getting-started",
    },
    {
      question: "¿La plataforma funciona en todos los dispositivos móviles?",
      answer:
        "QuickAR es compatible con dispositivos iOS y Android modernos que soporten WebXR o AR Core/ARKit.",
      category: "technical",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement ticket submission
    console.log("Submitting support ticket:", ticket);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold font-orbitron text-white mb-2">
          Centro de{" "}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Soporte
          </span>
        </h1>
        <p className="text-slate-300 font-manrope mb-6">
          Estamos aquí para ayudarte con cualquier pregunta o problema
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: "Chat en Vivo",
            description: "Respuesta inmediata",
            icon: <MessageCircle className="h-6 w-6 text-green-400" />,
            variant: "glass" as const,
            status: "En línea",
          },
          {
            title: "Enviar Ticket",
            description: "Soporte detallado",
            icon: <Mail className="h-6 w-6 text-blue-400" />,
            variant: "neon" as const,
            status: "24/7",
          },
          {
            title: "Documentación",
            description: "Guías y tutoriales",
            icon: <Book className="h-6 w-6 text-purple-400" />,
            variant: "default" as const,
            status: "Siempre disponible",
          },
          {
            title: "Comunidad",
            description: "Foro de usuarios",
            icon: <Users className="h-6 w-6 text-yellow-400" />,
            variant: "glass" as const,
            status: "Activa",
          },
        ].map((action, index) => (
          <FuturisticCard key={index} variant={action.variant}>
            <FuturisticCardContent className="text-center p-4">
              <div className="flex justify-center mb-3">{action.icon}</div>
              <h3 className="font-bold font-orbitron text-white text-sm mb-1">
                {action.title}
              </h3>
              <p className="text-xs text-slate-300 font-manrope mb-2">
                {action.description}
              </p>
              <span className="inline-block px-2 py-1 bg-sky-500/20 text-sky-300 text-xs rounded-full font-manrope">
                {action.status}
              </span>
            </FuturisticCardContent>
          </FuturisticCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Ticket Form */}
        <div className="lg:col-span-2 space-y-6">
          <FuturisticCard variant="glass" glow>
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Send className="mr-2 h-5 w-5 text-sky-400" />
                Crear Ticket de Soporte
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FuturisticSelect
                    label="Categoría"
                    options={categories}
                    value={ticket.category}
                    onChange={(e) =>
                      setTicket({ ...ticket, category: e.target.value })
                    }
                    variant="glass"
                    required
                  />
                  <FuturisticSelect
                    label="Prioridad"
                    options={priorities}
                    value={ticket.priority}
                    onChange={(e) =>
                      setTicket({ ...ticket, priority: e.target.value })
                    }
                    variant="glass"
                    required
                  />
                </div>

                <FuturisticInput
                  label="Asunto"
                  placeholder="Describe brevemente tu problema..."
                  value={ticket.subject}
                  onChange={(e) =>
                    setTicket({ ...ticket, subject: e.target.value })
                  }
                  variant="glass"
                  icon={<HelpCircle className="h-4 w-4" />}
                  required
                />

                <FuturisticInput
                  label="Correo de Contacto"
                  type="email"
                  placeholder="tu@email.com"
                  value={ticket.email}
                  onChange={(e) =>
                    setTicket({ ...ticket, email: e.target.value })
                  }
                  variant="glass"
                  icon={<Mail className="h-4 w-4" />}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-white font-manrope mb-2">
                    Descripción Detallada
                  </label>
                  <textarea
                    value={ticket.description}
                    onChange={(e) =>
                      setTicket({ ...ticket, description: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 backdrop-blur-sm font-manrope"
                    placeholder="Describe tu problema en detalle. Incluye pasos para reproducir el error, mensajes de error, o cualquier información relevante..."
                    required
                  />
                </div>

                <FuturisticButton
                  type="submit"
                  className="w-full"
                  size="lg"
                  glow
                >
                  <Send className="mr-2 h-5 w-5" />
                  Enviar Ticket de Soporte
                </FuturisticButton>
              </form>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* FAQ Section */}
          <FuturisticCard variant="neon">
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-sky-400" />
                Preguntas Frecuentes
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent>
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <h4 className="font-medium font-orbitron text-white mb-2 flex items-start">
                      <HelpCircle className="h-4 w-4 text-sky-400 mr-2 mt-0.5 flex-shrink-0" />
                      {item.question}
                    </h4>
                    <p className="text-sm text-slate-300 font-manrope ml-6">
                      {item.answer}
                    </p>
                  </div>
                ))}

                <FuturisticButton variant="outline" className="w-full">
                  <Book className="mr-2 h-4 w-4" />
                  Ver Todas las Preguntas Frecuentes
                </FuturisticButton>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <FuturisticCard variant="default">
            <FuturisticCardHeader>
              <FuturisticCardTitle>Contacto Directo</FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <Mail className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="font-medium font-manrope text-white text-sm">
                    Email
                  </div>
                  <div className="text-xs text-slate-400 font-manrope">
                    support@quickar.com
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <Phone className="h-5 w-5 text-green-400" />
                <div>
                  <div className="font-medium font-manrope text-white text-sm">
                    Teléfono
                  </div>
                  <div className="text-xs text-slate-400 font-manrope">
                    +1 (555) 123-4567
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <Clock className="h-5 w-5 text-yellow-400" />
                <div>
                  <div className="font-medium font-manrope text-white text-sm">
                    Horario
                  </div>
                  <div className="text-xs text-slate-400 font-manrope">
                    Lun-Vie 9:00-18:00
                  </div>
                </div>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* System Status */}
          <FuturisticCard variant="glass" glow>
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-sky-400" />
                Estado del Sistema
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 font-manrope">
                  API Backend
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400 font-manrope">
                    Operativo
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 font-manrope">
                  Base de Datos
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400 font-manrope">
                    Operativo
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 font-manrope">
                  CDN de Archivos
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400 font-manrope">
                    Operativo
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 font-manrope">
                  Servicio AR
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-yellow-400 font-manrope">
                    Mantenimiento
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <FuturisticButton variant="ghost" size="sm" className="w-full">
                  Ver Estado Completo
                </FuturisticButton>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* Known Issues */}
          <FuturisticCard variant="neon">
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-orange-400" />
                Problemas Conocidos
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-center mb-1">
                  <Bug className="h-4 w-4 text-orange-400 mr-2" />
                  <span className="text-sm font-medium font-manrope text-orange-400">
                    Carga de modelos grandes
                  </span>
                </div>
                <p className="text-xs text-orange-300 font-manrope">
                  Archivos superiores a 50MB pueden tardar más en procesar.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center mb-1">
                  <AlertCircle className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-sm font-medium font-manrope text-blue-400">
                    Navegadores iOS Safari
                  </span>
                </div>
                <p className="text-xs text-blue-300 font-manrope">
                  Algunas funciones AR requieren iOS 14.3 o superior.
                </p>
              </div>

              <FuturisticButton variant="ghost" size="sm" className="w-full">
                Ver Todos los Reportes
              </FuturisticButton>
            </FuturisticCardContent>
          </FuturisticCard>
        </div>
      </div>
    </div>
  );
}
