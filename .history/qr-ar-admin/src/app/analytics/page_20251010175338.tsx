"use client";

import { FuturisticButton } from "@/components/ui/futuristic-button";
import {
  FuturisticCard,
  FuturisticCardContent,
  FuturisticCardHeader,
  FuturisticCardTitle,
} from "@/components/ui/futuristic-card";
import { EasterEggProvider, MotivationalQuote, FunFact } from "@/components/ui/easter-eggs";
import { FloatingDecoration, AchievementNotification } from "@/components/ui/floating-particles";
import {
  BarChart3,
  Calendar,
  Download,
  Eye,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export default function Analytics() {
  const [showAchievement, setShowAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<{title: string; description: string} | null>(null);
  // Mock data for charts
  const viewsData = [
    { name: "Ene", views: 400, interactions: 240 },
    { name: "Feb", views: 300, interactions: 139 },
    { name: "Mar", views: 200, interactions: 980 },
    { name: "Abr", views: 278, interactions: 390 },
    { name: "May", views: 189, interactions: 480 },
    { name: "Jun", views: 239, interactions: 380 },
    { name: "Jul", views: 349, interactions: 430 },
  ];

  const deviceData = [
    { name: "Móvil", value: 65, color: "#38bdf8" },
    { name: "Desktop", value: 25, color: "#6366f1" },
    { name: "Tablet", value: 10, color: "#9333ea" },
  ];

  const experienceData = [
    { name: "Producto AR", views: 450 },
    { name: "Showroom Virtual", views: 320 },
    { name: "Catálogo 3D", views: 280 },
    { name: "Demo Interactivo", views: 200 },
  ];

  return (
      return (
    <>
      <FloatingDecoration />
      <EasterEggProvider 
        onActivate={() => {
          setNewAchievement({ title: "📊 Data Wizard", description: "¡Has desbloqueado los secretos de los datos!" });
          setShowAchievement(true);
        }}
      />
      <MotivationalQuote />
      <AchievementNotification 
        achievement={newAchievement || undefined} 
        show={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
    <div className="container mx-auto px-6 py-8"
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold font-orbitron text-white mb-2">
            Analytics{" "}
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-slate-300 font-manrope">
            Métricas y estadísticas de tus experiencias AR
          </p>
        </div>
        <div className="flex space-x-3">
          <FuturisticButton variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </FuturisticButton>
          <FuturisticButton variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </FuturisticButton>
          <FuturisticButton variant="glass" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </FuturisticButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FuturisticCard variant="neon" hover>
          <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <FuturisticCardTitle className="text-sm font-medium">
              Total Visualizaciones
            </FuturisticCardTitle>
            <Eye className="h-5 w-5 text-sky-400" />
          </FuturisticCardHeader>
          <FuturisticCardContent>
            <div className="text-3xl font-bold font-orbitron text-white">
              12,847
            </div>
            <p className="text-sm text-green-400 font-manrope">
              +12.5% vs mes anterior
            </p>
          </FuturisticCardContent>
        </FuturisticCard>

        <FuturisticCard variant="glass" hover>
          <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <FuturisticCardTitle className="text-sm font-medium">
              Usuarios Únicos
            </FuturisticCardTitle>
            <Users className="h-5 w-5 text-indigo-400" />
          </FuturisticCardHeader>
          <FuturisticCardContent>
            <div className="text-3xl font-bold font-orbitron text-white">
              3,247
            </div>
            <p className="text-sm text-green-400 font-manrope">
              +8.1% vs mes anterior
            </p>
          </FuturisticCardContent>
        </FuturisticCard>

        <FuturisticCard variant="default" hover>
          <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <FuturisticCardTitle className="text-sm font-medium">
              Tiempo Promedio
            </FuturisticCardTitle>
            <Calendar className="h-5 w-5 text-purple-400" />
          </FuturisticCardHeader>
          <FuturisticCardContent>
            <div className="text-3xl font-bold font-orbitron text-white">
              2m 34s
            </div>
            <p className="text-sm text-yellow-400 font-manrope">
              +0.3s vs mes anterior
            </p>
          </FuturisticCardContent>
        </FuturisticCard>

        <FuturisticCard variant="glass" hover>
          <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <FuturisticCardTitle className="text-sm font-medium">
              Tasa de Conversión
            </FuturisticCardTitle>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </FuturisticCardHeader>
          <FuturisticCardContent>
            <div className="text-3xl font-bold font-orbitron text-white">
              24.8%
            </div>
            <p className="text-sm text-green-400 font-manrope">
              +3.2% vs mes anterior
            </p>
          </FuturisticCardContent>
        </FuturisticCard>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Views Over Time */}
        <div className="lg:col-span-2">
          <FuturisticCard variant="glass">
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-sky-400" />
                Visualizaciones por Mes
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={viewsData}>
                    <defs>
                      <linearGradient
                        id="colorViews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#38bdf8"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#38bdf8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#38bdf8"
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>
        </div>

        {/* Device Distribution */}
        <div>
          <FuturisticCard variant="neon">
            <FuturisticCardHeader>
              <FuturisticCardTitle>
                Distribución por Dispositivos
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {deviceData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-manrope text-slate-300">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-orbitron text-white">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </FuturisticCardContent>
          </FuturisticCard>
        </div>
      </div>

      {/* Experience Performance */}
      <FuturisticCard variant="glass">
        <FuturisticCardHeader>
          <FuturisticCardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-sky-400" />
            Rendimiento por Experiencia
          </FuturisticCardTitle>
        </FuturisticCardHeader>
        <FuturisticCardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={experienceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Bar
                  dataKey="views"
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FuturisticCardContent>
      </FuturisticCard>
    </div>
    </>
  );
}
