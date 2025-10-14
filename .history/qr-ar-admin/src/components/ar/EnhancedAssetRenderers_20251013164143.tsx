"use client";

/**
 * Enhanced Asset Renderers for AR
 * Provides realistic rendering for different asset types in 3D space
 *
 * IMPORTANT: This file should only be imported dynamically with ssr: false
 * to avoid React Three Fiber SSR issues.
 */

import { Asset } from "@/types";
import { Suspense, useEffect, useRef, useState } from "react";

// Lazy imports to ensure client-side only execution
import type {
  Html as HtmlType,
  useTexture as useTextureType,
  useVideoTexture as useVideoTextureType,
} from "@react-three/drei";
import type {
  useFrame as useFrameType,
  useLoader as useLoaderType,
} from "@react-three/fiber";
import type * as THREE from "three";
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Dynamic imports - these will be loaded at runtime
let Html: typeof HtmlType;
let useTexture: typeof useTextureType;
let useVideoTexture: typeof useVideoTextureType;
let useFrame: typeof useFrameType;
let useLoader: typeof useLoaderType;
let THREE: typeof import("three");
let GLTFLoaderClass: typeof GLTFLoader;

// Initialize imports on client side only
if (typeof window !== "undefined") {
  import("@react-three/drei").then((mod) => {
    Html = mod.Html;
    useTexture = mod.useTexture;
    useVideoTexture = mod.useVideoTexture;
  });
  import("@react-three/fiber").then((mod) => {
    useFrame = mod.useFrame;
    useLoader = mod.useLoader;
  });
  import("three").then((mod) => {
    THREE = mod as any;
  });
  import("three/examples/jsm/loaders/GLTFLoader.js").then((mod) => {
    GLTFLoaderClass = mod.GLTFLoader;
  });
}

// Base props for all asset renderers
interface BaseAssetRendererProps {
  asset: Asset;
  position?: [number, number, number];
  isSelected?: boolean;
  onClick?: () => void;
  baseApiUrl: string;
}

