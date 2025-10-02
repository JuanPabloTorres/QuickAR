"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Filter, Search, SortAsc, SortDesc, X } from "lucide-react";
import React from "react";
import { Button } from "./button";
import { Input } from "./input";

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, order: "asc" | "desc") => void;
  filters?: Array<{
    key: string;
    label: string;
    active: boolean;
    count?: number;
  }>;
  onFilterToggle?: (key: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  sortBy,
  sortOrder = "asc",
  onSortChange,
  filters = [],
  onFilterToggle,
  className,
  placeholder = "Buscar...",
}: SearchFilterBarProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const hasActiveFilters = filters.some((f) => f.active);

  const sortOptions = [
    { key: "title", label: "Título" },
    { key: "createdAt", label: "Fecha de creación" },
    { key: "updatedAt", label: "Última actualización" },
    { key: "assets", label: "Número de assets" },
  ];

  return (
    <motion.div
      className={cn("space-y-4", className)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 bg-slate-800/50 border-slate-700/50 focus:border-blue-500/50 focus:ring-blue-500/20"
          />
          {searchValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-gray-400" />
            </motion.button>
          )}
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "relative",
            hasActiveFilters && "border-blue-500/50 bg-blue-500/10"
          )}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </Button>

        {/* Sort Menu */}
        {onSortChange && (
          <div className="flex items-center space-x-1">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value, sortOrder)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-md px-3 py-2 text-sm focus:border-blue-500/50 focus:ring-blue-500/20"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onSortChange(
                  sortBy || "title",
                  sortOrder === "asc" ? "desc" : "asc"
                )
              }
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <motion.div
        initial={false}
        animate={{
          height: showFilters ? "auto" : 0,
          opacity: showFilters ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        {showFilters && (
          <motion.div
            className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              Filtrar por:
            </h4>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <motion.button
                  key={filter.key}
                  onClick={() => onFilterToggle?.(filter.key)}
                  className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                    filter.active
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-slate-700/50 text-gray-300 hover:bg-slate-600/50"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {filter.label}
                  {filter.count !== undefined && (
                    <span
                      className={cn(
                        "ml-1.5 px-1.5 py-0.5 rounded-full text-xs",
                        filter.active
                          ? "bg-white/20 text-white"
                          : "bg-slate-600/50 text-gray-400"
                      )}
                    >
                      {filter.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {hasActiveFilters && (
              <motion.div
                className="pt-3 border-t border-slate-700/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    filters.forEach((f) => f.active && onFilterToggle?.(f.key))
                  }
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar filtros
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
