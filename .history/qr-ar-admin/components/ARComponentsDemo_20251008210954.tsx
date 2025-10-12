import React from 'react';
import { ExperienceCubeRefactored } from './ExperienceCubeRefactored';
import { AssetKind } from '@/types';

/**
 * Demo component showing the refactored AR experience cube
 * with unified contracts and improved AR capabilities
 */
export function ARComponentsDemo() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AR Components Demo - Refactorizado
          </h1>
          <p className="text-gray-600">
            Componentes AR mejorados con contratos unificados (camelCase) y experiencias interactivas
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          
          {/* Texto/Mensaje */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Contenido de Texto</h2>
            <ExperienceCubeRefactored
              assetKind="message"
              assetContent="¡Bienvenido a la experiencia AR refactorizada! Este texto se muestra con estilos neutros y controles unificados."
              educationalMode={true}
              educationalContent={{
                title: "Experiencia de Texto AR",
                description: "Los mensajes de texto pueden incluir información educativa y se renderizan de forma consistente.",
                audioUrl: undefined
              }}
              className="mb-4"
            />
          </div>

          {/* Imagen */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Imagen AR</h2>
            <ExperienceCubeRefactored
              assetKind="image"
              assetUrl="/logo.svg"
              alt="Logo de la aplicación"
              enableAR={true}
              educationalMode={false}
              className="mb-4"
            />
          </div>

          {/* Video */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Video AR</h2>
            <ExperienceCubeRefactored
              assetKind="video"
              assetUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              alt="Video demo"
              enableAR={true}
              educationalMode={true}
              educationalContent={{
                title: "Video Interactivo",
                description: "Los videos se pueden reproducir en AR con controles manuales.",
              }}
              className="mb-4"
            />
          </div>

          {/* Modelo 3D con AR completo */}
          <div className="space-y-4 md:col-span-2 xl:col-span-3">
            <h2 className="text-xl font-semibold text-gray-800">Modelo 3D con AR Avanzado</h2>
            <div className="flex justify-center">
              <ExperienceCubeRefactored
                assetKind="model3d"
                assetUrl="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
                alt="Astronauta 3D"
                enableAR={true}
                arScale="auto"
                arPlacement="floor"
                size={400}
                educationalMode={true}
                educationalContent={{
                  title: "Modelo 3D Interactivo",
                  description: "Este astronauta se puede ver en AR con controles manuales completos. Usa los botones para mover, rotar y escalar el modelo antes de pasar a AR.",
                }}
                onARStateChange={(isInAR) => {
                  console.log('Estado AR cambiado:', isInAR ? 'Activo' : 'Desactivado');
                }}
                className="mb-4"
              />
            </div>
          </div>

        </div>

        {/* Features highlight */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Características Implementadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">✅ Contratos Unificados</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>assetKind</code> (message, image, video, model3d)</li>
                <li>• camelCase en toda la interfaz</li>
                <li>• Tipos consistentes con backend DTOs</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">🎮 Controles Manuales</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Movimiento (izquierda/derecha)</li>
                <li>• Rotación (sentido horario/antihorario)</li>
                <li>• Escalado (zoom in/out)</li>
                <li>• Botón reset para posición inicial</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">🚀 AR Avanzado</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Soporte WebXR, Scene Viewer, Quick Look</li>
                <li>• Detección automática de dispositivos</li>
                <li>• Indicadores de estado AR en tiempo real</li>
                <li>• Configuración de escala y posicionamiento</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">🎨 Diseño Neutral</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Paleta de colores grises neutros</li>
                <li>• Animaciones suaves con Framer Motion</li>
                <li>• Responsivo y accesible</li>
                <li>• Modo educativo integrado</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical specifications */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            🔧 Especificaciones Técnicas
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Frontend:</strong> Next.js 15 + React 19 + TypeScript</p>
            <p><strong>AR Engine:</strong> @google/model-viewer + Three.js + WebXR</p>
            <p><strong>Styling:</strong> Tailwind CSS + CSS Modules para AR</p>
            <p><strong>Animaciones:</strong> Framer Motion para transiciones</p>
            <p><strong>Compatibilidad:</strong> iOS (Quick Look) + Android (Scene Viewer) + Navegadores WebXR</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ARComponentsDemo;