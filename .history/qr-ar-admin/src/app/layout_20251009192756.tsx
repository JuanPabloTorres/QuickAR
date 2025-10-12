import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quick AR - Experiencias de Realidad Aumentada",
  description:
    "Plataforma profesional para crear y gestionar experiencias de realidad aumentada con códigos QR",
  keywords: ["AR", "Realidad Aumentada", "QR", "3D", "Experiencias"],
  authors: [{ name: "Quick AR Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 text-foreground flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
