"use client";

import { 
  FuturisticCard,
  FuturisticCardContent,
  FuturisticCardHeader,
  FuturisticCardTitle,
} from "@/components/ui/futuristic-card";
import { FuturisticButton } from "@/components/ui/futuristic-button";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import { 
  Activity,
  BarChart3,
  Eye,
  Plus,
  QrCode,
  Sparkles,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  // Mock data - replace with real API calls
  const stats = {
    totalExperiences: 24,
    activeQRCodes: 18,
    totalViews: 1542,
    thisMonthViews: 347
  };

  const recentActivity = [
    { id: 1, type: "create", title: "Experiencia Producto AR", time: "Hace 2 horas" },
    { id: 2, type: "view", title: "Demo Showroom Virtual", time: "Hace 4 horas" },
    { id: 3, type: "update", title: "Catálogo 3D Interactivo", time: "Hace 1 día" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-6">
          <QuickArLogo size={64} animated className="mr-4" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-orbitron text-white mb-2">
              Dashboard{" "}
              <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                Quick AR
              </span>
            </h1>
            <p className="text-slate-300 font-manrope">
              Control y gestión de experiencias de realidad aumentada
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/experiences/create">
            <FuturisticButton size="lg" glow className="w-full sm:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              Crear Experiencia
            </FuturisticButton>
          </Link>
          <Link href="/experiences">
            <FuturisticButton variant="outline" size="lg" className="w-full sm:w-auto">
              <Sparkles className="mr-2 h-5 w-5" />
              Ver Experiencias
            </FuturisticButton>
          </Link>
          <Link href="/analytics">
            <FuturisticButton variant="glass" size="lg" className="w-full sm:w-auto">
              <BarChart3 className="mr-2 h-5 w-5" />
              Analytics
            </FuturisticButton>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FuturisticCard variant="neon" hover>
          <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <FuturisticCardTitle className="text-sm font-medium">
              Total Experiencias
            </FuturisticCardTitle>
            <Sparkles className="h-5 w-5 text-sky-400" />
          </FuturisticCardHeader>
          <FuturisticCardContent>
            <div className="text-3xl font-bold font-orbitron text-white">
              {stats.totalExperiences}
            </div>
            <p className="text-sm text-slate-400 font-manrope">
              +3 este mes
            </p>
          </FuturisticCardContent>
        </FuturisticCard>

        <FuturisticCard variant="glass" glow>
          <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <FuturisticCardTitle className="text-sm font-medium font-manrope">
              Assets Totales
            </FuturisticCardTitle>
            <div className="text-2xl">📦</div>
          </FuturisticCardHeader>
          <FuturisticCardContent>
            <div className="text-2xl font-bold font-orbitron text-white">47</div>
            <p className="text-xs text-slate-400 font-manrope">
              Imágenes, videos y modelos 3D
            </p>
          </FuturisticCardContent>
        </FuturisticCard>

        <FuturisticCard variant="neon">
          <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <FuturisticCardTitle className="text-sm font-medium font-manrope">
              Visualizaciones
            </FuturisticCardTitle>
            <div className="text-2xl">👀</div>
          </FuturisticCardHeader>
          <FuturisticCardContent>
            <div className="text-2xl font-bold font-orbitron text-white">1,234</div>
            <p className="text-xs text-slate-400 font-manrope">
              +18% desde la semana pasada
            </p>
          </FuturisticCardContent>
        </FuturisticCard>

        <FuturisticCard variant="default">
          <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <FuturisticCardTitle className="text-sm font-medium font-manrope">QR Activos</FuturisticCardTitle>
            <QuickArLogo size={24} />
          </FuturisticCardHeader>
          <FuturisticCardContent>
            <div className="text-2xl font-bold font-orbitron text-white">8</div>
            <p className="text-xs text-slate-400 font-manrope">
              Experiencias publicadas
            </p>
          </FuturisticCardContent>
        </FuturisticCard>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FuturisticCard variant="glass" glow>
          <FuturisticCardHeader>
            <QuickArLogo size={48} className="mb-2" />
            <FuturisticCardTitle>Experiencias Interactivas</FuturisticCardTitle>
            <p className="text-slate-400 font-manrope">
              Crea experiencias inmersivas de AR con imágenes, videos, modelos
              3D y mensajes interactivos.
            </p>
          </FuturisticCardHeader>
          <FuturisticCardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm font-manrope text-slate-300">
                  Soporte para múltiples tipos de contenido
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm font-manrope text-slate-300">Renderizado 3D en tiempo real</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm font-manrope text-slate-300">Interfaz intuitiva y accesible</span>
              </div>
            </div>
          </FuturisticCardContent>
        </FuturisticCard>

        <Card className="glass">
          <CardHeader>
            <QuickArLogo size={48} className="mb-2" />
            <CardTitle>QR Inteligentes</CardTitle>
            <CardDescription>
              Genera códigos QR dinámicos que enlazan directamente a tus
              experiencias de realidad aumentada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Códigos QR personalizables</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">
                  Tracking y analytics en tiempo real
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">
                  Compatibilidad multi-dispositivo
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Gestiona tu plataforma AR desde un solo lugar
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/experiences" className="block">
            <Button
              variant="ghost"
              className="w-full h-auto p-6 flex flex-col space-y-2"
            >
              <QuickArLogo size={24} />
              <span className="text-sm">Ver Todas</span>
            </Button>
          </Link>

          <Link href="/experiences/create" className="block">
            <Button
              variant="ghost"
              className="w-full h-auto p-6 flex flex-col space-y-2"
            >
              <div className="text-2xl">➕</div>
              <span className="text-sm">Crear Nueva</span>
            </Button>
          </Link>

          <Link href="/analytics" className="block">
            <Button
              variant="ghost"
              className="w-full h-auto p-6 flex flex-col space-y-2"
            >
              <QuickArLogo size={24} />
              <span className="text-sm">Analytics</span>
            </Button>
          </Link>

          <Link href="/settings" className="block">
            <Button
              variant="ghost"
              className="w-full h-auto p-6 flex flex-col space-y-2"
            >
              <QuickArLogo size={24} />
              <span className="text-sm">Configuración</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
