"use client";

import { FuturisticButton } from "@/components/ui/futuristic-button";
import {
  FuturisticCard,
  FuturisticCardContent,
  FuturisticCardHeader,
  FuturisticCardTitle,
} from "@/components/ui/futuristic-card";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import { apiService, Experience } from "@/services/api";
import { BarChart3, Eye, Plus, QrCode, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getAllExperiences();
        if (response.success) {
          setExperiences(response.data);
        } else {
          setError("Failed to load experiences");
        }
      } catch (err) {
        setError("Error connecting to backend");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats from real data
  const stats = {
    totalExperiences: experiences.length,
    activeQRCodes: experiences.filter((exp) => exp.isActive).length,
    totalViews: experiences.reduce((sum, exp) => sum + (exp.viewCount || 0), 0),
    totalAssets: experiences.length, // For now, assume 1 asset per experience
  };

  // Fun achievements and gamification
  const achievements = [
    { 
      id: 1, 
      title: "🚀 Pionero AR", 
      description: "Creaste tu primera experiencia", 
      unlocked: stats.totalExperiences > 0,
      progress: Math.min((stats.totalExperiences / 1) * 100, 100)
    },
    { 
      id: 2, 
      title: "👁️ Magnético", 
      description: "100 visualizaciones totales", 
      unlocked: stats.totalViews >= 100,
      progress: Math.min((stats.totalViews / 100) * 100, 100)
    },
    { 
      id: 3, 
      title: "🏆 Maestro AR", 
      description: "10 experiencias creadas", 
      unlocked: stats.totalExperiences >= 10,
      progress: Math.min((stats.totalExperiences / 10) * 100, 100)
    },
    { 
      id: 4, 
      title: "⚡ Viral", 
      description: "1000 visualizaciones totales", 
      unlocked: stats.totalViews >= 1000,
      progress: Math.min((stats.totalViews / 1000) * 100, 100)
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const nextAchievement = achievements.find(a => !a.unlocked);

  // Fun random messages based on stats
  const getFunMessage = () => {
    const messages = [
      "¡Tu creatividad AR está en llamas! 🔥",
      "¡El futuro es AR y tú lo estás construyendo! 🌟",
      "¡Cada QR es una puerta a nuevos mundos! 🚪✨",
      "¡Eres un mago del AR! 🎩⭐",
      "¡Transformando realidades una experiencia a la vez! 🌈",
      "¡El AR nunca fue tan emocionante! 🎯🚀"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const [funMessage] = useState(getFunMessage());

  const recentActivity = [
    {
      id: 1,
      type: "create",
      title: "Experiencia Producto AR",
      time: "Hace 2 horas",
    },
    {
      id: 2,
      type: "view",
      title: "Demo Showroom Virtual",
      time: "Hace 4 horas",
    },
    {
      id: 3,
      type: "update",
      title: "Catálogo 3D Interactivo",
      time: "Hace 1 día",
    },
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
            <FuturisticButton
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Ver Experiencias
            </FuturisticButton>
          </Link>
          <Link href="/analytics">
            <FuturisticButton
              variant="glass"
              size="lg"
              className="w-full sm:w-auto"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Analytics
            </FuturisticButton>
          </Link>
        </div>
      </div>

      {/* Fun Message & Achievement Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Motivational Message */}
        <FuturisticCard variant="glass" glow className="overflow-hidden">
          <FuturisticCardContent className="p-6 text-center">
            <div className="text-4xl mb-3 animate-bounce">🎉</div>
            <h3 className="text-lg font-bold font-orbitron text-white mb-2">
              {funMessage}
            </h3>
            <p className="text-sm text-slate-300 font-manrope">
              Tienes {unlockedAchievements.length} de {achievements.length} logros desbloqueados
            </p>
            {/* Progress bar for next achievement */}
            {nextAchievement && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Próximo: {nextAchievement.title}</span>
                  <span className="text-sky-400">{nextAchievement.progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`bg-gradient-to-r from-sky-400 to-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out ${
                      nextAchievement.progress > 75 ? 'w-3/4' :
                      nextAchievement.progress > 50 ? 'w-1/2' :
                      nextAchievement.progress > 25 ? 'w-1/4' : 'w-0'
                    }`}
                  />
                </div>
              </div>
            )}
          </FuturisticCardContent>
        </FuturisticCard>

        {/* Quick Achievement Showcase */}
        <FuturisticCard variant="neon" className="overflow-hidden">
          <FuturisticCardContent className="p-6">
            <h3 className="text-lg font-bold font-orbitron text-white mb-4 flex items-center">
              🏆 Logros Recientes
            </h3>
            <div className="space-y-2">
              {unlockedAchievements.slice(-3).map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="text-2xl">{achievement.title.charAt(0)}</div>
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{achievement.title}</div>
                    <div className="text-xs text-slate-400">{achievement.description}</div>
                  </div>
                  <div className="text-green-400 animate-pulse">✓</div>
                </div>
              ))}
              {unlockedAchievements.length === 0 && (
                <div className="text-center text-slate-400 py-4">
                  ¡Crea tu primera experiencia para desbloquear logros! 🚀
                </div>
              )}
            </div>
          </FuturisticCardContent>
        </FuturisticCard>
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
            {loading ? (
              <div className="text-2xl font-bold font-orbitron text-slate-400 animate-pulse">
                ---
              </div>
            ) : (
              <div className="text-3xl font-bold font-orbitron text-white">
                {stats.totalExperiences}
              </div>
            )}
            <p className="text-sm text-slate-400 font-manrope">
              {error ? "Error loading data" : "Experiencias creadas"}
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
            {loading ? (
              <div className="text-2xl font-bold font-orbitron text-slate-400 animate-pulse">
                ---
              </div>
            ) : (
              <div className="text-2xl font-bold font-orbitron text-white">
                {stats.totalAssets}
              </div>
            )}
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
            <Eye className="h-5 w-5 text-yellow-400" />
          </FuturisticCardHeader>
          <FuturisticCardContent>
            {loading ? (
              <div className="text-2xl font-bold font-orbitron text-slate-400 animate-pulse">
                ---
              </div>
            ) : (
              <div className="text-2xl font-bold font-orbitron text-white">
                {stats.totalViews.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-slate-400 font-manrope">
              Total de visualizaciones
            </p>
          </FuturisticCardContent>
        </FuturisticCard>

        <FuturisticCard variant="default">
          <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <FuturisticCardTitle className="text-sm font-medium font-manrope">
              QR Activos
            </FuturisticCardTitle>
            <QrCode className="h-5 w-5 text-green-400" />
          </FuturisticCardHeader>
          <FuturisticCardContent>
            {loading ? (
              <div className="text-2xl font-bold font-orbitron text-slate-400 animate-pulse">
                ---
              </div>
            ) : (
              <div className="text-2xl font-bold font-orbitron text-white">
                {stats.activeQRCodes}
              </div>
            )}
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
                <span className="text-sm font-manrope text-slate-300">
                  Renderizado 3D en tiempo real
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm font-manrope text-slate-300">
                  Interfaz intuitiva y accesible
                </span>
              </div>
            </div>
          </FuturisticCardContent>
        </FuturisticCard>

        <FuturisticCard variant="neon">
          <FuturisticCardHeader>
            <QuickArLogo size={48} className="mb-2" />
            <FuturisticCardTitle>QR Inteligentes</FuturisticCardTitle>
            <p className="text-slate-400 font-manrope">
              Genera códigos QR dinámicos que enlazan directamente a tus
              experiencias de realidad aumentada.
            </p>
          </FuturisticCardHeader>
          <FuturisticCardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm font-manrope text-slate-300">
                  Códigos QR personalizables
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm font-manrope text-slate-300">
                  Tracking y analytics en tiempo real
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm font-manrope text-slate-300">
                  Compatibilidad multi-dispositivo
                </span>
              </div>
            </div>
          </FuturisticCardContent>
        </FuturisticCard>
      </div>

      {/* Quick Actions */}
      <FuturisticCard variant="default" glow>
        <FuturisticCardHeader>
          <FuturisticCardTitle>Acciones Rápidas</FuturisticCardTitle>
          <p className="text-slate-400 font-manrope">
            Gestiona tu plataforma AR desde un solo lugar
          </p>
        </FuturisticCardHeader>
        <FuturisticCardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/experiences" className="block">
            <FuturisticButton
              variant="ghost"
              className="w-full h-auto p-6 flex flex-col space-y-2"
            >
              <QuickArLogo size={24} />
              <span className="text-sm font-manrope">Ver Todas</span>
            </FuturisticButton>
          </Link>

          <Link href="/experiences/create" className="block">
            <FuturisticButton
              variant="ghost"
              className="w-full h-auto p-6 flex flex-col space-y-2"
            >
              <div className="text-2xl">➕</div>
              <span className="text-sm font-manrope">Crear Nueva</span>
            </FuturisticButton>
          </Link>

          <Link href="/analytics" className="block">
            <FuturisticButton
              variant="ghost"
              className="w-full h-auto p-6 flex flex-col space-y-2"
            >
              <QuickArLogo size={24} />
              <span className="text-sm font-manrope">Analytics</span>
            </FuturisticButton>
          </Link>

          <Link href="/settings" className="block">
            <FuturisticButton
              variant="ghost"
              className="w-full h-auto p-6 flex flex-col space-y-2"
            >
              <QuickArLogo size={24} />
              <span className="text-sm font-manrope">Configuración</span>
            </FuturisticButton>
          </Link>
        </FuturisticCardContent>
      </FuturisticCard>
    </div>
  );
}
