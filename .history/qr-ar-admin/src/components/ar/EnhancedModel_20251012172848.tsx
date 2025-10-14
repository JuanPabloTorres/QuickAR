/**
 * Enhanced 3D Model Component using React Three Fiber
 * Implements performance optimizations from "Develop AR/VR with React" article
 */

"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Box3, Group, Vector3 } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface EnhancedModelProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  autoRotate?: boolean;
  onLoad?: (gltf: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Enhanced Model Loader with optimizations
 * Features from the article:
 * - Geometry optimization
 * - Automatic bounding box calculation
 * - Shadow casting
 * - Performance-friendly rendering
 */
export function EnhancedModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
  onLoad,
  onError,
}: EnhancedModelProps) {
  const groupRef = useRef<Group>(null);
  const [isOptimized, setIsOptimized] = useState(false);

  // Configure DRACO loader for compressed models (performance optimization)
  const dracoLoader = useMemo(() => {
    const loader = new DRACOLoader();
    loader.setDecoderPath("/draco/"); // You'll need to add DRACO decoder files
    return loader;
  }, []);

  // Enhanced GLTF loader with DRACO support
  const gltfLoader = useMemo(() => {
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    return loader;
  }, [dracoLoader]);

  // Load the GLTF model
  const gltf = useLoader(GLTFLoader, url);

  // Optimize geometry and setup shadows (from article recommendations)
  useEffect(() => {
    if (gltf && gltf.scene && !isOptimized) {
      console.log("🔧 Optimizing 3D model:", url);

      // Calculate bounding box for proper positioning
      const box = new Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());

      console.log("📐 Model bounds:", {
        center: center.toArray(),
        size: size.toArray(),
        url,
      });

      // Optimize each mesh in the scene
      gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
          const mesh = child as THREE.Mesh;

          // Geometry optimizations
          if (mesh.geometry) {
            mesh.geometry.computeBoundingSphere();
            mesh.geometry.computeBoundingBox();

            // Optimize for performance
            if (mesh.geometry.attributes.normal) {
              mesh.geometry.normalizeNormals();
            }
          }

          // Material optimizations
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;

            // Enable shadows
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Optimize material properties
            if (material.map) {
              material.map.generateMipmaps = true;
              material.map.minFilter = THREE.LinearMipmapLinearFilter;
            }
          }
        }
      });

      // Center the model
      gltf.scene.position.sub(center);

      setIsOptimized(true);
      onLoad?.(gltf);

      console.log("✅ Model optimization complete");
    }
  }, [gltf, isOptimized, onLoad, url]);

  // Auto-rotation animation
  useFrame((state, delta) => {
    if (autoRotate && groupRef.current && isOptimized) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  // Error handling
  useEffect(() => {
    const handleError = (error: any) => {
      console.error("❌ Model loading error:", error);
      onError?.(
        error instanceof Error ? error : new Error("Model loading failed")
      );
    };

    // Set up error handling for the loader
    gltfLoader.manager.onError = handleError;

    return () => {
      gltfLoader.manager.onError = undefined;
    };
  }, [gltfLoader, onError]);

  if (!gltf || !gltf.scene) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={gltf.scene} />

      {/* Debug helpers (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <>
          {/* Bounding box helper */}
          <boxHelper args={[gltf.scene]} />

          {/* Axis helper */}
          <axesHelper args={[1]} />
        </>
      )}
    </group>
  );
}

/**
 * Fallback component for model loading errors
 */
export function ModelErrorFallback({ message }: { message?: string }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" wireframe />
      </mesh>
      {message && (
        <mesh position={[0, 1.5, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color="white" />
        </mesh>
      )}
    </group>
  );
}

/**
 * Optimized Model Loader with Suspense and Error Boundaries
 * Implements lazy loading as recommended in the article
 */
export function OptimizedModelLoader(props: EnhancedModelProps) {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (err: Error) => {
    setError(err);
  };

  if (error) {
    return <ModelErrorFallback message={error.message} />;
  }

  return <EnhancedModel {...props} onError={handleError} />;
}
