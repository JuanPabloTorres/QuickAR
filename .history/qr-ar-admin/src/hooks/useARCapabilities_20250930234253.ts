"use client";

import { useState, useEffect, useRef } from 'react';

interface ARCapabilities {
  hasCamera: boolean;
  hasWebXR: boolean;
  isSecureContext: boolean;
  canUseAR: boolean;
}

interface CameraPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export const useARCapabilities = () => {
  const [capabilities, setCapabilities] = useState<ARCapabilities>({
    hasCamera: false,
    hasWebXR: false,
    isSecureContext: false,
    canUseAR: false
  });
  
  const [cameraPermission, setCameraPermission] = useState<CameraPermission>({
    granted: false,
    denied: false,
    prompt: true
  });
  
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkCapabilities = async () => {
      try {
        const isSecure = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
        const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        const hasWebXR = 'xr' in navigator;
        
        const caps = {
          hasCamera,
          hasWebXR,
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
            // Permissions API not supported, assume prompt
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

  return {
    capabilities,
    cameraPermission,
    isChecking
  };
};

export const useAREngine = () => {
  const mountedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCameraAccess = async (): Promise<MediaStream | null> => {
    if (mountedRef.current) {
      console.warn('AR Engine already mounted');
      return streamRef.current;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      mountedRef.current = true;
      setIsReady(true);
      
      return stream;
    } catch (err: any) {
      let errorMessage = 'Error al acceder a la cámara';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso y recarga la página.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No se encontró cámara en el dispositivo.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Navegador no compatible con cámara.';
      }
      
      setError(errorMessage);
      return null;
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    mountedRef.current = false;
    setIsReady(false);
    setError(null);
  };

  useEffect(() => {
    return cleanup; // Cleanup on unmount
  }, []);

  return {
    isReady,
    error,
    requestCameraAccess,
    cleanup,
    stream: streamRef.current
  };
};