import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function HomePage() {
  const stats = [
    { label: "Experiencias Activas", value: "12", change: "+3", icon: "ar" },
    { label: "QR Escaneados", value: "1,234", change: "+15%", icon: "qr" },
    { label: "Total Visualizaciones", value: "5,678", change: "+12%", icon: "view" },
    { label: "Modelos 3D", value: "24", change: "+2", icon: "upload" },
  ];

  const features = [
    {
      title: "Experiencias AR",
      description: "Crea experiencias inmersivas con modelos 3D, imágenes y videos",
      detail: "Diseña experiencias de realidad aumentada que se activan mediante códigos QR. Sube modelos 3D, imágenes, videos o crea mensajes interactivos.",
      icon: "ar",
      href: "/experiences",
      buttonText: "Ver Experiencias",
      variant: "ar" as const,
    },
    {
      title: "Códigos QR",
      description: "Genera códigos QR únicos para cada experiencia",
      detail: "Cada experiencia genera automáticamente un código QR que los usuarios pueden escanear para acceder a la experiencia AR.",
      icon: "qr",
      href: "/experiences/new",
      buttonText: "Crear Nueva",
      variant: "default" as const,
    },
    {
      title: "Analytics",
      description: "Monitorea el uso y engagement de tus experiencias",
      detail: "Obtén insights sobre cómo los usuarios interactúan con tus experiencias, incluyendo visualizaciones, interacciones y duración.",
      icon: "view",
      href: "/analytics",
      buttonText: "Ver Analytics",
      variant: "default" as const,
    },
    {
      title: "Gestión de Archivos",
      description: "Almacena modelos 3D y multimedia en la nube",
      detail: "Sistema de almacenamiento optimizado para modelos 3D (.glb/.gltf), imágenes, videos y otros recursos multimedia.",
      icon: "upload",
      href: "/files",
      buttonText: "Gestionar Archivos",
      variant: "default" as const,
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
      description: "Descarga el código QR generado y compártelo con tus usuarios",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Panel de Administración QR AR"
        description="Gestiona tus experiencias de realidad aumentada"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} variant="glass" className="hover:shadow-neon-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <Badge variant="success" className="mt-1">
                    {stat.change}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-brand-500/10">
                  <Icon name={stat.icon} size="xl" className="text-brand-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} variant={feature.variant} className="hover:shadow-neon-md transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors">
                  <Icon name={feature.icon} size="lg" className="text-brand-400" />
                </div>
                <span>{feature.title}</span>
              </CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                {feature.detail}
              </p>
              <Link href={feature.href}>
                <Button className="w-full group-hover:shadow-neon-sm transition-all duration-300">
                  {feature.buttonText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started Guide */}
      <Card variant="elevated" className="bg-gradient-to-r from-brand-950/50 to-qr-950/50 border-brand-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Icon name="info" size="lg" className="text-brand-400" />
            <span>Comenzar</span>
          </CardTitle>
          <CardDescription>
            Guía rápida para crear tu primera experiencia AR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-brand-500 to-qr-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-neon-sm">
                  {step.number}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {step.title}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/experiences/new" className="flex-1">
              <Button size="lg" className="w-full shadow-neon-md hover:shadow-neon-lg transition-all duration-300">
                <Icon name="add" size="sm" className="mr-2" />
                Crear Mi Primera Experiencia AR
              </Button>
            </Link>
            <Link href="/experiences">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Icon name="view" size="sm" className="mr-2" />
                Ver Todas
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
