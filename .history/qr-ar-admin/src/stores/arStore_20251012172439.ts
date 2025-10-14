/**
 * AR/VR State Management with Zustand
 * Based on recommendations from "Develop AR/VR with React" article
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Experience, Asset } from '@/types';

// Performance monitoring data structure
export interface PerformanceData {
  fps: number;
  cpu: number;
  gpu: number;
  memory: number;
  drawCalls: number;
  triangles: number;
  timestamp: number;
}

// AR/VR session state
export interface ARVRSession {
  isActive: boolean;
  mode: 'none' | 'ar' | 'vr' | 'webxr';
  supported: {
    immersiveAR: boolean;
    immersiveVR: boolean;
    handTracking: boolean;
    spatialTracking: boolean;
  };
  error?: string;
}

// Asset loading state
export interface AssetLoadingState {
  [assetId: string]: {
    isLoading: boolean;
    isLoaded: boolean;
    error?: string;
    progress?: number;
  };
}

// Main AR store interface
interface ARStore {
  // Current experience
  currentExperience: Experience | null;
  currentAssetIndex: number;
  
  // AR/VR session management
  session: ARVRSession;
  
  // Performance monitoring
  performance: PerformanceData | null;
  performanceHistory: PerformanceData[];
  
  // Asset management
  assetStates: AssetLoadingState;
  
  // UI state
  isFullscreen: boolean;
  showDebugInfo: boolean;
  showPerformanceMonitor: boolean;
  
  // Actions
  setExperience: (experience: Experience) => void;
  setAssetIndex: (index: number) => void;
  
  // Session actions
  initializeSession: () => Promise<void>;
  enterAR: () => Promise<void>;
  enterVR: () => Promise<void>;
  exitSession: () => void;
  
  // Performance actions
  updatePerformance: (data: PerformanceData) => void;
  clearPerformanceHistory: () => void;
  
  // Asset actions
  setAssetLoading: (assetId: string, isLoading: boolean) => void;
  setAssetLoaded: (assetId: string, success: boolean, error?: string) => void;
  setAssetProgress: (assetId: string, progress: number) => void;
  
  // UI actions
  toggleFullscreen: () => void;
  toggleDebugInfo: () => void;
  togglePerformanceMonitor: () => void;
  
  // Reset store
  reset: () => void;
}

// Initial state
const initialState = {
  currentExperience: null,
  currentAssetIndex: 0,
  session: {
    isActive: false,
    mode: 'none' as const,
    supported: {
      immersiveAR: false,
      immersiveVR: false,
      handTracking: false,
      spatialTracking: false,
    },
  },
  performance: null,
  performanceHistory: [],
  assetStates: {},
  isFullscreen: false,
  showDebugInfo: process.env.NODE_ENV === 'development',
  showPerformanceMonitor: false,
};

// Create the store with Zustand
export const useARStore = create<ARStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Experience management
        setExperience: (experience) => {
          console.log('🎯 Setting experience:', experience.id);
          set({ 
            currentExperience: experience,
            currentAssetIndex: 0,
            assetStates: {} // Reset asset states for new experience
          });
        },
        
        setAssetIndex: (index) => {
          const experience = get().currentExperience;
          if (experience && index >= 0 && index < experience.assets.length) {
            console.log('📍 Asset changed:', index);
            set({ currentAssetIndex: index });
          }
        },
        
        // Session management
        initializeSession: async () => {
          console.log('🔍 Checking WebXR support...');
          
          const supported = {
            immersiveAR: false,
            immersiveVR: false,
            handTracking: false,
            spatialTracking: false,
          };
          
          if ('xr' in navigator && navigator.xr) {
            try {
              // Check AR support
              supported.immersiveAR = await navigator.xr.isSessionSupported('immersive-ar');
              console.log('✅ Immersive AR supported:', supported.immersiveAR);
              
              // Check VR support  
              supported.immersiveVR = await navigator.xr.isSessionSupported('immersive-vr');
              console.log('✅ Immersive VR supported:', supported.immersiveVR);
              
              // TODO: Check hand tracking and spatial tracking when available
              
            } catch (error) {
              console.warn('⚠️ WebXR feature detection failed:', error);
            }
          } else {
            console.log('ℹ️ WebXR not available in this browser');
          }
          
          set({
            session: {
              ...get().session,
              supported
            }
          });
        },
        
        enterAR: async () => {
          console.log('🥽 Attempting to enter AR...');
          
          const { session } = get();
          
          if (!session.supported.immersiveAR) {
            const error = 'AR not supported on this device/browser';
            console.error('❌', error);
            set({
              session: { ...session, error }
            });
            return;
          }
          
          try {
            // TODO: Implement actual WebXR AR session
            console.log('📱 AR session would start here');
            
            set({
              session: {
                ...session,
                isActive: true,
                mode: 'ar',
                error: undefined
              }
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'AR session failed';
            console.error('❌ AR session error:', errorMessage);
            
            set({
              session: {
                ...session,
                error: errorMessage
              }
            });
          }
        },
        
        enterVR: async () => {
          console.log('🥽 Attempting to enter VR...');
          
          const { session } = get();
          
          if (!session.supported.immersiveVR) {
            const error = 'VR not supported on this device/browser';
            console.error('❌', error);
            set({
              session: { ...session, error }
            });
            return;
          }
          
          try {
            // TODO: Implement actual WebXR VR session
            console.log('🎮 VR session would start here');
            
            set({
              session: {
                ...session,
                isActive: true,
                mode: 'vr',
                error: undefined
              }
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'VR session failed';
            console.error('❌ VR session error:', errorMessage);
            
            set({
              session: {
                ...session,
                error: errorMessage
              }
            });
          }
        },
        
        exitSession: () => {
          console.log('🚪 Exiting AR/VR session');
          
          set({
            session: {
              ...get().session,
              isActive: false,
              mode: 'none',
              error: undefined
            }
          });
        },
        
        // Performance monitoring
        updatePerformance: (data) => {
          const history = get().performanceHistory;
          const newHistory = [...history, data].slice(-100); // Keep last 100 entries
          
          set({
            performance: data,
            performanceHistory: newHistory
          });
          
          // Log performance warnings
          if (data.fps < 30) {
            console.warn('⚠️ Low FPS detected:', data.fps);
          }
        },
        
        clearPerformanceHistory: () => {
          set({ performanceHistory: [] });
        },
        
        // Asset management
        setAssetLoading: (assetId, isLoading) => {
          set({
            assetStates: {
              ...get().assetStates,
              [assetId]: {
                ...get().assetStates[assetId],
                isLoading,
                error: undefined
              }
            }
          });
        },
        
        setAssetLoaded: (assetId, success, error) => {
          set({
            assetStates: {
              ...get().assetStates,
              [assetId]: {
                ...get().assetStates[assetId],
                isLoading: false,
                isLoaded: success,
                error
              }
            }
          });
        },
        
        setAssetProgress: (assetId, progress) => {
          set({
            assetStates: {
              ...get().assetStates,
              [assetId]: {
                ...get().assetStates[assetId],
                progress
              }
            }
          });
        },
        
        // UI actions
        toggleFullscreen: () => {
          set({ isFullscreen: !get().isFullscreen });
        },
        
        toggleDebugInfo: () => {
          set({ showDebugInfo: !get().showDebugInfo });
        },
        
        togglePerformanceMonitor: () => {
          set({ showPerformanceMonitor: !get().showPerformanceMonitor });
        },
        
        // Reset
        reset: () => {
          console.log('🔄 Resetting AR store');
          set(initialState);
        },
      }),
      {
        name: 'quickar-store', // localStorage key
        partialize: (state) => ({
          // Only persist these fields
          showDebugInfo: state.showDebugInfo,
          showPerformanceMonitor: state.showPerformanceMonitor,
        }),
      }
    ),
    {
      name: 'QuickAR Store', // DevTools name
    }
  )
);

// Selector hooks for better performance
export const useCurrentExperience = () => useARStore((state) => state.currentExperience);
export const useCurrentAsset = () => useARStore((state) => {
  const experience = state.currentExperience;
  const index = state.currentAssetIndex;
  return experience?.assets[index] || null;
});
export const useARSession = () => useARStore((state) => state.session);
export const usePerformance = () => useARStore((state) => state.performance);
export const useAssetState = (assetId: string) => useARStore((state) => state.assetStates[assetId]);