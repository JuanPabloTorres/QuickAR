"use client";

import { useEffect, useState } from "react";

export interface ARCapabilities {
  // Device detection
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;

  // AR support
  supportsWebXR: boolean;
  supportsSceneViewer: boolean; // Android Scene Viewer
  supportsQuickLook: boolean; // iOS Quick Look
  supportsModelViewer: boolean;
  
  // General capabilities
  hasCameraAccess: boolean;
  isSecureContext: boolean;
  
  // Overall AR availability
  canViewAR: boolean;
  
  // Detection status
  isChecking: boolean;
  error?: string;
}

export function useARCapabilities(): ARCapabilities {
  const [capabilities, setCapabilities] = useState<ARCapabilities>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isDesktop: true,
    supportsWebXR: false,
    supportsSceneViewer: false,
    supportsQuickLook: false,
    supportsModelViewer: false,
    hasCameraAccess: false,
    isSecureContext: false,
    canViewAR: false,
    isChecking: true,
  });

  useEffect(() => {
    const detectCapabilities = async () => {
      try {
        // Device detection
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        const isDesktop = !isMobile;

        // Secure context check (required for WebXR)
        const isSecureContext = window.isSecureContext || 
          location.protocol === "https:" || 
          location.hostname === "localhost" ||
          location.hostname === "127.0.0.1";

        // WebXR support (native AR in Chrome for Android)
        let supportsWebXR = false;
        if (isSecureContext && "xr" in navigator) {
          try {
            supportsWebXR = await (navigator as any).xr?.isSessionSupported("immersive-ar") || false;
          } catch (error) {
            console.log("WebXR not supported:", error);
          }
        }

        // Scene Viewer support (Android fallback for GLB files)
        const supportsSceneViewer = isAndroid;

        // Quick Look support (iOS AR)
        const supportsQuickLook = isIOS;

        // model-viewer library support
        const supportsModelViewer = true; // Always supported as it's in package.json

        // Camera access check
        let hasCameraAccess = false;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            // Check if we have permission (don't actually request it yet)
            if (navigator.permissions) {
              const result = await navigator.permissions.query({ name: "camera" as PermissionName });
              hasCameraAccess = result.state !== "denied";
            } else {
              hasCameraAccess = true; // Assume available if can't check
            }
          } catch (error) {
            hasCameraAccess = isMobile; // Assume mobile has camera
          }
        }

        // Determine if AR viewing is possible
        const canViewAR = supportsWebXR || supportsSceneViewer || supportsQuickLook;

        console.log("🔍 AR Capabilities detected:", {
          isMobile,
          isIOS,
          isAndroid,
          isDesktop,
          supportsWebXR,
          supportsSceneViewer,
          supportsQuickLook,
          supportsModelViewer,
          hasCameraAccess,
          isSecureContext,
          canViewAR,
        });

        setCapabilities({
          isMobile,
          isIOS,
          isAndroid,
          isDesktop,
          supportsWebXR,
          supportsSceneViewer,
          supportsQuickLook,
          supportsModelViewer,
          hasCameraAccess,
          isSecureContext,
          canViewAR,
          isChecking: false,
        });
      } catch (error) {
        console.error("Error detecting AR capabilities:", error);
        setCapabilities((prev) => ({
          ...prev,
          isChecking: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    };

    detectCapabilities();
  }, []);

  return capabilities;
}

/**
 * Get recommended AR mode based on capabilities
 */
export function getRecommendedARMode(capabilities: ARCapabilities): "webxr" | "scene-viewer" | "quick-look" | "3d-viewer" | "none" {
  if (!capabilities.canViewAR && capabilities.isDesktop) {
    return "3d-viewer"; // Desktop 3D viewer
  }
  
  if (capabilities.supportsWebXR) {
    return "webxr"; // Native AR in Chrome
  }
  
  if (capabilities.supportsQuickLook) {
    return "quick-look"; // iOS AR
  }
  
  if (capabilities.supportsSceneViewer) {
    return "scene-viewer"; // Android AR
  }
  
  if (capabilities.isDesktop) {
    return "3d-viewer"; // Fallback to 3D viewer
  }
  
  return "none";
}
