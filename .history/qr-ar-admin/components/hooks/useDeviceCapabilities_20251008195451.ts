/**
 * Hook for detecting device capabilities for AR experiences
 */
import { useEffect, useState } from "react";

interface DeviceCapabilities {
  isTouch: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  supportsWebXR: boolean;
  supportsOrientation: boolean;
  supportsVibration: boolean;
  screenSize: 'small' | 'medium' | 'large';
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isTouch: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    supportsWebXR: false,
    supportsOrientation: false,
    supportsVibration: false,
    screenSize: 'large',
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const detectCapabilities = () => {
      // Touch detection
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Screen size detection
      const width = window.innerWidth;
      const height = window.innerHeight;
      const screenSize: 'small' | 'medium' | 'large' = 
        width < 768 ? 'small' : width < 1024 ? 'medium' : 'large';
      
      // Device type detection
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent) && width < 768;
      const isTablet = /ipad|tablet|(android(?!.*mobile))|kindle|silk/i.test(userAgent) || (isTouch && width >= 768 && width <= 1024);
      const isDesktop = !isMobile && !isTablet;

      // WebXR support detection
      const supportsWebXR = 'xr' in navigator && typeof (navigator as any).xr?.isSessionSupported === 'function';
      
      // Device orientation support
      const supportsOrientation = 'DeviceOrientationEvent' in window;
      
      // Vibration support
      const supportsVibration = 'vibrate' in navigator;

      setCapabilities({
        isTouch,
        isMobile,
        isTablet,
        isDesktop,
        supportsWebXR,
        supportsOrientation,
        supportsVibration,
        screenSize,
      });
    };

    // Initial detection
    detectCapabilities();

    // Re-detect on resize
    const handleResize = () => detectCapabilities();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return capabilities;
}

/**
 * Hook for responsive cube sizes based on device
 */
export function useResponsiveCubeSize(baseSize: number = 300): number {
  const { screenSize, isMobile } = useDeviceCapabilities();
  
  if (isMobile) {
    return Math.min(baseSize * 0.8, window.innerWidth - 40); // Account for padding
  }
  
  switch (screenSize) {
    case 'small':
      return Math.max(baseSize * 0.7, 250);
    case 'medium':
      return baseSize * 0.9;
    case 'large':
    default:
      return baseSize;
  }
}