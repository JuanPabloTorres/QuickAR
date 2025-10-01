// Experience Card and List Components for the redesigned experiences page

import { motion } from "framer-motion";
import { Calendar, Edit, Eye, Package, Trash2 } from "lucide-react";
import Link from "next/link";

import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard } from "@/components/ui/animated-card";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge, ToggleStatus } from "@/components/ui/status-badge";
import { formatDate, truncateText } from "@/lib/utils";
import { ExperienceDto } from "@/types";

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
      className="group overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-700/50"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
              {experience.title}
            </CardTitle>
            <CardDescription className="text-sm text-blue-300/70 flex items-center mt-1">
              <span className="mr-1">/</span>
              {experience.slug}
            </CardDescription>
          </div>
          <StatusBadge
            status={experience.isActive ? "active" : "inactive"}
            size="sm"
            animate
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {experience.description && (
          <motion.p
            className="text-gray-300 text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {truncateText(experience.description, 120)}
          </motion.p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <motion.div
            className="flex items-center text-gray-400"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Package className="w-4 h-4 mr-2 text-blue-400" />
            <span>
              {experience.assets.length} asset
              {experience.assets.length !== 1 ? "s" : ""}
            </span>
          </motion.div>
          <motion.div
            className="flex items-center text-gray-400"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Calendar className="w-4 h-4 mr-2 text-purple-400" />
            <span>{formatDate(experience.createdAt)}</span>
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
            <AnimatedButton
              variant="outline"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
              className="w-full justify-center"
            >
              Ver Experiencia
            </AnimatedButton>
          </Link>

          {/* Secondary Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Link href={`/experiences/${experience.id}/edit`}>
              <AnimatedButton
                variant="outline"
                size="sm"
                icon={<Edit className="w-4 h-4" />}
                className="w-full justify-center"
              >
                <span className="hidden sm:inline">Editar</span>
                <span className="sm:hidden">Edit</span>
              </AnimatedButton>
            </Link>

            <div className="flex justify-center">
              <ToggleStatus
                isActive={experience.isActive}
                onToggle={() => onToggleActive(experience.id)}
                size="sm"
                labels={{
                  active: experience.isActive ? "Activo" : "Inactivo",
                  inactive: experience.isActive ? "Activo" : "Inactivo",
                }}
              />
            </div>

            <AnimatedButton
              variant="destructive"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => onDelete(experience.id, experience.title)}
              className="w-full justify-center"
            >
              <span className="hidden sm:inline">Eliminar</span>
              <span className="sm:hidden">Del</span>
            </AnimatedButton>
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
      className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800/50 transition-all duration-200"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-white truncate">
                {experience.title}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-400 mt-1">
                <span className="flex items-center">
                  <span className="mr-1">/</span>
                  {experience.slug}
                </span>
                <span className="flex items-center">
                  <Package className="w-4 h-4 mr-1" />
                  {experience.assets.length} assets
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(experience.createdAt)}
                </span>
              </div>
            </div>
            <StatusBadge
              status={experience.isActive ? "active" : "inactive"}
              size="sm"
            />
          </div>
          {experience.description && (
            <p className="text-gray-300 text-sm mt-2 max-w-2xl">
              {truncateText(experience.description, 150)}
            </p>
          )}
        </div>

        {/* Actions Section - Responsive */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:ml-4 min-w-fit">
          <Link
            href={`/experiences/${experience.id}`}
            className="w-full sm:w-auto"
          >
            <AnimatedButton
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver
            </AnimatedButton>
          </Link>

          <Link
            href={`/experiences/${experience.id}/edit`}
            className="w-full sm:w-auto"
          >
            <AnimatedButton
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Editar</span>
              <span className="sm:hidden">Edit</span>
            </AnimatedButton>
          </Link>

          <ToggleStatus
            isActive={experience.isActive}
            onToggle={() => onToggleActive(experience.id)}
            size="sm"
          />

          <AnimatedButton
            variant="destructive"
            size="sm"
            onClick={() => onDelete(experience.id, experience.title)}
            className="w-full sm:w-auto justify-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Eliminar</span>
            <span className="sm:hidden">Del</span>
          </AnimatedButton>
        </div>
      </div>
    </motion.div>
  );
}
