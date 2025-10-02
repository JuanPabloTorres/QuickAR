import {
  Activity,
  FileText,
  Github,
  HelpCircle,
  Home,
  Mail,
  Settings,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React from "react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/experiences", label: "Experiencias", icon: Activity },
    { href: "/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/settings", label: "Configuración", icon: Settings },
  ];

  const supportLinks = [
    {
      href: "/documentacion/informacion",
      label: "Documentación",
      icon: FileText,
    },
    {
      href: "/documentacion/centro-de-ayuda",
      label: "Centro de Ayuda",
      icon: HelpCircle,
    },
    { href: "/documentacion/contacto", label: "Contacto", icon: Mail },
  ];

  const socialLinks = [
    { href: "https://github.com", icon: Github, label: "GitHub" },
  ];

  return (
    <footer className="mt-16 border-t-2 border-[#1a2942] bg-gradient-to-b from-[#0F1C2E] to-[#0a1520] backdrop-blur-sm relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3DD8B6]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00D4FF]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-6">
              <div className="relative w-12 h-12">
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
              <span className="text-3xl font-black bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] bg-clip-text text-transparent">
                QR AR
              </span>
            </Link>
            <p className="text-gray-400 text-base leading-relaxed max-w-md mb-6">
              Plataforma profesional para crear y gestionar experiencias de
              realidad aumentada activadas por códigos QR.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4 text-[#3DD8B6]" />
              <span>
                Transforma la forma en que interactúas con tu audiencia
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-5 text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#3DD8B6]" />
              Enlaces Rápidos
            </h3>
            <ul className="space-y-3">
              {links.map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 text-gray-400 hover:text-[#3DD8B6] transition-all group"
                    >
                      <div className="p-1.5 bg-[#1a2942] group-hover:bg-[#3DD8B6]/20 rounded-lg transition-all group-hover:scale-110">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white mb-5 text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#00D4FF]" />
              Soporte
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 text-gray-400 hover:text-[#00D4FF] transition-all group"
                    >
                      <div className="p-1.5 bg-[#1a2942] group-hover:bg-[#00D4FF]/20 rounded-lg transition-all group-hover:scale-110">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t-2 border-[#1a2942]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-gray-400 text-sm font-medium">
                © {currentYear}{" "}
                <span className="text-[#3DD8B6] font-bold">QR AR</span>. Todos
                los derechos reservados.
              </p>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2942] rounded-full border border-[#3DD8B6]/30">
                <div className="w-2 h-2 bg-[#3DD8B6] rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400 font-semibold">
                  Sistema operativo
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <Link
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#1a2942] hover:bg-gradient-to-r hover:from-[#3DD8B6]/20 hover:to-[#00D4FF]/20 border-2 border-[#1a2942] hover:border-[#3DD8B6]/50 rounded-xl text-gray-400 hover:text-[#3DD8B6] transition-all hover:scale-110 group"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
