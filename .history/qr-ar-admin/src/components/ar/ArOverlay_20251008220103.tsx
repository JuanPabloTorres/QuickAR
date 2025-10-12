"use client";

import React from 'react';
import { ARExperience } from '../../types';

interface ARState {
  isARSupported: boolean;
  isARActive: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ArOverlayProps {
  experience: ARExperience;
  arState: ARState;
  onBack?: () => void;
  onARActivate?: () => void;
  onARDeactivate?: () => void;
  onError?: (error: string) => void;
}

/**
 * ArOverlay Component
 * Floating UI overlay for AR experiences
 * Provides controls and information display over AR content
 */
export function ArOverlay({
  experience,
  arState,
  onBack,
  onARActivate,
  onARDeactivate,
  onError,
}: ArOverlayProps) {

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="
              flex items-center space-x-2 px-3 py-2 
              bg-black bg-opacity-50 rounded-lg
              text-white hover:bg-opacity-70
              transition-colors backdrop-blur-sm
            "
            title="Volver"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M19 12H5M12 19L5 12L12 5"
              />
            </svg>
            <span className="text-sm font-medium">Volver</span>
          </button>

          {/* Experience Title */}
          <div className="
            max-w-xs px-4 py-2 
            bg-black bg-opacity-50 rounded-lg
            backdrop-blur-sm
          ">
            <h1 className="text-white text-sm font-medium truncate">
              {experience.title}
            </h1>
            {experience.description && (
              <p className="text-gray-300 text-xs truncate mt-1">
                {experience.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-4">
        <div className="flex items-center justify-center space-x-4">
          
          {/* AR Toggle Button */}
          {arState.isARSupported && (
            <button
              onClick={arState.isARActive ? onARDeactivate : onARActivate}
              disabled={arState.isLoading}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all
                flex items-center space-x-2
                ${arState.isARActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
                ${arState.isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                backdrop-blur-sm shadow-lg
              `}
              title={arState.isARActive ? 'Salir de AR' : 'Activar AR'}
            >
              {arState.isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <path 
                    stroke="currentColor" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d={arState.isARActive 
                      ? "M6 18L18 6M6 6l12 12" 
                      : "M15 10L11 14L9 12M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    }
                  />
                </svg>
              )}
              <span>
                {arState.isARActive ? 'Salir AR' : 'Ver en AR'}
              </span>
            </button>
          )}

          {/* Asset Count Indicator */}
          {experience.assets.length > 0 && (
            <div className="
              px-3 py-2 
              bg-black bg-opacity-50 rounded-lg
              text-white text-sm
              backdrop-blur-sm
            ">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <path 
                    stroke="currentColor" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"
                  />
                </svg>
                <span>{experience.assets.length} assets</span>
              </div>
            </div>
          )}
        </div>

        {/* AR Not Supported Message */}
        {!arState.isARSupported && (
          <div className="mt-4 mx-auto max-w-sm">
            <div className="
              px-4 py-3 
              bg-yellow-500 bg-opacity-90 rounded-lg
              text-yellow-900 text-sm text-center
              backdrop-blur-sm
            ">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <path 
                    stroke="currentColor" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span>AR no disponible en este dispositivo</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side Info Panel (when in AR mode) */}
      {arState.isARActive && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30">
          <div className="
            w-64 p-4 
            bg-black bg-opacity-50 rounded-lg
            text-white backdrop-blur-sm
          ">
            <h3 className="font-medium mb-2">Información AR</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Assets:</span>
                <span>{experience.assets.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="text-green-400">Activo</span>
              </div>
              {experience.assets.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Assets disponibles:</p>
                  <div className="space-y-1">
                    {experience.assets.slice(0, 3).map((asset, index) => (
                      <div key={asset.id} className="flex items-center space-x-2 text-xs">
                        <div className={`
                          w-2 h-2 rounded-full
                          ${asset.assetType === 'model3d' ? 'bg-blue-400' : 
                            asset.assetType === 'image' ? 'bg-green-400' :
                            asset.assetType === 'video' ? 'bg-purple-400' : 'bg-gray-400'}
                        `}></div>
                        <span className="truncate">{asset.name}</span>
                      </div>
                    ))}
                    {experience.assets.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{experience.assets.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ArOverlay;