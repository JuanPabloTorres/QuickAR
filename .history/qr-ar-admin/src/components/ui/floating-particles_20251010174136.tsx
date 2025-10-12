"use client";

import { cn } from "@/lib/utils";

// Simple floating decoration component without inline styles
export function FloatingDecoration() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
      {/* Animated circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-sky-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl animate-bounce" />
      <div className="absolute bottom-32 left-1/4 w-56 h-56 bg-purple-500/25 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 right-1/3 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl animate-bounce delay-500" />
      
      {/* Subtle light effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500/5 to-transparent opacity-30" />
    </div>
  );
}

// Fun achievement notification
export function AchievementNotification({ 
  achievement, 
  show, 
  onClose 
}: { 
  achievement?: { title: string; description: string; }; 
  show: boolean; 
  onClose: () => void;
}) {
  if (!show || !achievement) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-4 rounded-xl shadow-2xl max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="text-3xl animate-bounce">🏆</div>
          <div className="flex-1">
            <div className="font-bold text-sm">¡Logro Desbloqueado!</div>
            <div className="font-orbitron text-xs">{achievement.title}</div>
            <div className="text-xs opacity-90">{achievement.description}</div>
          </div>
          <button 
            onClick={onClose}
            className="text-black/70 hover:text-black transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton with personality
export function FunLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full animate-spin" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-700/50 rounded animate-pulse" />
          <div className="h-3 bg-slate-700/30 rounded w-3/4 animate-pulse delay-150" />
        </div>
      </div>
      <div className="text-center text-slate-400 animate-bounce">
        🚀 Cargando magia AR...
      </div>
    </div>
  );
}