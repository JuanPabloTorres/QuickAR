"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Clock,
  Facebook,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  Twitter,
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      info: "soporte@qrar.app",
      subInfo: "ventas@qrar.app",
      color: "#3DD8B6",
      action: "mailto:soporte@qrar.app",
    },
    {
      icon: Phone,
      title: "Teléfono",
      info: "+1 (555) 123-4567",
      subInfo: "Lun - Vie, 9am - 6pm EST",
      color: "#00D4FF",
      action: "tel:+15551234567",
    },
    {
      icon: MapPin,
      title: "Oficina",
      info: "123 AR Street, Suite 100",
      subInfo: "San Francisco, CA 94102",
      color: "purple-500",
      action: "https://maps.google.com",
    },
  ];

  const socialLinks = [
    {
      icon: Twitter,
      name: "Twitter",
      href: "https://twitter.com/qrar",
      color: "#1DA1F2",
    },
    {
      icon: Linkedin,
      name: "LinkedIn",
      href: "https://linkedin.com/company/qrar",
      color: "#0A66C2",
    },
    {
      icon: Github,
      name: "GitHub",
      href: "https://github.com/qrar",
      color: "#333",
    },
    {
      icon: Facebook,
      name: "Facebook",
      href: "https://facebook.com/qrar",
      color: "#1877F2",
    },
  ];

  const officeHours = [
    { day: "Lunes - Viernes", hours: "9:00 AM - 6:00 PM" },
    { day: "Sábado", hours: "10:00 AM - 2:00 PM" },
    { day: "Domingo", hours: "Cerrado" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      subject: "",
      message: "",
    });

    // Resetear mensaje de éxito después de 5 segundos
    setTimeout(() => setSubmitted(false), 5000);
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
              <MessageCircle className="w-12 h-12 text-[#3DD8B6]" />
              <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500">
                Contáctanos
              </h1>
              <Sparkles className="w-12 h-12 text-[#00D4FF]" />
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos
              pronto
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-3">
                  <Send className="w-7 h-7 text-[#3DD8B6]" />
                  Envíanos un Mensaje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="py-12 text-center animate-in zoom-in duration-500">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#3DD8B6] to-[#00D4FF] rounded-full mb-6">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      ¡Mensaje Enviado!
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Gracias por contactarnos. Te responderemos pronto.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      className="bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] text-[#0F1C2E] font-bold"
                    >
                      Enviar Otro Mensaje
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-white font-semibold mb-2 block">
                          Nombre Completo *
                        </label>
                        <Input
                          type="text"
                          placeholder="Juan Pérez"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white placeholder-gray-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-white font-semibold mb-2 block">
                          Email *
                        </label>
                        <Input
                          type="email"
                          placeholder="juan@ejemplo.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white placeholder-gray-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-white font-semibold mb-2 block">
                          Teléfono
                        </label>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="text-white font-semibold mb-2 block">
                          Empresa
                        </label>
                        <Input
                          type="text"
                          placeholder="Tu Empresa S.A."
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              company: e.target.value,
                            })
                          }
                          className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-white font-semibold mb-2 block">
                        Asunto *
                      </label>
                      <Input
                        type="text"
                        placeholder="¿En qué podemos ayudarte?"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white placeholder-gray-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-white font-semibold mb-2 block">
                        Mensaje *
                      </label>
                      <textarea
                        placeholder="Cuéntanos más sobre tu consulta..."
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
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500 hover:from-[#3DD8B6]/90 hover:via-[#00D4FF]/90 hover:to-purple-500/90 text-[#0F1C2E] font-bold text-lg py-6 rounded-2xl disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-3 border-[#0F1C2E] border-t-transparent rounded-full animate-spin mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Enviar Mensaje
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <a
                      key={index}
                      href={item.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 p-4 bg-[#1a2942]/30 hover:bg-[#1a2942]/50 rounded-xl transition-all hover:scale-105 group"
                    >
                      <div className="p-3 bg-[#3DD8B6]/20 rounded-xl group-hover:scale-110 transition-transform">
                        <IconComponent className="w-6 h-6 text-[#3DD8B6]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">
                          {item.title}
                        </h4>
                        <p className="text-[#3DD8B6] text-sm font-medium">
                          {item.info}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {item.subInfo}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Clock className="w-6 h-6 text-[#00D4FF]" />
                  Horario de Atención
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {officeHours.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-[#1a2942]/30 rounded-lg"
                  >
                    <span className="text-gray-400 font-medium">
                      {schedule.day}
                    </span>
                    <span className="text-white font-bold">
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Globe className="w-6 h-6 text-[#3DD8B6]" />
                  Síguenos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-[#1a2942]/30 hover:bg-[#1a2942]/50 rounded-xl transition-all hover:scale-105 group"
                      >
                        <IconComponent className="w-5 h-5 text-[#3DD8B6] group-hover:scale-110 transition-transform" />
                        <span className="text-white text-sm font-semibold">
                          {social.name}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-96 bg-gradient-to-br from-[#1a2942] to-[#0F1C2E] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-[#3DD8B6] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Nuestra Ubicación
                </h3>
                <p className="text-gray-400 mb-4">
                  123 AR Street, Suite 100
                  <br />
                  San Francisco, CA 94102
                </p>
                <Button className="bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] text-[#0F1C2E] font-bold">
                  Ver en Google Maps
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
