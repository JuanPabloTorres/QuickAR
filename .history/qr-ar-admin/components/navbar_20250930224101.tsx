"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/experiences", label: "Experiencias", icon: "✨" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
  { href: "/settings", label: "Configuración", icon: "⚙️" },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="glass border-b border-white/20 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-white">
              QR AR Admin
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-white/20 text-white"
                    : "text-blue-200 hover:text-white hover:bg-white/10"
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="md:hidden">
            <button className="text-white p-2">
              <span className="sr-only">Abrir menú</span>☰
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
