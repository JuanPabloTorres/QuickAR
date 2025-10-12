/**
 * Footer - Pie de página
 */

import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-gray-50 border-t border-gray-200", className)}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo y descripción */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Quick AR</span>
            </div>
            <p className="text-gray-600 text-sm">
              Plataforma de experiencias de Realidad Aumentada fácil de usar y potente.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Navegación
            </h3>
            <div className="space-y-2">
              <a href="/experiences" className="block text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Experiencias
              </a>
              <a href="/experiences/create" className="block text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Crear Experiencia
              </a>
              <a href="/documentacion" className="block text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Documentación
              </a>
            </div>
          </div>

          {/* Info técnica */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Tecnología
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">Next.js + .NET</p>
              <p className="text-gray-600 text-sm">WebXR Compatible</p>
              <p className="text-gray-600 text-sm">Model-viewer</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Quick AR. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}