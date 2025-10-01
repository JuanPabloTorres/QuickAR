"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AssetDto } from '@/types';

interface ARViewerProps {
  asset: AssetDto;
  onTrackEvent: (event: string, data?: string) => void;
}

interface ARCapabilities {
  hasCamera: boolean;
  isSecureContext: boolean;
  canUseAR: boolean;
}

interface CameraPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

// Simple AR Camera Component
const SimpleARViewer: React.FC<{ 
  assetUrl: string; 
  assetName: string; 
  onClose: () => void;
  onTrackEvent: (event: string, data?: string) => void;
}> = ({ assetUrl, assetName, onClose, onTrackEvent }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        onTrackEvent('camera_started', assetName);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      let errorMessage = "No se pudo acceder a la cámara.";
      
      if (err.name === 'NotAllowedError') {
        errorMessage = "Permiso de cámara denegado. Por favor, permite el acceso y recarga la página.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "No se encontró cámara en el dispositivo.";
      }
      
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onTrackEvent('camera_closed', assetName);
    onClose();
  };

  const handleVideoReady = () => {
    setIsVideoReady(true);
    onTrackEvent('camera_ready', assetName);
  };

  return (
    <div className="ar-fullscreen">
      {/* Video de cámara de fondo */}
      {error ? (
        <div className="flex-1 flex items-center justify-center bg-slate-800">
          <div className="text-center text-white">
            <p className="text-xl mb-4">⚠️ Error de Cámara</p>
            <p className="mb-4">{error}</p>
            <button
              onClick={handleClose}
              className="ar-btn ar-btn-secondary"
            >
              Volver
            </button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="ar-camera-video"
          onLoadedMetadata={handleVideoReady}
        />
      )}

      {/* Controles superiores */}
      <div className="ar-header ar-header-no-events">
        <div className="ar-header-content ar-header-content-auto">
          <h3 className="ar-title">
            AR: {assetName}
          </h3>
          <button
            onClick={handleClose}
            className="ar-close-btn"
          >
            ❌ Cerrar
          </button>
        </div>
      </div>

      {/* Overlay de contenido */}
      {overlayVisible && isVideoReady && !error && (
        <div className="ar-overlay ar-overlay-no-events">
          <div className="ar-content-wrapper">
            <img
              src={assetUrl}
              alt={assetName}
              className="ar-overlay-image"
              onLoad={() => onTrackEvent('overlay_loaded', assetName)}
              onError={() => onTrackEvent('overlay_error', assetName)}
            />
            <p className="text-white text-center mt-2 font-semibold">
              {assetName}
            </p>
          </div>
        </div>
      )}

      {/* Controles inferiores */}
      <div className="ar-footer ar-footer-no-events">
        <div className="ar-footer-content ar-footer-content-auto">
          <button
            onClick={() => {
              setOverlayVisible(!overlayVisible);
              onTrackEvent('overlay_toggle', overlayVisible ? 'hide' : 'show');
            }}
            className="ar-toggle-btn"
          >
            {overlayVisible ? '👁️ Ocultar' : '👁️‍🗨️ Mostrar'}
          </button>
          
          <div className="ar-instructions">
            📱 Mueve el dispositivo para explorar
          </div>
        </div>
      </div>

      {/* Estado de carga */}
      {!isVideoReady && !error && (
        <div className="ar-loading-overlay">
          <div className="ar-loading-content">
            <div className="ar-loading-spinner"></div>
            <p>Iniciando cámara...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ARViewer: React.FC<ARViewerProps> = ({ asset, onTrackEvent }) => {
  const [capabilities, setCapabilities] = useState<ARCapabilities>({
    hasCamera: false,
    isSecureContext: false,
    canUseAR: false
  });
  
  const [cameraPermission, setCameraPermission] = useState<CameraPermission>({
    granted: false,
    denied: false,
    prompt: true
  });
  
  const [isChecking, setIsChecking] = useState(true);
  const [showAR, setShowAR] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const assetUrl = React.useMemo(() => {
    if (!asset.url) return '';
    if (asset.url.startsWith('http')) return asset.url;
    
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_URL || ''
      : 'http://localhost:5000';
    
    return `${baseUrl}${asset.url.startsWith('/') ? asset.url : `/${asset.url}`}`;
  }, [asset.url]);

  useEffect(() => {
    const checkCapabilities = async () => {
      try {
        const isSecure = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
        const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        
        const caps = {
          hasCamera,
          isSecureContext: isSecure,
          canUseAR: hasCamera && isSecure
        };
        
        setCapabilities(caps);
        
        // Check camera permission if available
        if (hasCamera && 'permissions' in navigator) {
          try {
            const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
            setCameraPermission({
              granted: permission.state === 'granted',
              denied: permission.state === 'denied',
              prompt: permission.state === 'prompt'
            });
          } catch (e) {
            setCameraPermission({ granted: false, denied: false, prompt: true });
          }
        }
      } catch (error) {
        console.warn('Error checking AR capabilities:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkCapabilities();
  }, []);

  const handleStartAR = useCallback(() => {
    if (!userInteracted) {
      setUserInteracted(true);
    }

    onTrackEvent('ar_start_attempt', asset.id);

    if (asset.kind === 'model3d') {
      // For 3D models, redirect to model viewer or show message
      onTrackEvent('ar_model3d_start', asset.id);
      alert('Los modelos 3D requieren un visor especializado. Esta función estará disponible próximamente.');
      return;
    }

    if (asset.kind === 'image' || asset.kind === 'video') {
      setShowAR(true);
    }
  }, [asset, onTrackEvent, userInteracted]);

  const handleStopAR = useCallback(() => {
    setShowAR(false);
    onTrackEvent('ar_stop', asset.id);
  }, [asset.id, onTrackEvent]);

  const renderPreview = () => {
    switch (asset.kind) {
      case 'image':
        return (
          <img
            src={assetUrl}
            alt={asset.name}
            className="w-full h-full object-cover rounded-lg"
            onLoad={() => console.log('Image loaded successfully')}
            onError={(e) => console.error('Image failed to load:', e)}
          />
        );
      
      case 'video':
        return (
          <video
            src={assetUrl}
            controls
            muted
            loop
            className="w-full h-full object-cover rounded-lg"
            onLoadedData={() => console.log('Video loaded successfully')}
            onError={(e) => console.error('Video failed to load:', e)}
          />
        );
      
      case 'model3d':
        return (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-4xl mb-4">🎲</div>
              <p className="text-sm opacity-75">Modelo 3D</p>
              <p className="text-xs opacity-50 mt-1">{asset.name}</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center">
            <p className="text-white text-sm">Contenido no soportado</p>
          </div>
        );
    }
  };

  const renderARButton = () => {
    if (isChecking) {
      return (
        <button disabled className="ar-btn ar-btn-disabled">
          <span className="ar-btn-icon">⏳</span>
          Verificando...
        </button>
      );
    }

    if (!capabilities.canUseAR) {
      return (
        <div className="ar-error">
          <p className="text-sm text-red-300 mb-2">
            {!capabilities.isSecureContext 
              ? '🔒 Se requiere HTTPS para AR' 
              : !capabilities.hasCamera 
              ? '📹 Cámara no disponible'
              : '❌ AR no soportado'}
          </p>
          <button disabled className="ar-btn ar-btn-disabled">
            AR No Disponible
          </button>
        </div>
      );
    }

    if (cameraPermission.denied) {
      return (
        <div className="ar-error">
          <p className="text-sm text-red-300 mb-2">🚫 Permiso de cámara denegado</p>
          <button 
            onClick={() => window.location.reload()}
            className="ar-btn ar-btn-secondary"
          >
            🔄 Recargar página
          </button>
        </div>
      );
    }

    const getButtonConfig = () => {
      switch (asset.kind) {
        case 'model3d':
          return {
            icon: '🎲',
            text: 'Ver en AR 3D',
            className: 'ar-btn-primary'
          };
        case 'image':
          return {
            icon: '📷',
            text: 'Ver en AR',
            className: 'ar-btn-purple'
          };
        case 'video':
          return {
            icon: '🎥',
            text: 'Ver Video AR',
            className: 'ar-btn-green'
          };
        default:
          return null;
      }
    };

    const buttonConfig = getButtonConfig();
    if (!buttonConfig) return null;

    return (
      <button
        onClick={handleStartAR}
        className={`ar-btn ${buttonConfig.className}`}
        aria-label={`Iniciar experiencia AR para ${asset.name}`}
      >
        <span className="ar-btn-icon">{buttonConfig.icon}</span>
        {buttonConfig.text}
      </button>
    );
  };

  if (showAR && (asset.kind === 'image' || asset.kind === 'video')) {
    return (
      <SimpleARViewer
        assetUrl={assetUrl}
        assetName={asset.name}
        onClose={handleStopAR}
        onTrackEvent={onTrackEvent}
      />
    );
  }

  return (
    <div className="ar-container">
      <div className="ar-preview">
        {renderPreview()}
      </div>
      
      <div className="ar-controls">
        {renderARButton()}
      </div>
    </div>
  );
};

export default ARViewer;