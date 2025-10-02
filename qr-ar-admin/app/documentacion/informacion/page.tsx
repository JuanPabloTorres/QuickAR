"use client";

import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Eye,
  Hand,
  Info,
  Play,
  QrCode,
  RotateCcw,
  Scan,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function InformacionPage() {
  const router = useRouter();

  const steps = [
    {
      number: 1,
      icon: QrCode,
      title: "Escanea el Código QR",
      description: "Abre la cámara de tu teléfono o una app de escaneo QR",
      tips: [
        "Asegúrate de tener buena iluminación",
        "Mantén el código a unos 20-30 cm de distancia",
      ],
      color: "#3DD8B6",
      gradient: "from-[#3DD8B6] to-[#00D4FF]",
    },
    {
      number: 2,
      icon: Camera,
      title: "Permite el Acceso a la Cámara",
      description: "Autoriza el acceso cuando tu navegador lo solicite",
      tips: [
        "Es necesario para activar la realidad aumentada",
        "Tus datos están protegidos y no se almacenan",
      ],
      color: "#00D4FF",
      gradient: "from-[#00D4FF] to-purple-500",
    },
    {
      number: 3,
      icon: Scan,
      title: "Apunta al Espacio",
      description: "Mueve tu dispositivo lentamente para detectar superficies",
      tips: [
        "Busca superficies planas como mesas o pisos",
        "Mantén el teléfono estable durante el escaneo",
      ],
      color: "purple-500",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      number: 4,
      icon: Hand,
      title: "Interactúa con el Contenido",
      description: "Toca, rota o mueve los objetos virtuales",
      tips: [
        "Usa un dedo para rotar",
        "Pellizca para hacer zoom",
        "Arrastra para mover objetos",
      ],
      color: "pink-500",
      gradient: "from-pink-500 to-[#3DD8B6]",
    },
  ];

  const requirements = [
    {
      icon: Smartphone,
      title: "Dispositivo Compatible",
      description: "Smartphone o tablet con iOS 12+ o Android 8+",
      status: "required",
    },
    {
      icon: Camera,
      title: "Cámara Funcional",
      description:
        "Cámara trasera con capacidad AR (mayoría de dispositivos modernos)",
      status: "required",
    },
    {
      icon: Eye,
      title: "Buena Iluminación",
      description: "Ambiente bien iluminado para mejor detección",
      status: "recommended",
    },
    {
      icon: Zap,
      title: "Conexión a Internet",
      description: "WiFi o datos móviles para cargar contenido",
      status: "required",
    },
  ];

  const troubleshooting = [
    {
      problem: "La cámara no se activa",
      solution:
        "Verifica que hayas dado permisos de cámara en la configuración del navegador",
    },
    {
      problem: "No detecta superficies",
      solution:
        "Mueve el dispositivo más lentamente y busca áreas con mejor iluminación",
    },
    {
      problem: "El contenido no aparece",
      solution:
        "Recarga la página y asegúrate de tener conexión a internet estable",
    },
    {
      problem: "La experiencia está lenta",
      solution:
        "Cierra otras apps en segundo plano y asegúrate de tener batería suficiente",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1C2E] to-[#0a1520] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Hero Header */}
        <div className="relative p-12 rounded-3xl bg-gradient-to-br from-[#0F1C2E] via-purple-900/20 to-[#0F1C2E] overflow-hidden border-2 border-[#3DD8B6]/30 shadow-2xl shadow-[#3DD8B6]/20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3DD8B6]/5 via-transparent to-[#00D4FF]/5 animate-pulse"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3DD8B6]/20 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00D4FF]/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <Info className="w-10 h-10 text-[#3DD8B6] animate-pulse" />
              <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500">
                Guía de Experiencia AR
              </h1>
              <Sparkles className="w-10 h-10 text-[#00D4FF] animate-spin-slow" />
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Todo lo que necesitas saber para disfrutar de realidad aumentada
            </p>
          </div>
        </div>

        {/* Pasos de Uso */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Play className="w-8 h-8 text-[#3DD8B6]" />
            Cómo Usar la Experiencia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <AnimatedCard
                  key={step.number}
                  index={index}
                  className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl hover:border-[#3DD8B6]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#3DD8B6]/20 group overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>

                  <CardHeader className="relative z-10">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-4 bg-gradient-to-br ${step.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF]">
                            {step.number}
                          </span>
                          <CardTitle className="text-xl text-white">
                            {step.title}
                          </CardTitle>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#3DD8B6] mb-3">
                        💡 Tips:
                      </p>
                      {step.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#3DD8B6] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-400">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </AnimatedCard>
              );
            })}
          </div>
        </div>

        {/* Requisitos */}
        <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-[#3DD8B6]" />
              Requisitos del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((req, index) => {
                const IconComponent = req.icon;
                const isRequired = req.status === "required";
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all hover:scale-105",
                      isRequired
                        ? "bg-[#3DD8B6]/10 border-[#3DD8B6]/30 hover:border-[#3DD8B6]/50"
                        : "bg-[#00D4FF]/10 border-[#00D4FF]/30 hover:border-[#00D4FF]/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          isRequired ? "bg-[#3DD8B6]/20" : "bg-[#00D4FF]/20"
                        )}
                      >
                        <IconComponent
                          className={cn(
                            "w-5 h-5",
                            isRequired ? "text-[#3DD8B6]" : "text-[#00D4FF]"
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-white">{req.title}</h4>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-semibold",
                              isRequired
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            )}
                          >
                            {isRequired ? "Requerido" : "Recomendado"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {req.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Solución de Problemas */}
        <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              <RotateCcw className="w-7 h-7 text-[#00D4FF]" />
              Solución de Problemas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {troubleshooting.map((item, index) => (
                <div
                  key={index}
                  className="p-5 bg-[#1a2942]/50 rounded-xl border-2 border-[#1a2942] hover:border-[#00D4FF]/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-2">
                        {item.problem}
                      </h4>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-[#3DD8B6] mt-1 flex-shrink-0" />
                        <p className="text-gray-400 leading-relaxed">
                          {item.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center p-8 bg-gradient-to-r from-[#3DD8B6]/10 to-[#00D4FF]/10 rounded-2xl border-2 border-[#3DD8B6]/30">
          <h3 className="text-2xl font-bold text-white mb-3">
            ¿Listo para comenzar?
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Escanea el código QR de tu experiencia y sumérgete en la realidad
            aumentada
          </p>
          <Button
            onClick={() => router.push("/experiences")}
            className="bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500 hover:from-[#3DD8B6]/90 hover:via-[#00D4FF]/90 hover:to-purple-500/90 text-[#0F1C2E] font-bold text-lg px-8 py-6 rounded-2xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#3DD8B6]/50"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Ver Mis Experiencias
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
          }
        }
        .animate-blob {
          animation: blob 8s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
