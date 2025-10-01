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
              <Image
                src="/logo.svg"
                alt="QR AR Admin"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-qr-500 bg-clip-text text-transparent">
                QR AR Admin
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
