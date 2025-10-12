"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { forwardRef, HTMLAttributes, useEffect } from "react";
import { FuturisticButton } from "./futuristic-button";

interface FuturisticModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const FuturisticModal = forwardRef<HTMLDivElement, FuturisticModalProps>(
  ({ className, open, onClose, title, description, size = "md", children, ...props }, ref) => {
    // Close on Escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open) {
          onClose();
        }
      };

      if (open) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-300"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div
          ref={ref}
          className={cn(
            // Base styles
            "relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl",
            "border border-white/20 rounded-2xl shadow-2xl shadow-black/50",
            "animate-in fade-in-0 zoom-in-95 duration-300",
            
            // Size variants
            {
              "max-w-sm w-full mx-4": size === "sm",
              "max-w-md w-full mx-4": size === "md",
              "max-w-2xl w-full mx-4": size === "lg",
              "max-w-4xl w-full mx-4": size === "xl",
            },
            
            className
          )}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="space-y-1">
              {title && (
                <h2 className="text-xl font-semibold font-orbitron text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm font-manrope text-slate-300">
                  {description}
                </p>
              )}
            </div>
            <FuturisticButton
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </FuturisticButton>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

FuturisticModal.displayName = "FuturisticModal";

// Modal components
const FuturisticModalHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2", className)}
    {...props}
  />
));
FuturisticModalHeader.displayName = "FuturisticModalHeader";

const FuturisticModalTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold font-orbitron text-white", className)}
    {...props}
  />
));
FuturisticModalTitle.displayName = "FuturisticModalTitle";

const FuturisticModalDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-manrope text-slate-300", className)}
    {...props}
  />
));
FuturisticModalDescription.displayName = "FuturisticModalDescription";

const FuturisticModalContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-4", className)}
    {...props}
  />
));
FuturisticModalContent.displayName = "FuturisticModalContent";

const FuturisticModalFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-white/10", className)}
    {...props}
  />
));
FuturisticModalFooter.displayName = "FuturisticModalFooter";

export {
  FuturisticModal,
  FuturisticModalHeader,
  FuturisticModalTitle,
  FuturisticModalDescription,
  FuturisticModalContent,
  FuturisticModalFooter,
};