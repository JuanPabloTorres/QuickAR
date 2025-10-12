"use client";

import { 
  FuturisticCard,
  FuturisticCardContent,
  FuturisticCardHeader,
  FuturisticCardTitle,
} from "@/components/ui/futuristic-card";
import { FuturisticButton } from "@/components/ui/futuristic-button";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { 
  Book,
  Code,
  Download,
  ExternalLink,
  FileText,
  Lightbulb,
  Play,
  Rocket,
  Search,
  Settings,
  Smartphone,
  Zap
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");

  const sections = [
    {
      title: "Comenzando",
      icon: <Rocket className="h-5 w-5" />,
      items: [
        { title: "Instalación y Configuración", url: "#installation" },
        { title: "Primeros Pasos", url: "#getting-started" },
        { title: "Configuración del Entorno", url: "#environment" },
      ]
    },
    {
      title: "API Reference",
      icon: <Code className="h-5 w-5" />,
      items: [
        { title: "Endpoints de Experiencias", url: "#experiences-api" },
        { title: "Gestión de Archivos", url: "#files-api" },
        { title: "Analytics y Métricas", url: "#analytics-api" },
      ]
    },
    {
      title: "Guías de Usuario",
      icon: <Book className="h-5 w-5" />,
      items: [
        { title: "Crear Experiencias AR", url: "#create-experiences" },
        { title: "Subir Modelos 3D", url: "#upload-models" },
        { title: "Generar Códigos QR", url: "#generate-qr" },
      ]
    },
    {
      title: "Integración Móvil",
      icon: <Smartphone className="h-5 w-5" />,
      items: [
        { title: "SDK para React Native", url: "#react-native-sdk" },
        { title: "SDK para Flutter", url: "#flutter-sdk" },
        { title: "WebAR Browser", url: "#web-ar" },
      ]
    }
  ];

  const quickLinks = [
    {
      title: "Tutorial Rápido",
      description: "Crea tu primera experiencia AR en 5 minutos",
      icon: <Play className="h-6 w-6 text-green-400" />,
      variant: "glass" as const,
    },
    {
      title: "Ejemplos de Código",
      description: "Repositorio con ejemplos prácticos",
      icon: <Code className="h-6 w-6 text-blue-400" />,
      variant: "neon" as const,
    },
    {
      title: "API Playground",
      description: "Prueba las APIs en tiempo real",
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      variant: "default" as const,
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold font-orbitron text-white mb-2">
          Documentación{" "}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            QuickAR
          </span>
        </h1>
        <p className="text-slate-300 font-manrope mb-6">
          Guías completas, referencias de API y tutoriales para desarrolladores
        </p>
        
        {/* Search */}
        <div className="max-w-md mx-auto">
          <FuturisticInput
            placeholder="Buscar en la documentación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="glass"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickLinks.map((link, index) => (
          <FuturisticCard key={index} variant={link.variant} glow>
            <FuturisticCardContent className="text-center p-6">
              <div className="flex justify-center mb-4">
                {link.icon}
              </div>
              <h3 className="font-bold font-orbitron text-white mb-2">
                {link.title}
              </h3>
              <p className="text-sm text-slate-300 font-manrope mb-4">
                {link.description}
              </p>
              <FuturisticButton variant="ghost" size="sm">
                Explorar
                <ExternalLink className="ml-2 h-4 w-4" />
              </FuturisticButton>
            </FuturisticCardContent>
          </FuturisticCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Getting Started */}
          <FuturisticCard variant="glass">
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Rocket className="mr-2 h-5 w-5 text-sky-400" />
                Comenzando con QuickAR
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-6">
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-bold font-orbitron text-white mb-4">
                  ¿Qué es QuickAR?
                </h3>
                <p className="text-slate-300 font-manrope mb-4">
                  QuickAR es una plataforma completa para crear y gestionar experiencias de realidad aumentada. 
                  Permite a desarrolladores y creadores de contenido generar experiencias AR interactivas 
                  sin necesidad de conocimientos técnicos avanzados.
                </p>
                
                <h4 className="text-lg font-bold font-orbitron text-white mb-3">
                  Características Principales:
                </h4>
                <ul className="space-y-2 text-slate-300 font-manrope">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                    Creación rápida de experiencias AR
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                    Soporte para modelos 3D (.glb, .gltf)
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                    Generación automática de códigos QR
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                    Analytics en tiempo real
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                    API RESTful completa
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="h-5 w-5 text-green-400 mr-2" />
                    <span className="font-medium font-manrope text-green-400">Tip Rápido</span>
                  </div>
                  <p className="text-sm text-green-300 font-manrope">
                    Comienza subiendo un modelo 3D en formato .glb para crear tu primera experiencia AR.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center mb-2">
                    <Settings className="h-5 w-5 text-blue-400 mr-2" />
                    <span className="font-medium font-manrope text-blue-400">Configuración</span>
                  </div>
                  <p className="text-sm text-blue-300 font-manrope">
                    La API está disponible en https://localhost:5002 para desarrollo local.
                  </p>
                </div>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* API Reference */}
          <FuturisticCard variant="neon">
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5 text-sky-400" />
                Referencia de API
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/10">
                  <h4 className="font-bold font-orbitron text-white mb-2">
                    GET /api/experiences
                  </h4>
                  <p className="text-sm text-slate-300 font-manrope mb-3">
                    Obtiene la lista de todas las experiencias AR disponibles
                  </p>
                  <div className="bg-slate-900/70 rounded-lg p-3 font-mono text-sm">
                    <code className="text-green-400">
                      curl -X GET https://localhost:5002/api/experiences
                    </code>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/10">
                  <h4 className="font-bold font-orbitron text-white mb-2">
                    POST /api/experiences
                  </h4>
                  <p className="text-sm text-slate-300 font-manrope mb-3">
                    Crea una nueva experiencia AR
                  </p>
                  <div className="bg-slate-900/70 rounded-lg p-3 font-mono text-sm">
                    <code className="text-yellow-400">
                      {`{
  "name": "Mi Experiencia AR",
  "description": "Una experiencia increíble",
  "assetType": "model",
  "assetUrl": "/uploads/models/model.glb"
}`}
                    </code>
                  </div>
                </div>

                <FuturisticButton variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Documentación Completa de API
                </FuturisticButton>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Navigation */}
          <FuturisticCard variant="default">
            <FuturisticCardHeader>
              <FuturisticCardTitle>
                Navegación
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent>
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={index}>
                    <div className="flex items-center text-white font-medium font-manrope mb-2">
                      {section.icon}
                      <span className="ml-2">{section.title}</span>
                    </div>
                    <ul className="space-y-1 ml-7">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <Link 
                            href={item.url}
                            className="text-sm text-slate-400 hover:text-sky-400 transition-colors font-manrope"
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* Downloads */}
          <FuturisticCard variant="glass" glow>
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5 text-sky-400" />
                Descargas
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-3">
              <FuturisticButton variant="ghost" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Guía PDF Completa
              </FuturisticButton>
              <FuturisticButton variant="ghost" className="w-full justify-start">
                <Code className="mr-2 h-4 w-4" />
                Ejemplos de Código
              </FuturisticButton>
              <FuturisticButton variant="ghost" className="w-full justify-start">
                <Smartphone className="mr-2 h-4 w-4" />
                SDK Móvil
              </FuturisticButton>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* Quick Help */}
          <FuturisticCard variant="neon">
            <FuturisticCardHeader>
              <FuturisticCardTitle>
                ¿Necesitas Ayuda?
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="text-center">
              <p className="text-sm text-slate-300 font-manrope mb-4">
                Nuestro equipo está aquí para ayudarte
              </p>
              <FuturisticButton variant="outline" className="w-full mb-2">
                Contactar Soporte
              </FuturisticButton>
              <FuturisticButton variant="ghost" className="w-full">
                Chat en Vivo
              </FuturisticButton>
            </FuturisticCardContent>
          </FuturisticCard>
        </div>
      </div>
    </div>
  );
}