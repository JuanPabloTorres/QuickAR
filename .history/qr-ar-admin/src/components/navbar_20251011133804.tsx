"use client";

import { FuturisticButton } from "@/components/ui/futuristic-button";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import {
  HomeIcon,
  SparklesIcon,
  PlusIcon,
  AnalyticsIcon,
  SettingsIcon,
  MenuIcon,
  UserIcon,
  LogoutIcon,
  CloseIcon,
} from "@/components/ui/svg-icons";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/experiences", label: "Experiencias", icon: SparklesIcon },
  { href: "/experiences/create", label: "Crear", icon: PlusIcon },
  { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/settings", label: "Configuración", icon: SettingsIcon },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

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

          {/* User Menu (Desktop) */}
          {isAuthenticated && user && (
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" size={16} />
                </div>
                <span className="text-sm font-medium">{user.username}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">
                      {user.username}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 mr-3" size={16} />
                      Mi Perfil
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <SettingsIcon className="w-4 h-4 mr-3" size={16} />
                      Configuración
                    </Link>
                    <hr className="my-1 border-white/10" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogoutIcon className="w-4 h-4 mr-3" size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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

            {/* User Menu (Mobile) */}
            {isAuthenticated && user && (
              <>
                <div className="px-3 py-3 border-t border-white/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user.username}
                      </p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
