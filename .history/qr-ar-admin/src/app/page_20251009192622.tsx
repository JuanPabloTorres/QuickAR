import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-16">
        <div className="flex justify-center mb-6">
          <QuickArLogo 
            className="w-24 h-24 hover:scale-110 transition-transform duration-500" 
            size={96}
            animated={true}
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Quick<span className="text-primary">AR</span>
        </h1>
        <p className="text-xl text-blue-200 max-w-2xl mx-auto">
          Plataforma profesional para crear y gestionar experiencias de realidad
          aumentada con códigos QR
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/experiences">
            <Button size="lg" className="w-full sm:w-auto">
              Ver Experiencias
            </Button>
          </Link>
          <Link href="/experiences/create">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Crear Nueva Experiencia
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Experiencias
            </CardTitle>
            <QuickArLogo size={24} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assets Totales
            </CardTitle>
            <div className="text-2xl">📦</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              Imágenes, videos y modelos 3D
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visualizaciones
            </CardTitle>
            <div className="text-2xl">👀</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +18% desde la semana pasada
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Activos</CardTitle>
            <QuickArLogo size={24} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Experiencias publicadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass">
          <CardHeader>
            <QuickArLogo size={48} className="mb-2" />
            <CardTitle>Experiencias Interactivas</CardTitle>
            <CardDescription>
              Crea experiencias inmersivas de AR con imágenes, videos, modelos
              3D y mensajes interactivos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">
                  Soporte para múltiples tipos de contenido
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Renderizado 3D en tiempo real</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Interfaz intuitiva y accesible</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
