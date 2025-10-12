"use client";

import { FuturisticButton } from "@/components/ui/futuristic-button";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  Home,
  LogOut,
  Menu,
  Plus,
  Settings,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/experiences", label: "Experiencias", icon: Sparkles },
  { href: "/experiences/create", label: "Crear", icon: Plus },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <QuickArLogo
              size={32}
              className="group-hover:scale-110 transition-transform duration-300"
              animated={true}
            />
            <div className="text-xl font-bold font-orbitron text-white">
              Quick<span className="text-sky-400">AR</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-lg font-medium font-manrope transition-all duration-300 ${
                    isActive
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-lg shadow-sky-500/20"
                      : "text-white/70 hover:text-white hover:bg-white/10 hover:shadow-lg"
                  }`}
                >
                  <IconComponent
                    className={`h-4 w-4 transition-all duration-300 ${
                      isActive ? "text-sky-400" : "group-hover:scale-110"
                    }`}
                  />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <FuturisticButton
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </FuturisticButton>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/10">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg font-medium font-manrope transition-all duration-300 ${
                    isActive
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
