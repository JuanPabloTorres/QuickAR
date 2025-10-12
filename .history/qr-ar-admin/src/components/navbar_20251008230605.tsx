/**
 * Navbar - Barra de navegación principal
 */

import { cn } from "@/lib/utils";
import Link from "next/link";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <nav
      className={cn("bg-white border-b border-gray-200 shadow-sm", className)}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Quick AR</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/experiences"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Experiencias
            </Link>
            <Link
              href="/experiences/create"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Crear
            </Link>
            <Link
              href="/documentacion"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Documentación
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-blue-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
