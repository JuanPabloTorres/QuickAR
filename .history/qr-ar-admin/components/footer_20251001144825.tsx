import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import React from "react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/experiences", label: "Experiencias" },
    { href: "/analytics", label: "Analytics" },
    { href: "/settings", label: "Configuración" },
  ];

  const socialLinks = [
    { href: "https://github.com", icon: "github", label: "GitHub" },
  ];

  return (
    <footer className="mt-16 border-t border-white/10 bg-slate-950/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="qr" size="lg" className="text-brand-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-qr-500 bg-clip-text text-transparent">
                QR AR
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Plataforma profesional para crear y gestionar experiencias de
              realidad aumentada activadas por códigos QR. Transforma la forma
              en que interactúas con tu audiencia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-brand-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Soporte</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs"
                  className="text-muted-foreground hover:text-brand-400 transition-colors text-sm"
                >
                  Documentación
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-brand-400 transition-colors text-sm"
                >
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-brand-400 transition-colors text-sm"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} QR AR Admin. Todos los derechos reservados.
          </p>

          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {socialLinks.map((social) => (
              <Link
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-400 transition-colors"
                aria-label={social.label}
              >
                <Icon name={social.icon} size="md" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
