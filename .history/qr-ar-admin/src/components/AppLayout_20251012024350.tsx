"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { loading } = useAuth();
  const pathname = usePathname();

  // Routes that should not show navbar/footer (auth routes)
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(pathname);

  // Show loading screen without navbar/footer during auth verification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          {/* Futuristic loading animation */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-sky-500/30 rounded-full animate-spin mx-auto">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-sky-400 rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-sky-600/20 rounded-full mx-auto animate-pulse"></div>
          </div>

          {/* Loading text with typing animation */}
          <div className="space-y-2">
            <h2 className="text-xl font-orbitron text-sky-400 animate-pulse">
              QuickAR
            </h2>
            <p className="text-slate-300 flex items-center justify-center space-x-1">
              <span>Verificando autenticación</span>
              <span className="flex space-x-1">
                <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              </span>
            </p>
          </div>

          {/* Futuristic grid background */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-indigo-500/5"></div>
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                animation: 'grid-move 20s linear infinite'
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Show content without navbar/footer for auth routes
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Show full layout with navbar/footer for protected routes
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-4 pb-8">{children}</main>
      <Footer />
    </>
  );
}