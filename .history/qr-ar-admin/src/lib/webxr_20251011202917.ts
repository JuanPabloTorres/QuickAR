"use client";

import { useEffect, useState } from "react";

export interface WebXRCapabilities {
  isSupported: boolean;
  hasImmersiveAR: boolean;
  hasImmersiveVR: boolean;
  canShowCameraFeed: boolean;
  isMobile: boolean;
}

export function useWebXR(): WebXRCapabilities {
  const [capabilities, setCapabilities] = useState<WebXRCapabilities>({
    isSupported: false,
    hasImmersiveAR: false,
    hasImmersiveVR: false,
    canShowCameraFeed: false,
    isMobile: false,
  });

  useEffect(() => {
    const checkCapabilities = async () => {
      // Check if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

      // Check WebXR support
      const hasWebXR = 'xr' in navigator;
      
      let hasImmersiveAR = false;
      let hasImmersiveVR = false;

      if (hasWebXR) {
        try {
          // Check for immersive AR support
          const arSupported = await navigator.xr?.isSessionSupported('immersive-ar');
          hasImmersiveAR = arSupported || false;

          // Check for immersive VR support  
          const vrSupported = await navigator.xr?.isSessionSupported('immersive-vr');
          hasImmersiveVR = vrSupported || false;
        } catch (error) {
          console.warn('WebXR capability check failed:', error);
        }
      }

      // Check if we can access camera (for AR fallback)
      let canShowCameraFeed = false;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // Just check if we have permission, don't actually start camera
          const permissions = await navigator.permissions?.query({ name: 'camera' as PermissionName });
          canShowCameraFeed = permissions ? permissions.state !== 'denied' : true;
        } catch (error) {
          // Fallback - assume camera is available on mobile
          canShowCameraFeed = isMobile;
        }
      }

      setCapabilities({
        isSupported: hasWebXR,
        hasImmersiveAR,
        hasImmersiveVR,
        canShowCameraFeed,
        isMobile,
      });
    };

    checkCapabilities();
  }, []);

  return capabilities;
}

export async function requestARSession(): Promise<XRSession | null> {
  if (!('xr' in navigator)) {
    throw new Error('WebXR not supported');
  }

  try {
    const session = await navigator.xr!.requestSession('immersive-ar', {
      requiredFeatures: ['local'],
      optionalFeatures: ['dom-overlay', 'hit-test', 'anchors'],
    });
    return session;
  } catch (error) {
    console.error('Failed to start AR session:', error);
    throw error;
  }
}

export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    // Stop the stream immediately, we just wanted permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Camera permission denied:', error);
    return false;
  }
}