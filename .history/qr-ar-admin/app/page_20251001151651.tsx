import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  ArrowRight,
  Box,
  Eye,
  Play,
  QrCode,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const stats = [
    {
      label: "Experiencias Activas",
      value: "12",
      change: "+3",
      icon: Activity,
      color: "#3DD8B6",
      bgColor: "bg-[#3DD8B6]/20",
      borderColor: "border-[#3DD8B6]/30",
    },
    {
      label: "QR Escaneados",
      value: "1,234",
      change: "+15%",
      icon: QrCode,
      color: "#00D4FF",
      bgColor: "bg-[#00D4FF]/20",
      borderColor: "border-[#00D4FF]/30",
    },
    {
      label: "Total Visualizaciones",
      value: "5,678",
      change: "+12%",
      icon: Eye,
      color: "#3DD8B6",
      bgColor: "bg-[#3DD8B6]/20",
      borderColor: "border-[#3DD8B6]/30",
    },
    {
      label: "Modelos 3D",
      value: "24",
      change: "+2",
      icon: Box,
      color: "#00D4FF",
      bgColor: "bg-[#00D4FF]/20",
      borderColor: "border-[#00D4FF]/30",
    },
  ];

  const features = [
    {
      title: "Experiencias AR",
      description:
        "Crea experiencias inmersivas con modelos 3D, imágenes y videos",
      detail:
        "Diseña experiencias de realidad aumentada que se activan mediante códigos QR. Sube modelos 3D, imágenes, videos o crea mensajes interactivos.",
      icon: Activity,
      href: "/experiences",
      buttonText: "Ver Experiencias",
      gradient: "from-[#3DD8B6] to-[#00D4FF]",
      bgGradient: "from-[#3DD8B6]/10 to-[#00D4FF]/10",
    },
    {
      title: "Códigos QR",
      description: "Genera códigos QR únicos para cada experiencia",
      detail:
        "Cada experiencia genera automáticamente un código QR que los usuarios pueden escanear para acceder a la experiencia AR.",
      icon: QrCode,
      href: "/experiences/new",
      buttonText: "Crear Nueva",
      gradient: "from-[#00D4FF] to-[#3DD8B6]",
      bgGradient: "from-[#00D4FF]/10 to-[#3DD8B6]/10",
    },
    {
      title: "Analytics",
      description: "Monitorea el uso y engagement de tus experiencias",
      detail:
        "Obtén insights sobre cómo los usuarios interactúan con tus experiencias, incluyendo visualizaciones, interacciones y duración.",
      icon: TrendingUp,
      href: "/analytics",
      buttonText: "Ver Analytics",
      gradient: "from-[#3DD8B6] to-[#00D4FF]",
      bgGradient: "from-[#3DD8B6]/10 to-[#00D4FF]/10",
    },
    {
      title: "Gestión de Archivos",
      description: "Almacena modelos 3D y multimedia en la nube",
      detail:
        "Sistema de almacenamiento optimizado para modelos 3D (.glb/.gltf), imágenes, videos y otros recursos multimedia.",
      icon: Box,
      href: "/files",
      buttonText: "Gestionar Archivos",
      gradient: "from-[#00D4FF] to-[#3DD8B6]",
      bgGradient: "from-[#00D4FF]/10 to-[#3DD8B6]/10",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Crear una experiencia",
      description: "Da un título y descripción a tu experiencia AR",
    },
    {
      number: 2,
      title: "Agregar contenido",
      description: "Sube modelos 3D, imágenes, videos o crea mensajes de texto",
    },
    {
      number: 3,
      title: "Compartir QR",
      description:
        "Descarga el código QR generado y compártelo con tus usuarios",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative p-10 rounded-2xl bg-gradient-to-br from-[#0F1C2E] via-[#1a2942] to-[#0F1C2E] overflow-hidden border-2 border-[#3DD8B6]/20">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #3DD8B6 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3DD8B6]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D4FF]/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-[#3DD8B6] animate-pulse" />
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Panel de Administración{" "}
              <span className="text-[#3DD8B6]">QR AR</span>
            </h1>
          </div>
          <p className="text-gray-400 text-xl">
            Gestiona tus experiencias de realidad aumentada
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={stat.label}
            className="border-2 border-[#1a2942] bg-[#0F1C2E]/50 backdrop-blur-sm hover:border-[#3DD8B6]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#3DD8B6]/10 hover:scale-105 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-white group-hover:text-[#3DD8B6] transition-colors">
                    {stat.value}
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#3DD8B6]/20 rounded-full border border-[#3DD8B6]/30">
                    <TrendingUp className="w-3 h-3 text-[#3DD8B6]" />
                    <span className="text-xs font-bold text-[#3DD8B6]">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-xl ${stat.bgColor} border-2 ${stat.borderColor} group-hover:scale-110 transition-transform`}
                >
                  <stat.icon
                    className="w-7 h-7"
                    style={{ color: stat.color }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card
            key={feature.title}
            className="border-2 border-[#1a2942] bg-[#0F1C2E]/80 backdrop-blur-sm hover:border-[#3DD8B6]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#3DD8B6]/20 group overflow-hidden"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Hover gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>

            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-[#0F1C2E]" />
                </div>
                <span className="text-white group-hover:text-[#3DD8B6] transition-colors text-xl">
                  {feature.title}
                </span>
              </CardTitle>
              <CardDescription className="text-gray-400 text-base pt-2">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                {feature.detail}
              </p>
              <Link href={feature.href}>
                <Button
                  className={`w-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-[#0F1C2E] font-bold transition-all hover:scale-105 hover:shadow-lg group/btn`}
                >
                  {feature.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started Guide */}
      <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E] via-[#1a2942] to-[#0F1C2E] backdrop-blur-sm overflow-hidden relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #00D4FF 1px, transparent 0)`,
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>

        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-[#3DD8B6]/20 rounded-xl border-2 border-[#3DD8B6]/30">
              <Zap className="w-6 h-6 text-[#3DD8B6]" />
            </div>
            <span className="text-white">Comenzar</span>
          </CardTitle>
          <CardDescription className="text-gray-400 text-base pt-2">
            Guía rápida para crear tu primera experiencia AR
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-6 mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] text-[#0F1C2E] rounded-full flex items-center justify-center text-base font-bold shadow-lg shadow-[#3DD8B6]/30 group-hover:scale-110 transition-transform">
                  {step.number}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-bold text-white mb-1.5 text-lg group-hover:text-[#3DD8B6] transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/experiences/new" className="flex-1">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] hover:from-[#3DD8B6]/90 hover:to-[#00D4FF]/90 text-[#0F1C2E] font-bold text-base py-6 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#3DD8B6]/30 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Crear Mi Primera Experiencia AR
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/experiences">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#1a2942] hover:bg-[#243a5e] border-2 border-[#3DD8B6]/30 hover:border-[#3DD8B6] text-white font-semibold py-6 transition-all hover:scale-105"
              >
                <Eye className="w-5 h-5 mr-2" />
                Ver Todas
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
