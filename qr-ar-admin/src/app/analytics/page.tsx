"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import {
  EasterEggProvider,
  MotivationalQuote,
} from "@/components/ui/easter-eggs";
import {
  AchievementNotification,
  FloatingDecoration,
} from "@/components/ui/floating-particles";
import { FuturisticButton } from "@/components/ui/futuristic-button";
import {
  FuturisticCard,
  FuturisticCardContent,
  FuturisticCardHeader,
  FuturisticCardTitle,
} from "@/components/ui/futuristic-card";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Download,
  Eye,
  Filter,
  Loader2,
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

// Device color mapping
const deviceColors: Record<string, { color: string; colorClass: string }> = {
  Mobile: { color: "#38bdf8", colorClass: "bg-sky-400" },
  Desktop: { color: "#6366f1", colorClass: "bg-indigo-500" },
  Tablet: { color: "#9333ea", colorClass: "bg-purple-600" },
  Unknown: { color: "#64748b", colorClass: "bg-slate-500" },
};

export default function Analytics() {
  const [showAchievement, setShowAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const {
    summary,
    deviceStats,
    timeSeriesData,
    topExperiences,
    isLoading,
    error,
    refetch,
  } = useAnalytics();

  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Transform device stats for pie chart
  const deviceChartData =
    deviceStats?.map((d) => ({
      name: d.deviceName,
      value: d.percentage,
      count: d.count,
      color: deviceColors[d.deviceName]?.color || "#64748b",
      colorClass: deviceColors[d.deviceName]?.colorClass || "bg-slate-500",
    })) || [];

  // Transform top experiences for bar chart
  const experienceChartData =
    topExperiences?.map((e) => ({
      name:
        e.experienceName.substring(0, 20) +
        (e.experienceName.length > 20 ? "..." : ""),
      views: e.viewCount,
    })) || [];

  // Transform time series for area chart
  const timeSeriesChartData =
    timeSeriesData?.map((t) => ({
      name: t.period,
      views: t.views,
      interactions: t.interactions,
    })) || [];

  return (
    <ProtectedRoute>
      <FloatingDecoration />
      <EasterEggProvider
        onActivate={() => {
          setNewAchievement({
            title: "📊 Data Wizard",
            description: "¡Has desbloqueado los secretos de los datos!",
          });
          setShowAchievement(true);
        }}
      />
      <MotivationalQuote />
      <AchievementNotification
        achievement={newAchievement || undefined}
        show={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
      <div className="container mx-auto px-6 py-8">
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
            <FuturisticButton
              variant="glass"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualizar
            </FuturisticButton>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !summary && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-sky-400 mx-auto mb-4" />
              <p className="text-slate-300 font-manrope">
                Cargando datos de analytics...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center py-20">
            <FuturisticCard variant="neon">
              <FuturisticCardContent className="flex flex-col items-center text-center p-8">
                <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Error al cargar datos
                </h3>
                <p className="text-slate-300 mb-4">{error}</p>
                <FuturisticButton onClick={() => refetch()}>
                  Reintentar
                </FuturisticButton>
              </FuturisticCardContent>
            </FuturisticCard>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && summary && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FuturisticCard variant="neon" hover className="group">
                <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <FuturisticCardTitle className="text-sm font-medium">
                    👁️ Total Visualizaciones
                  </FuturisticCardTitle>
                  <Eye className="h-5 w-5 text-sky-400 group-hover:animate-pulse" />
                </FuturisticCardHeader>
                <FuturisticCardContent>
                  <div className="text-3xl font-bold font-orbitron text-white group-hover:scale-105 transition-transform">
                    {summary.totalViews.toLocaleString()}
                  </div>
                  <p className="text-sm text-slate-400 font-manrope">
                    Total de visualizaciones
                  </p>
                </FuturisticCardContent>
              </FuturisticCard>

              <FuturisticCard variant="glass" hover className="group">
                <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <FuturisticCardTitle className="text-sm font-medium">
                    👥 Usuarios Únicos
                  </FuturisticCardTitle>
                  <Users className="h-5 w-5 text-indigo-400 group-hover:animate-bounce" />
                </FuturisticCardHeader>
                <FuturisticCardContent>
                  <div className="text-3xl font-bold font-orbitron text-white group-hover:scale-105 transition-transform">
                    {summary.uniqueUsers.toLocaleString()}
                  </div>
                  <p className="text-sm text-slate-400 font-manrope">
                    IPs únicas detectadas
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
                    {formatTime(summary.averageTimeSpent)}
                  </div>
                  <p className="text-sm text-slate-400 font-manrope">
                    Por sesión
                  </p>
                </FuturisticCardContent>
              </FuturisticCard>

              <FuturisticCard variant="glass" hover>
                <FuturisticCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <FuturisticCardTitle className="text-sm font-medium">
                    Tasa de Interacción
                  </FuturisticCardTitle>
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </FuturisticCardHeader>
                <FuturisticCardContent>
                  <div className="text-3xl font-bold font-orbitron text-white">
                    {summary.conversionRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-slate-400 font-manrope">
                    De las visualizaciones
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
                        <AreaChart data={timeSeriesChartData}>
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
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#334155"
                          />
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
                            data={deviceChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {deviceChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {deviceChartData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${item.colorClass}`}
                            />
                            <span className="text-sm font-manrope text-slate-300">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-sm font-orbitron text-white">
                            {item.value.toFixed(1)}% ({item.count})
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
                    <BarChart data={experienceChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Bar
                        dataKey="views"
                        fill="url(#barGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id="barGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#9333ea"
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </FuturisticCardContent>
            </FuturisticCard>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
