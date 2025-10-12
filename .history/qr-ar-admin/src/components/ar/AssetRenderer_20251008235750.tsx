/**
 * As'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ARAsset } from '@/lib/types';
import { cn } from '@/lib/utils';
import '@/styles/ar-components.css';nderer - Renderiza diferentes tipos de assets AR
 * 
 * Componente que determina cómo mostrar cada tipo de asset:
 * - Texto: Panel flotante
 * - Imagen: Plano con imagen
 * - Video: Reproductor integrado
 * - Modelo 3D: Model-viewer interactivo
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ARAsset } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface AssetRendererProps {
  asset: ARAsset;
  isActive?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  onInteraction?: () => void;
  className?: string;
}

export function AssetRenderer({
  asset,
  isActive = true,
  onLoad,
  onError,
  onInteraction,
  className,
}: AssetRendererProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (message: string) => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(message);
    onError?.(message);
  };

  const handleInteraction = () => {
    onInteraction?.();
  };

  // Renderizar según el tipo de asset
  const renderAssetContent = () => {
    switch (asset.type) {
      case 'text':
        return <TextAsset asset={asset} onLoad={handleLoad} onInteraction={handleInteraction} />;
      
      case 'image':
        return (
          <ImageAsset 
            asset={asset} 
            onLoad={handleLoad} 
            onError={handleError}
            onInteraction={handleInteraction} 
          />
        );
      
      case 'video':
        return (
          <VideoAsset 
            asset={asset} 
            onLoad={handleLoad} 
            onError={handleError}
            onInteraction={handleInteraction} 
          />
        );
      
      case 'model3d':
        return (
          <Model3DAsset 
            asset={asset} 
            onLoad={handleLoad} 
            onError={handleError}
            onInteraction={handleInteraction} 
          />
        );
      
      default:
        return <div>Tipo de asset no soportado</div>;
    }
  };

  return (
    <div
      className={cn(
        'relative w-full h-full',
        !isActive && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">Cargando {asset.type}...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
          <div className="text-center p-4">
            <div className="text-red-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-800">Error al cargar {asset.type}</p>
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Asset content */}
      {!hasError && renderAssetContent()}
    </div>
  );
}

// =============================================================================
// COMPONENTES ESPECÍFICOS POR TIPO
// =============================================================================

interface AssetComponentProps {
  asset: ARAsset;
  onLoad?: () => void;
  onError?: (error: string) => void;
  onInteraction?: () => void;
}

/**
 * Asset de texto - Panel flotante con contenido
 */
function TextAsset({ asset, onLoad, onInteraction }: AssetComponentProps) {
  useEffect(() => {
    // El texto se carga inmediatamente
    onLoad?.();
  }, [onLoad]);

  const transformStyle = {
    transform: `translate3d(${asset.position?.x || 0}px, ${asset.position?.y || 0}px, ${asset.position?.z || 0}px)`,
  };

  return (
    <div
      className="ar-text-asset cursor-pointer hover:bg-white/95 transition-colors"
      onClick={onInteraction}
      style={transformStyle}
    >
      <h3 className="font-medium text-gray-900 mb-2">{asset.name}</h3>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">
        {asset.content || 'Sin contenido'}
      </p>
    </div>
  );
}

/**
 * Asset de imagen - Plano con imagen
 */
function ImageAsset({ asset, onLoad, onError, onInteraction }: AssetComponentProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform"
      onClick={onInteraction}
      style={{
        transform: `translate3d(${asset.position?.x || 0}px, ${asset.position?.y || 0}px, ${asset.position?.z || 0}px) rotateX(${asset.rotation?.x || 0}deg) rotateY(${asset.rotation?.y || 0}deg) rotateZ(${asset.rotation?.z || 0}deg)`,
      }}
    >
      {asset.url && (
        <img
          src={asset.url}
          alt={asset.name}
          className="w-full h-full object-cover"
          onLoad={onLoad}
          onError={() => onError?.('Error al cargar la imagen')}
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
        <p className="text-sm font-medium truncate">{asset.name}</p>
      </div>
    </div>
  );
}

/**
 * Asset de video - Reproductor integrado
 */
function VideoAsset({ asset, onLoad, onError, onInteraction }: AssetComponentProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg"
      onClick={onInteraction}
      style={{
        transform: `translate3d(${asset.position?.x || 0}px, ${asset.position?.y || 0}px, ${asset.position?.z || 0}px) rotateX(${asset.rotation?.x || 0}deg) rotateY(${asset.rotation?.y || 0}deg) rotateZ(${asset.rotation?.z || 0}deg)`,
      }}
    >
      {asset.url && (
        <video
          src={asset.url}
          className="w-full h-full object-cover"
          controls
          preload="metadata"
          onLoadedData={onLoad}
          onError={() => onError?.('Error al cargar el video')}
          onClick={(e) => e.stopPropagation()} // Evitar propagación del click del video
        />
      )}
      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
        🎥 {asset.name}
      </div>
    </div>
  );
}

/**
 * Asset de modelo 3D - Model-viewer interactivo
 */
function Model3DAsset({ asset, onLoad, onError, onInteraction }: AssetComponentProps) {
  useEffect(() => {
    // Cargar el script de model-viewer si no está disponible
    if (typeof customElements.get('model-viewer') === 'undefined') {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  const handleModelLoad = () => {
    onLoad?.();
  };

  const handleModelError = () => {
    onError?.('Error al cargar el modelo 3D');
  };

  return (
    <div
      className="relative w-full h-full"
      onClick={onInteraction}
      style={{
        transform: `translate3d(${asset.position?.x || 0}px, ${asset.position?.y || 0}px, ${asset.position?.z || 0}px)`,
      }}
    >
      {asset.url && (
        <model-viewer
          src={asset.url}
          alt={asset.name}
          auto-rotate={false}
          camera-controls
          interaction-prompt="none"
          style={{ width: '100%', height: '100%', minHeight: '300px' }}
          onLoad={handleModelLoad}
          onError={handleModelError}
        />
      )}
      
      {/* Overlay con información */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
        <h3 className="font-medium text-gray-900 text-sm">{asset.name}</h3>
        <p className="text-xs text-gray-600 mt-1">
          🧊 Modelo 3D interactivo • Arrastra para rotar
        </p>
      </div>
    </div>
  );
}