"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ARAsset } from '../../types';

interface AssetRendererProps {
  asset: ARAsset;
  size?: number;
  className?: string;
  enableInteraction?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: string) => void;
}

/**
 * AssetRenderer Component
 * Handles rendering of different asset types in AR/3D environment
 * Maintains clean, professional styling without auto-animations
 */
export function AssetRenderer({
  asset,
  size = 300,
  className = '',
  enableInteraction = true,
  onLoadStart,
  onLoadEnd,
  onError,
}: AssetRendererProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modelViewerRef = useRef<any>(null);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  const handleError = useCallback((error: string) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  }, [onError]);

  // Load model-viewer dynamically for 3D models
  useEffect(() => {
    if (asset.assetType === 'model3d' && typeof window !== 'undefined') {
      import('@google/model-viewer').catch((err) => {
        handleError('Failed to load 3D model viewer');
      });
    }
  }, [asset.assetType, handleError]);

  // Common container styles
  const baseStyles = {
    width: `${size}px`,
    height: `${size}px`,
    position: 'relative' as const,
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: 'rgb(248, 250, 252)', // Neutral background
    border: '1px solid rgb(226, 232, 240)', // Subtle border
  };

  const renderTextAsset = () => (
    <div 
      style={baseStyles}
      className={`flex items-center justify-center p-6 ${className}`}
    >
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-gray-500">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.75 19.25L9 18.25L18.2929 8.95711C18.6834 8.56658 18.6834 7.93342 18.2929 7.54289L16.4571 5.70711C16.0666 5.31658 15.4334 5.31658 15.0429 5.70711L5.75 15L4.75 19.25Z"/>
          </svg>
        </div>
        <h3 className="font-medium text-gray-900 text-sm mb-2">{asset.name}</h3>
        <p className="text-xs text-gray-600 leading-relaxed max-w-48">
          {asset.assetContent}
        </p>
      </div>
    </div>
  );

  const renderImageAsset = () => (
    <div style={baseStyles} className={className}>
      <img
        src={asset.assetUrl}
        alt={asset.name}
        className="w-full h-full object-cover"
        onLoadStart={handleLoadStart}
        onLoad={handleLoadEnd}
        onError={() => handleError('Failed to load image')}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        </div>
      )}
    </div>
  );

  const renderVideoAsset = () => (
    <div style={baseStyles} className={className}>
      <video
        src={asset.assetUrl}
        className="w-full h-full object-cover"
        controls={enableInteraction}
        muted
        playsInline
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadEnd}
        onError={() => handleError('Failed to load video')}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        </div>
      )}
    </div>
  );

  const renderModel3DAsset = () => (
    <div 
      ref={containerRef}
      style={baseStyles} 
      className={`model-viewer-container ${className}`}
    >
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Cargando modelo 3D...</p>
          </div>
        </div>
      }>
        <model-viewer
          ref={modelViewerRef}
          src={asset.assetUrl}
          alt={asset.name}
          className="w-full h-full"
          camera-controls={enableInteraction}
          disable-zoom={!enableInteraction}
          disable-pan={!enableInteraction}
          auto-rotate={false} // No auto-animations
          loading="eager"
          reveal="auto"
          style={{
            backgroundColor: 'transparent',
            '--poster-color': 'transparent',
          }}
          onLoad={handleLoadEnd}
          onError={() => handleError('Failed to load 3D model')}
        />
      </Suspense>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Cargando modelo 3D...</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderError = () => (
    <div 
      style={baseStyles}
      className={`flex items-center justify-center ${className}`}
    >
      <div className="text-center p-4">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-red-500">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 13.25L12 8.75"/>
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16.25V16.25"/>
          </svg>
        </div>
        <p className="text-xs text-red-600">Error al cargar {asset.name}</p>
      </div>
    </div>
  );

  if (hasError) {
    return renderError();
  }

  switch (asset.assetType) {
    case 'text':
      return renderTextAsset();
    case 'image':
      return renderImageAsset();
    case 'video':
      return renderVideoAsset();
    case 'model3d':
      return renderModel3DAsset();
    default:
      return renderError();
  }
}

export default AssetRenderer;