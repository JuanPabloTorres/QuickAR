"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "home" },
  { href: "/experiences", label: "Experiencias", icon: "ar" },
  { href: "/analytics", label: "Analytics", icon: "view" },
  { href: "/settings", label: "Configuración", icon: "settings" },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    // TODO: Implement actual dark mode toggle
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <svg
                viewBox="0 0 40 40"
                className="w-full h-full fill-current text-blue-600 dark:text-blue-400"
              >
                {/* QR Code squares */}
                <rect x="2" y="2" width="6" height="6" rx="1" />
                <rect x="32" y="2" width="6" height="6" rx="1" />
                <rect x="2" y="32" width="6" height="6" rx="1" />

                {/* Inner squares */}
                <rect x="4" y="4" width="2" height="2" />
                <rect x="34" y="4" width="2" height="2" />
                <rect x="4" y="34" width="2" height="2" />

                {/* QR pattern dots */}
                <circle cx="14" cy="6" r="1" />
                <circle cx="18" cy="6" r="1" />
                <circle cx="22" cy="6" r="1" />
                <circle cx="26" cy="6" r="1" />

                <circle cx="6" cy="14" r="1" />
                <circle cx="6" cy="18" r="1" />
                <circle cx="6" cy="22" r="1" />
                <circle cx="6" cy="26" r="1" />

                {/* AR cube in center */}
                <g transform="translate(16, 16)">
                  <path d="M0,0 L4,-2 L8,0 L8,4 L4,6 L0,4 Z" opacity="0.8" />
                  <path d="M0,0 L0,4 L4,6 L4,2 Z" opacity="0.6" />
                  <path d="M4,2 L8,0 L8,4 L4,6 Z" opacity="0.9" />
                </g>
              </svg>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-qr-500 bg-clip-text text-transparent">
                QR AR
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-brand-500/20 text-brand-400 shadow-neon-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon name={item.icon} size="sm" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
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
              >
                <Icon name={isOpen ? "close" : "menu"} size="md" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "bg-brand-500/20 text-brand-400"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon name={item.icon} size="sm" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
