// Experience Card and List Components for the redesigned experiences page

import { motion } from "framer-motion";
import {
  Calendar,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Image,
  MessageCircle,
  Package,
  Play,
  Trash2,
  Box,
} from "lucide-react";
import Link from "next/link";

import { AnimatedCard } from "@/components/ui/animated-card";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, truncateText } from "@/lib/utils";
import { AssetKind, ExperienceDto } from "@/types";

// Helper function to get content types from assets
function getContentTypes(assets: ExperienceDto['assets']) {
  const types = assets.reduce((acc, asset) => {
    acc[asset.kind] = (acc[asset.kind] || 0) + 1;
    return acc;
  }, {} as Record<AssetKind, number>);
  
  return Object.entries(types).map(([kind, count]) => ({ kind: kind as AssetKind, count }));
}

// Content type configuration
const contentTypeConfig = {
  message: { icon: MessageCircle, label: 'Texto', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/50' },
  image: { icon: Image, label: 'Imagen', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/50' },
  video: { icon: Play, label: 'Video', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/50' },
  model3d: { icon: Box, label: '3D', color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/50' },
};

// Component to display content type tags
function ContentTypeTags({ assets, className = "" }: { assets: ExperienceDto['assets'], className?: string }) {
  const contentTypes = getContentTypes(assets);
  
  if (contentTypes.length === 0) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="px-2 py-1 bg-gray-600/20 border border-gray-600/50 rounded-md flex items-center gap-1">
          <FileText className="w-3 h-3 text-gray-400" />
          <span className="text-xs font-medium text-gray-400">Sin contenido</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {contentTypes.map(({ kind, count }) => {
        const config = contentTypeConfig[kind];
        const Icon = config.icon;
        return (
          <div
            key={kind}
            className={`px-2 py-1 ${config.bgColor} border ${config.borderColor} rounded-md flex items-center gap-1 transition-all hover:scale-105`}
          >
            <Icon className={`w-3 h-3 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
              {count > 1 && <span className="ml-1 opacity-75">×{count}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface ExperienceItemProps {
  experience: ExperienceDto;
  index: number;
  onToggleActive: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export function ExperienceCard({
  experience,
  index,
  onToggleActive,
  onDelete,
}: ExperienceItemProps) {
  return (
    <AnimatedCard
      index={index}
      stagger
      className="group overflow-hidden bg-[#0F1C2E]/80 backdrop-blur-sm border-2 border-[#1a2942] hover:border-[#3DD8B6]/60 transition-all duration-300 hover:shadow-xl hover:shadow-[#3DD8B6]/20 hover:scale-[1.02]"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3DD8B6]/0 via-[#3DD8B6]/5 to-[#00D4FF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-white truncate group-hover:text-[#3DD8B6] transition-colors duration-200 mb-2">
              {experience.title}
            </CardTitle>
            <CardDescription className="text-sm flex items-center gap-1 font-mono mb-3">
              <span className="text-[#00D4FF]">/</span>
              <span className="text-gray-400 group-hover:text-[#00D4FF] transition-colors">
                {experience.slug}
              </span>
            </CardDescription>
            {/* Content Type Tags */}
            <ContentTypeTags assets={experience.assets} className="mb-2" />
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              experience.isActive
                ? "bg-[#3DD8B6] text-[#0F1C2E] shadow-lg shadow-[#3DD8B6]/50"
                : "bg-gray-600 text-gray-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                experience.isActive ? "bg-[#0F1C2E]" : "bg-gray-300"
              } animate-pulse`}
            ></div>
            {experience.isActive ? "ACTIVA" : "INACTIVA"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 relative z-10">
        {experience.description && (
          <motion.div
            className="p-3 bg-[#1a2942]/50 rounded-lg border border-[#3DD8B6]/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-gray-300 text-sm leading-relaxed">
              {truncateText(experience.description, 120)}
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="flex items-center gap-2 p-3 bg-[#1a2942]/50 rounded-lg border border-[#3DD8B6]/20 hover:border-[#3DD8B6]/40 transition-all group/stat"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-2 bg-[#3DD8B6]/20 rounded-lg group-hover/stat:scale-110 transition-transform">
              <Package className="w-4 h-4 text-[#3DD8B6]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold">
                Assets
              </span>
              <span className="text-sm font-bold text-white">
                {experience.assets.length}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 p-3 bg-[#1a2942]/50 rounded-lg border border-[#00D4FF]/20 hover:border-[#00D4FF]/40 transition-all group/stat"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-2 bg-[#00D4FF]/20 rounded-lg group-hover/stat:scale-110 transition-transform">
              <Calendar className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold">
                Creado
              </span>
              <span className="text-sm font-bold text-white">
                {formatDate(experience.createdAt).split(",")[0]}
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="space-y-3 pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Primary Action */}
          <Link href={`/experiences/${experience.id}`} className="block">
            <button className="w-full py-3 px-4 bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] hover:from-[#3DD8B6]/90 hover:to-[#00D4FF]/90 text-[#0F1C2E] font-bold rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#3DD8B6]/30 flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              Ver Experiencia
              <ExternalLink className="w-3 h-3" />
            </button>
          </Link>

          {/* Secondary Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Link href={`/experiences/${experience.id}/edit`}>
              <button className="w-full py-2.5 px-3 bg-[#1a2942] hover:bg-[#243a5e] border-2 border-[#1a2942] hover:border-[#3DD8B6]/50 text-white rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-1.5 text-sm font-semibold">
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </button>
            </Link>

            <button
              onClick={() => onToggleActive(experience.id)}
              className={`w-full py-2.5 px-3 rounded-lg transition-all hover:scale-105 text-sm font-semibold ${
                experience.isActive
                  ? "bg-[#3DD8B6]/20 hover:bg-[#3DD8B6]/30 border-2 border-[#3DD8B6]/50 text-[#3DD8B6]"
                  : "bg-gray-600/20 hover:bg-gray-600/30 border-2 border-gray-600/50 text-gray-400"
              }`}
            >
              {experience.isActive ? "ON" : "OFF"}
            </button>

            <button
              onClick={() => onDelete(experience.id, experience.title)}
              className="w-full py-2.5 px-3 bg-red-600/20 hover:bg-red-600/30 border-2 border-red-600/50 hover:border-red-500 text-red-400 hover:text-red-300 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-1.5 text-sm font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Del</span>
            </button>
          </div>
        </motion.div>
      </CardContent>
    </AnimatedCard>
  );
}

export function ExperienceListItem({
  experience,
  index,
  onToggleActive,
  onDelete,
}: ExperienceItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative bg-[#0F1C2E]/80 backdrop-blur-sm border-2 border-[#1a2942] hover:border-[#3DD8B6]/60 rounded-xl p-5 hover:shadow-xl hover:shadow-[#3DD8B6]/10 transition-all duration-300"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3DD8B6]/0 via-[#3DD8B6]/5 to-[#00D4FF]/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Content Section */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header with Title and Badge */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white group-hover:text-[#3DD8B6] transition-colors mb-2">
                {experience.title}
              </h3>
              {/* Content Type Tags */}
              <ContentTypeTags assets={experience.assets} className="mb-3" />
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center text-gray-400 font-mono">
                  <span className="text-[#00D4FF] mr-1">/</span>
                  <span className="group-hover:text-[#00D4FF] transition-colors">
                    {experience.slug}
                  </span>
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Package className="w-4 h-4 text-[#3DD8B6]" />
                  <span className="font-semibold text-white">
                    {experience.assets.length}
                  </span>{" "}
                  assets
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Calendar className="w-4 h-4 text-[#00D4FF]" />
                  {formatDate(experience.createdAt)}
                </span>
              </div>
            </div>

            <div
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                experience.isActive
                  ? "bg-[#3DD8B6] text-[#0F1C2E] shadow-lg shadow-[#3DD8B6]/50"
                  : "bg-gray-600 text-gray-200"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  experience.isActive ? "bg-[#0F1C2E]" : "bg-gray-300"
                } animate-pulse`}
              ></div>
              {experience.isActive ? "ACTIVA" : "INACTIVA"}
            </div>
          </div>

          {/* Description */}
          {experience.description && (
            <div className="p-3 bg-[#1a2942]/50 rounded-lg border border-[#3DD8B6]/20">
              <p className="text-gray-300 text-sm leading-relaxed">
                {truncateText(experience.description, 150)}
              </p>
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex flex-row lg:flex-col items-stretch gap-2 min-w-fit">
          <Link
            href={`/experiences/${experience.id}`}
            className="flex-1 lg:flex-none"
          >
            <button className="w-full py-2.5 px-4 bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] hover:from-[#3DD8B6]/90 hover:to-[#00D4FF]/90 text-[#0F1C2E] font-bold rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#3DD8B6]/30 flex items-center justify-center gap-2 whitespace-nowrap">
              <Eye className="w-4 h-4" />
              Ver
            </button>
          </Link>

          <Link
            href={`/experiences/${experience.id}/edit`}
            className="flex-1 lg:flex-none"
          >
            <button className="w-full py-2.5 px-4 bg-[#1a2942] hover:bg-[#243a5e] border-2 border-[#1a2942] hover:border-[#3DD8B6]/50 text-white rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-semibold whitespace-nowrap">
              <Edit className="w-4 h-4" />
              Editar
            </button>
          </Link>

          <button
            onClick={() => onToggleActive(experience.id)}
            className={`flex-1 lg:flex-none py-2.5 px-4 rounded-lg transition-all hover:scale-105 font-semibold flex items-center justify-center gap-2 whitespace-nowrap ${
              experience.isActive
                ? "bg-[#3DD8B6]/20 hover:bg-[#3DD8B6]/30 border-2 border-[#3DD8B6]/50 text-[#3DD8B6]"
                : "bg-gray-600/20 hover:bg-gray-600/30 border-2 border-gray-600/50 text-gray-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                experience.isActive ? "bg-[#3DD8B6]" : "bg-gray-400"
              }`}
            ></div>
            {experience.isActive ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => onDelete(experience.id, experience.title)}
            className="flex-1 lg:flex-none py-2.5 px-4 bg-red-600/20 hover:bg-red-600/30 border-2 border-red-600/50 hover:border-red-500 text-red-400 hover:text-red-300 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-semibold whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
