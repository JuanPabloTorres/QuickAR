// Custom hook for AR functionality
import { useState, useEffect, useCallback } from "react";

export interface ARCapabilities {
  webXR: boolean;
  sceneViewer: boolean;
  quickLook: boolean;
  fullAR: boolean;
}

export function useARSupport() {
  const [capabilities, setCapabilities] = useState<ARCapabilities>({
    webXR: false,
    sceneViewer: false,
    quickLook: false,
    fullAR: false,
  });
  
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkARSupport = async () => {
      const caps: ARCapabilities = {
        webXR: false,
        sceneViewer: false,
        quickLook: false,
        fullAR: false,
      };

      // Check WebXR support
      try {
        if (navigator.xr) {
          caps.webXR = await navigator.xr.isSessionSupported('immersive-ar');
        }
      } catch (error) {
        console.warn('WebXR check failed:', error);
      }

      // Check Scene Viewer (Android Chrome)
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isChrome = /Chrome/i.test(navigator.userAgent);
      caps.sceneViewer = isAndroid && isChrome;

      // Check Quick Look (iOS Safari)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
      caps.quickLook = isIOS && isSafari;

      // Full AR support means at least one method is available
      caps.fullAR = caps.webXR || caps.sceneViewer || caps.quickLook;

      setCapabilities(caps);
      setIsSupported(caps.fullAR);
    };

    checkARSupport();
  }, []);

  const activateAR = useCallback((modelElement: HTMLElement | null) => {
    if (!modelElement) return false;

    const viewer = modelElement.querySelector('model-viewer') as any;
    if (!viewer) return false;

    try {
      if (viewer.activateAR) {
        viewer.activateAR();
        return true;
      }
    } catch (error) {
      console.error('Failed to activate AR:', error);
    }

    return false;
  }, []);

  return {
    capabilities,
    isSupported,
    activateAR,
  };
}

export default useARSupport;