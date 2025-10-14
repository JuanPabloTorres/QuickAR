import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter, Manrope, Orbitron } from "next/font/google";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Quick AR - Experiencias de Realidad Aumentada",
  description:
    "Plataforma profesional para crear y gestionar experiencias de realidad aumentada con códigos QR",
  keywords: ["AR", "Realidad Aumentada", "QR", "3D", "Experiencias"],
  authors: [{ name: "Quick AR Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        {/* Permisos y configuración para AR */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta
          httpEquiv="Permissions-Policy"
          content="camera=*, microphone=*, gyroscope=*, accelerometer=*, xr-spatial-tracking=*"
        />
        <meta
          httpEquiv="Feature-Policy"
          content="xr-spatial-tracking 'self'; camera 'self'; microphone 'self'; gyroscope 'self'; accelerometer 'self'"
        />

        <Script
          id="suppress-lit-warnings"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('Lit is in dev mode') || 
                      message.includes('Element model-viewer scheduled an update')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${orbitron.variable} ${manrope.variable} font-inter antialiased`}
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
          {/* Futuristic background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-transparent to-indigo-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <AuthProvider>
              <AppLayout>{children}</AppLayout>
            </AuthProvider>
          </div>

          {/* API Debug Info - Only in development */}
          {process.env.NODE_ENV === "development" && <ApiDebugInfo />}
        </div>
      </body>
    </html>
  );
}