// Text/Message Asset Renderer
export function MessageAssetRenderer({
  asset,
  position = [0, 0, 0],
  isSelected = false,
  onClick,
}: BaseAssetRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.2 : hovered ? 1.1 : 1}
      >
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={isSelected ? 0.6 : hovered ? 0.4 : 0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Inner glow */}
      <mesh scale={0.8}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
      </mesh>

      {/* Text content */}
      {(isSelected || hovered) && asset.assetContent && (
        <Html position={[0, 1, 0]} center distanceFactor={8}>
          <div className="bg-blue-600/90 backdrop-blur text-white px-4 py-2 rounded-lg max-w-md">
            <p className="text-sm font-bold mb-1">{asset.name}</p>
            <p className="text-xs">{asset.assetContent.substring(0, 150)}...</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// Image Asset Renderer
export function ImageAssetRenderer({
  asset,
  position = [0, 0, 0],
  isSelected = false,
  onClick,
  baseApiUrl,
}: BaseAssetRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Resolve image URL
    if (asset.assetUrl) {
      if (
        asset.assetUrl.startsWith("http") ||
        asset.assetUrl.startsWith("blob:")
      ) {
        setImageUrl(asset.assetUrl);
      } else if (asset.assetUrl.startsWith("/")) {
        setImageUrl(`${baseApiUrl}${asset.assetUrl}`);
      } else {
        setImageUrl(`${baseApiUrl}/${asset.assetUrl}`);
      }
    }
  }, [asset.assetUrl, baseApiUrl]);

  const texture = imageUrl ? useTexture(imageUrl) : null;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  if (!texture) {
    return (
      <group position={position}>
        <mesh
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={isSelected ? 1.2 : hovered ? 1.1 : 1}
        >
          <planeGeometry args={[1.5, 1.5]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      {/* Frame */}
      <mesh position={[0, 0, -0.05]} scale={1.1}>
        <planeGeometry args={[1.65, 1.65]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Image */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.1 : hovered ? 1.05 : 1}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Glow effect */}
      {(isSelected || hovered) && (
        <pointLight
          position={[0, 0, 0.5]}
          intensity={1}
          color="#f59e0b"
          distance={3}
        />
      )}
    </group>
  );
}

// Video Asset Renderer
export function VideoAssetRenderer({
  asset,
  position = [0, 0, 0],
  isSelected = false,
  onClick,
  baseApiUrl,
}: BaseAssetRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Resolve video URL
    if (asset.assetUrl) {
      if (
        asset.assetUrl.startsWith("http") ||
        asset.assetUrl.startsWith("blob:")
      ) {
        setVideoUrl(asset.assetUrl);
      } else if (asset.assetUrl.startsWith("/")) {
        setVideoUrl(`${baseApiUrl}${asset.assetUrl}`);
      } else {
        setVideoUrl(`${baseApiUrl}/${asset.assetUrl}`);
      }
    }
  }, [asset.assetUrl, baseApiUrl]);

  const texture = videoUrl ? useVideoTexture(videoUrl) : null;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  if (!texture) {
    return (
      <group position={position}>
        <mesh
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={isSelected ? 1.2 : hovered ? 1.1 : 1}
        >
          <planeGeometry args={[2, 1.125]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      {/* TV Frame */}
      <mesh position={[0, 0, -0.05]} scale={[1.1, 1.1, 1]}>
        <boxGeometry args={[2, 1.125, 0.1]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Video Screen */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.05 : hovered ? 1.02 : 1}
      >
        <planeGeometry args={[1.8, 1.0125]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Screen glow */}
      {(isSelected || hovered) && (
        <pointLight
          position={[0, 0, 0.5]}
          intensity={1.5}
          color="#ef4444"
          distance={4}
        />
      )}
    </group>
  );
}

// 3D Model Asset Renderer
export function Model3DAssetRenderer({
  asset,
  position = [0, 0, 0],
  isSelected = false,
  onClick,
  baseApiUrl,
}: BaseAssetRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  useEffect(() => {
    // Resolve model URL
    if (asset.assetUrl) {
      if (
        asset.assetUrl.startsWith("http") ||
        asset.assetUrl.startsWith("blob:")
      ) {
        setModelUrl(asset.assetUrl);
      } else if (asset.assetUrl.startsWith("/")) {
        setModelUrl(`${baseApiUrl}${asset.assetUrl}`);
      } else {
        setModelUrl(`${baseApiUrl}/${asset.assetUrl}`);
      }
    }
  }, [asset.assetUrl, baseApiUrl]);

  const gltf = modelUrl ? useLoader(GLTFLoaderClass, modelUrl) : null;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  if (!gltf) {
    // Fallback to a cube
    return (
      <group position={position} ref={groupRef}>
        <mesh
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={isSelected ? 1.3 : hovered ? 1.2 : 1}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0.1}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group
      position={position}
      ref={groupRef}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={isSelected ? 1.3 : hovered ? 1.2 : 1}
    >
      <primitive object={gltf.scene.clone()} />

      {/* Highlight for selection */}
      {(isSelected || hovered) && (
        <>
          <pointLight
            position={[0, 1, 0]}
            intensity={1}
            color="#10b981"
            distance={3}
          />
          <pointLight
            position={[1, 0, 1]}
            intensity={0.5}
            color="#10b981"
            distance={2}
          />
        </>
      )}
    </group>
  );
}

// Web Content Asset Renderer
export function WebContentAssetRenderer({
  asset,
  position = [0, 0, 0],
  isSelected = false,
  onClick,
}: BaseAssetRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.2 : hovered ? 1.1 : 1}
      >
        <cylinderGeometry args={[0.6, 0.6, 1.2, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={isSelected ? 0.6 : hovered ? 0.4 : 0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Ring decoration */}
      <mesh position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.65, 32]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#a78bfa"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Web icon */}
      {(isSelected || hovered) && (
        <Html position={[0, 1.5, 0]} center distanceFactor={8}>
          <div className="bg-purple-600/90 backdrop-blur text-white px-4 py-2 rounded-lg">
            <p className="text-sm font-bold flex items-center gap-2">
              <span>🌐</span>
              <span>{asset.name}</span>
            </p>
            {asset.assetUrl && (
              <p className="text-xs mt-1 opacity-80">{asset.assetUrl}</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Universal Asset Renderer - Routes to appropriate renderer
interface UniversalAssetRendererProps extends BaseAssetRendererProps {}

export function UniversalAssetRenderer(props: UniversalAssetRendererProps) {
  const { asset } = props;

  return (
    <Suspense
      fallback={
        <mesh position={props.position}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      }
    >
      {asset.assetType === "message" && <MessageAssetRenderer {...props} />}
      {asset.assetType === "image" && <ImageAssetRenderer {...props} />}
      {asset.assetType === "video" && <VideoAssetRenderer {...props} />}
      {asset.assetType === "model3d" && <Model3DAssetRenderer {...props} />}
      {asset.assetType === "webcontent" && (
        <WebContentAssetRenderer {...props} />
      )}
    </Suspense>
  );
}
