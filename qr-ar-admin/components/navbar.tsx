"use client";

import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { cn } from "@/lib/utils";
import {
  Activity,
  Home,
  Menu,
  Plus,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/experiences", label: "Experiencias", icon: Activity },
  { href: "/experiences/new", label: "Nueva", icon: Plus },
  { href: "/analytics", label: "Analytics", icon: TrendingUp },
  {
    href: "/configuraciones/panel-control",
    label: "Configuración",
    icon: Settings,
  },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0F1C2E]/95 backdrop-blur-xl border-b-2 border-[#1a2942]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 transform group-hover:scale-110 transition-transform duration-300">
                {/* Outer glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>

                {/* Logo SVG */}
                <svg viewBox="0 0 40 40" className="relative w-full h-full">
                  {/* QR Code corners */}
                  <rect
                    x="2"
                    y="2"
                    width="7"
                    height="7"
                    rx="1.5"
                    fill="#3DD8B6"
                  />
                  <rect
                    x="31"
                    y="2"
                    width="7"
                    height="7"
                    rx="1.5"
                    fill="#00D4FF"
                  />
                  <rect
                    x="2"
                    y="31"
                    width="7"
                    height="7"
                    rx="1.5"
                    fill="#00D4FF"
                  />

                  {/* Inner squares */}
                  <rect
                    x="4"
                    y="4"
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="#0F1C2E"
                  />
                  <rect
                    x="33"
                    y="4"
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="#0F1C2E"
                  />
                  <rect
                    x="4"
                    y="33"
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="#0F1C2E"
                  />

                  {/* QR pattern dots */}
                  <circle cx="14" cy="6" r="1.5" fill="#3DD8B6" />
                  <circle cx="19" cy="6" r="1.5" fill="#3DD8B6" />
                  <circle cx="24" cy="6" r="1.5" fill="#00D4FF" />

                  <circle cx="6" cy="14" r="1.5" fill="#3DD8B6" />
                  <circle cx="6" cy="19" r="1.5" fill="#3DD8B6" />
                  <circle cx="6" cy="24" r="1.5" fill="#00D4FF" />

                  {/* AR cube in center */}
                  <g transform="translate(17, 17)">
                    <path
                      d="M0,0 L3,-2 L6,0 L6,3 L3,5 L0,3 Z"
                      fill="#3DD8B6"
                      opacity="0.9"
                    />
                    <path
                      d="M0,0 L0,3 L3,5 L3,2 Z"
                      fill="#00D4FF"
                      opacity="0.7"
                    />
                    <path
                      d="M3,2 L6,0 L6,3 L3,5 Z"
                      fill="#3DD8B6"
                      opacity="0.95"
                    />
                  </g>
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] bg-clip-text text-transparent">
                  Qick AR
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative group",
                    isActive
                      ? "bg-gradient-to-r from-[#3DD8B6]/20 to-[#00D4FF]/20 text-[#3DD8B6] border-2 border-[#3DD8B6]/50 shadow-lg shadow-[#3DD8B6]/20"
                      : "text-gray-400 hover:text-white hover:bg-[#1a2942] border-2 border-transparent hover:border-[#1a2942]"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3DD8B6]/10 to-[#00D4FF]/10 rounded-xl blur-sm"></div>
                  )}
                  <Icon
                    className={cn(
                      "w-4 h-4 relative z-10 transition-transform group-hover:scale-110",
                      isActive ? "text-[#3DD8B6]" : ""
                    )}
                  />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <DarkModeToggle
              isDark={isDark}
              onToggle={toggleDarkMode}
              size="icon"
              variant="ghost"
            />

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                className="text-gray-400 hover:text-white hover:bg-[#1a2942]"
              >
                {isOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t-2 border-[#1a2942] py-4 animate-in slide-in-from-top duration-200">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-[#3DD8B6]/20 to-[#00D4FF]/20 text-[#3DD8B6] border-2 border-[#3DD8B6]/50 shadow-lg shadow-[#3DD8B6]/20"
                        : "text-gray-400 hover:text-white hover:bg-[#1a2942] border-2 border-transparent"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        isActive ? "bg-[#3DD8B6]/20" : "bg-[#1a2942]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isActive ? "text-[#3DD8B6]" : "text-gray-400"
                        )}
                      />
                    </div>
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#3DD8B6] animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
