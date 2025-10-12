import { cn } from "@/lib/utils";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          // Base modal styling with futuristic glass effect
          "relative w-full max-w-md mx-4 max-h-[90vh] overflow-hidden",
          // Futuristic glass morphism
          "bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-600/40",
          // Shadow and glow effects
          "shadow-2xl shadow-black/50",
          // Subtle inner glow
          "before:absolute before:inset-0 before:rounded-xl before:border before:border-gray-400/10 before:bg-gradient-to-br before:from-blue-500/10 before:via-transparent before:to-purple-500/10 before:pointer-events-none",
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-600/30">
            <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={cn("p-6", title ? "pt-0" : "", "text-gray-100")}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;