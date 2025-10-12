import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QR AR",
  description:
    "Panel de administración para experiencias de realidad aumentada con códigos QR",
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
          <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
