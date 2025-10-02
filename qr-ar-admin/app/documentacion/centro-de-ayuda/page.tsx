"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Book,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Lightbulb,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Send,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function HelpDeskPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const categories = [
    {
      icon: Book,
      title: "Primeros Pasos",
      description: "Aprende lo básico para comenzar",
      color: "#3DD8B6",
      articles: 12,
    },
    {
      icon: Video,
      title: "Tutoriales",
      description: "Videos y guías paso a paso",
      color: "#00D4FF",
      articles: 8,
    },
    {
      icon: Zap,
      title: "Características",
      description: "Descubre todas las funciones",
      color: "purple-500",
      articles: 15,
    },
    {
      icon: Users,
      title: "Casos de Uso",
      description: "Ejemplos e inspiración",
      color: "pink-500",
      articles: 10,
    },
  ];

  const faqs = [
    {
      question: "¿Cómo creo mi primera experiencia AR?",
      answer:
        "Ve a la sección 'Experiencias', haz clic en 'Nueva Experiencia', completa el formulario con título y descripción, y luego agrega assets (modelos 3D, imágenes, videos o mensajes). Una vez guardada, se generará automáticamente un código QR.",
    },
    {
      question: "¿Qué formatos de archivo son compatibles?",
      answer:
        "Para modelos 3D: .glb y .gltf. Para imágenes: .jpg, .png, .gif. Para videos: .mp4, .webm. Recomendamos mantener los archivos optimizados para mejor rendimiento.",
    },
    {
      question: "¿Cómo funciona el escaneo del código QR?",
      answer:
        "Los usuarios escanean el QR con la cámara de su smartphone. Esto los redirige a una URL donde se carga la experiencia AR. El navegador solicitará permisos de cámara para activar la realidad aumentada.",
    },
    {
      question: "¿Puedo editar una experiencia después de crearla?",
      answer:
        "Sí, puedes editar título, descripción, agregar o eliminar assets en cualquier momento. Los cambios se reflejan inmediatamente en el código QR existente.",
    },
    {
      question: "¿Qué dispositivos son compatibles?",
      answer:
        "Smartphones y tablets con iOS 12+ o Android 8+. La mayoría de dispositivos modernos tienen capacidad AR. Se requiere navegador compatible (Safari, Chrome).",
    },
    {
      question: "¿Cómo veo las estadísticas de mis experiencias?",
      answer:
        "Ve a la sección 'Analytics' donde encontrarás métricas sobre escaneos de QR, visualizaciones, tiempo de interacción y más datos de cada experiencia.",
    },
    {
      question: "¿Puedo desactivar una experiencia temporalmente?",
      answer:
        "Sí, cada experiencia tiene un toggle de estado activo/inactivo. Cuando está inactiva, el QR mostrará un mensaje indicando que la experiencia no está disponible.",
    },
    {
      question: "¿Hay límite de experiencias que puedo crear?",
      answer:
        "Depende de tu plan. El plan gratuito permite hasta 5 experiencias activas. Los planes premium ofrecen experiencias ilimitadas y funciones adicionales.",
    },
  ];

  const quickLinks = [
    { icon: FileText, label: "Documentación", href: "/docs" },
    { icon: Video, label: "Video Tutoriales", href: "/tutorials" },
    { icon: MessageCircle, label: "Comunidad", href: "/community" },
    { icon: Phone, label: "Contacto", href: "/contact" },
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "soporte@qrar.app",
      detail: "Te responderemos en 24 horas",
      action: "Enviar Email",
      color: "#3DD8B6",
    },
    {
      icon: MessageCircle,
      title: "Chat en Vivo",
      description: "Disponible 9am - 6pm",
      detail: "Lunes a Viernes",
      action: "Iniciar Chat",
      color: "#00D4FF",
    },
    {
      icon: Phone,
      title: "Teléfono",
      description: "+1 (555) 123-4567",
      detail: "Horario de oficina",
      action: "Llamar Ahora",
      color: "purple-500",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Aquí iría la lógica para enviar el formulario
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1C2E] to-[#0a1520] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Hero Header */}
        <div className="relative p-12 rounded-3xl bg-gradient-to-br from-[#0F1C2E] via-[#1a2942] to-[#0F1C2E] overflow-hidden border-2 border-[#3DD8B6]/30 shadow-2xl shadow-[#3DD8B6]/20">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3DD8B6]/20 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00D4FF]/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <HelpCircle className="w-12 h-12 text-[#3DD8B6]" />
              <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500">
                Centro de Ayuda
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Encuentra respuestas, tutoriales y soporte para tus experiencias
              AR
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Busca en la ayuda... ej: 'cómo crear experiencia'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] rounded-2xl text-white placeholder-gray-500 text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <button
                key={index}
                className="p-6 bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl border-2 border-[#1a2942] hover:border-[#3DD8B6]/50 rounded-2xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#3DD8B6]/20 group"
              >
                <IconComponent className="w-8 h-8 text-[#3DD8B6] mb-3 mx-auto group-hover:scale-110 transition-transform" />
                <p className="text-white font-semibold text-center">
                  {link.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Book className="w-8 h-8 text-[#3DD8B6]" />
            Categorías de Ayuda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card
                  key={index}
                  className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl hover:border-[#3DD8B6]/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#3DD8B6]/20 group cursor-pointer"
                >
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-[#3DD8B6]/20 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-8 h-8 text-[#3DD8B6]" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {category.description}
                    </p>
                    <div className="inline-flex items-center gap-2 text-[#3DD8B6] text-sm font-semibold">
                      <span>{category.articles} artículos</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              <Lightbulb className="w-7 h-7 text-[#00D4FF]" />
              Preguntas Frecuentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-2 border-[#1a2942] hover:border-[#3DD8B6]/30 rounded-xl transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-[#1a2942]/30 transition-all"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle2 className="w-5 h-5 text-[#3DD8B6] mt-0.5 flex-shrink-0" />
                      <span className="font-semibold text-white">
                        {faq.question}
                      </span>
                    </div>
                    {openFaq === index ? (
                      <ChevronDown className="w-5 h-5 text-[#3DD8B6] flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5 pt-2 bg-[#0F1C2E]/50 animate-in slide-in-from-top">
                      <p className="text-gray-400 leading-relaxed pl-8">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Methods */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-[#3DD8B6]" />
            Métodos de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <Card
                  key={index}
                  className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl hover:border-[#3DD8B6]/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#3DD8B6]/20 group"
                >
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-gradient-to-br from-[#3DD8B6]/20 to-[#00D4FF]/20 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-8 h-8 text-[#3DD8B6]" />
                    </div>
                    <h3 className="font-bold text-white text-xl mb-2">
                      {method.title}
                    </h3>
                    <p className="text-[#3DD8B6] font-semibold mb-1">
                      {method.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{method.detail}</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] hover:from-[#3DD8B6]/90 hover:to-[#00D4FF]/90 text-[#0F1C2E] font-bold">
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              <Send className="w-7 h-7 text-[#3DD8B6]" />
              Envíanos un Mensaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Nombre
                  </label>
                  <Input
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Asunto
                </label>
                <Input
                  type="text"
                  placeholder="¿En qué podemos ayudarte?"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white"
                  required
                />
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Mensaje
                </label>
                <textarea
                  placeholder="Describe tu pregunta o problema..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-3 bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] rounded-xl text-white placeholder-gray-500 focus:ring-0 transition-all"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full md:w-auto bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500 hover:from-[#3DD8B6]/90 hover:via-[#00D4FF]/90 hover:to-purple-500/90 text-[#0F1C2E] font-bold text-lg px-8 py-6 rounded-2xl"
              >
                <Send className="w-5 h-5 mr-2" />
                Enviar Mensaje
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
