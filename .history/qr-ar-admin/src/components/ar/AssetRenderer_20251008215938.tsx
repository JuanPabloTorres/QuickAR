"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
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

  const containerClasses = `
    relative rounded-xl overflow-hidden 
    bg-slate-50 border border-slate-200
    ${className}
  `;

  const renderTextAsset = () => (
    <div 
      className={containerClasses}
      style={{ width: size, height: size }}
    >
      <div className="flex items-center justify-center h-full p-6">
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
    </div>
  );

  const renderImageAsset = () => (
    <div className={containerClasses} style={{ width: size, height: size }}>
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
    <div className={containerClasses} style={{ width: size, height: size }}>
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
      className={containerClasses}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-blue-500">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12.8333 7.33333L19.5 11L12.8333 14.6667L6.16667 11L12.8333 7.33333Z"/>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.16667 13.6667L12.8333 17.3333L19.5 13.6667"/>
            </svg>
          </div>
          <h3 className="font-medium text-gray-900 text-sm mb-2">{asset.name}</h3>
          <p className="text-xs text-gray-500">Modelo 3D</p>
          {asset.assetUrl && (
            <p className="text-xs text-gray-400 mt-1 truncate max-w-32">
              {asset.assetUrl.split('/').pop()}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className={containerClasses} style={{ width: size, height: size }}>
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-red-500">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 13.25L12 8.75"/>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16.25V16.25"/>
            </svg>
          </div>
          <p className="text-xs text-red-600">Error al cargar {asset.name}</p>
        </div>
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