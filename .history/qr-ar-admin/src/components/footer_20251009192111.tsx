import { QuickArLogo } from "@/components/ui/quick-ar-logo";

export function Footer() {
  return (
    <footer className="glass border-t border-white/20 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-2">
            <div className="text-xl">🎯</div>
            <div className="text-sm text-white/80">
              © 2025 QuickAR. Plataforma profesional de Realidad Aumentada.
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-sm text-white/60">
            <a href="/docs" className="hover:text-white transition-colors">
              Documentación
            </a>
            <a href="/support" className="hover:text-white transition-colors">
              Soporte
            </a>
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacidad
            </a>
          </div>
        </div>

        {/* Version and Status */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40">
          <div>v1.0.0 - AR Platform</div>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sistema operativo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
