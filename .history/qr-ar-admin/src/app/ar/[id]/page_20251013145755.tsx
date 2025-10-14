"use client";/**/**



import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences"; * 🌟 QUICK AR - EXPERIENCIA DE REALIDAD AUMENTADA * ✨ QUICK AR - EXPERIENCIA AR PROFESIONAL ✨

import { normalizeExperience } from "@/lib/helpers/experienceHelpers";

import { Asset, Experience } from "@/types"; *  * Versión limpia y optimizada sin duplicaciones

import { useParams, useRouter } from "next/navigation";

import { useCallback, useEffect, useRef, useState } from "react"; * Sistema completo de AR que permite: */



interface ARState { * - Escaneo QR automático para activar experiencias

  isActive: boolean;

  isLoading: boolean; * - Superposición de contenido 3D, imágenes, videos y texto en el mundo real"use client";

  hasCamera: boolean;

  hasWebXR: boolean; * - Tracking en tiempo real con la cámara del dispositivo  

  error: string | null;

  mode: 'webxr' | 'fallback' | 'inactive'; * - Detección de superficies para anclaje natural de objetosimport { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";

}

 * - Interfaz intuitiva para interacción naturalimport { normalizeExperience } from "@/lib/helpers/experienceHelpers";

interface ARObject {

  id: string; */import { Asset, Experience } from "@/types";

  asset: Asset;

  position: { x: number; y: number; z: number };import { useParams, useRouter } from "next/navigation";

  scale: number;

  isVisible: boolean;"use client";import { useCallback, useEffect, useRef, useState } from "react";

  isSelected: boolean;

}



export default function ARExperience() {import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";// 🎯 Tipos de Experiencia AR

  const params = useParams();

  const router = useRouter();import { normalizeExperience } from "@/lib/helpers/experienceHelpers";type ARMode = "viewer" | "marker";

  const experienceId = params.id as string;

import { Asset, Experience } from "@/types";type LoadingState = "loading" | "ready" | "error" | "permissions";

  const [experience, setExperience] = useState<Experience | null>(null);

  const [arState, setArState] = useState<ARState>({import { useParams, useRouter } from "next/navigation";

    isActive: false,

    isLoading: true,import { useCallback, useEffect, useRef, useState } from "react";interface ARExperienceState {

    hasCamera: false,

    hasWebXR: false,  mode: ARMode;

    error: null,

    mode: 'inactive'// 🎯 Tipos AR Core  isActive: boolean;

  });

  const [arObjects, setArObjects] = useState<ARObject[]>([]);interface ARSession {  loadingState: LoadingState;



  const videoRef = useRef<HTMLVideoElement>(null);  isActive: boolean;  hasError: boolean;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const streamRef = useRef<MediaStream | null>(null);  mode: 'immersive-ar' | 'inline' | 'fallback';  errorMessage: string;

  const animationRef = useRef<number>();

  hasCamera: boolean;  progress: number; // 0-100 para carga progresiva

  // Cargar experiencia

  const loadExperience = useCallback(async () => {  hasWebXR: boolean;}

    try {

      setArState(prev => ({ ...prev, isLoading: true, error: null }));  frameRate: number;



      const data = experienceId.match(/^[0-9]+$/)}interface DeviceCapabilities {

        ? await getExperienceById(experienceId)

        : await getExperienceBySlug(experienceId);  hasCamera: boolean;



      if (!data?.data) {interface ARObject {  hasWebXR: boolean;

        throw new Error("Experiencia no encontrada");

      }  id: string;  isSecureContext: boolean;



      const exp = normalizeExperience(data.data);  asset: Asset;  isMobile: boolean;

      setExperience(exp);

  position: { x: number; y: number; z: number };  supportsAR: boolean;

      // Crear objetos AR

      const objects: ARObject[] = exp.assets.map((asset, index) => ({  rotation: { x: number; y: number; z: number };}

        id: `ar_${index}`,

        asset,  scale: number;

        position: { 

          x: (Math.random() - 0.5) * 2,   isVisible: boolean;interface ARInteractionState {

          y: Math.random() * 0.5, 

          z: -2 - Math.random()   isTracked: boolean;  position: { x: number; y: number };

        },

        scale: 0.8 + Math.random() * 0.4,}  scale: number;

        isVisible: true,

        isSelected: false  rotation: number;

      }));

interface ARTracking {  isDragging: boolean;

      setArObjects(objects);

      setArState(prev => ({ ...prev, isLoading: false }));  surfaces: ARSurface[];  isScaling: boolean;



    } catch (error) {  anchors: ARAnchor[];  lastTouchDistance: number;

      console.error("Error cargando experiencia:", error);

      setArState(prev => ({  hitTestResults: ARHitTestResult[];}

        ...prev,

        isLoading: false,}

        error: error instanceof Error ? error.message : "Error desconocido"

      }));// 🎨 Sistema de Assets Preloader

    }

  }, [experienceId]);interface ARSurface {interface AssetLoader {



  // Detectar capacidades  id: string;  loaded: Map<string, any>;

  const detectCapabilities = useCallback(async () => {

    const hasCamera = !!(navigator.mediaDevices?.getUserMedia);  type: 'horizontal' | 'vertical';  loading: Set<string>;

    const hasWebXR = 'xr' in navigator;

      center: { x: number; y: number; z: number };  failed: Set<string>;

    setArState(prev => ({ ...prev, hasCamera, hasWebXR }));

      size: { width: number; height: number };}

    return { hasCamera, hasWebXR };

  }, []);  confidence: number;



  // Iniciar cámara}export default function ARExperience() {

  const startCamera = useCallback(async () => {

    try {  const params = useParams();

      const stream = await navigator.mediaDevices.getUserMedia({

        video: { interface ARAnchor {  const router = useRouter();

          facingMode: 'environment',

          width: { ideal: 1280 },  id: string;  const experienceId = params.id as string;

          height: { ideal: 720 }

        }  position: { x: number; y: number; z: number };

      });

  rotation: { x: number; y: number; z: number };  // 📱 Estados Principales

      streamRef.current = stream;

        tracked: boolean;  const [experience, setExperience] = useState<Experience | null>(null);

      if (videoRef.current) {

        videoRef.current.srcObject = stream;}  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

      }



      return stream;

    } catch (error) {interface ARHitTestResult {  // 🎯 Asset Loader para carga progresiva

      console.error("Error accediendo a cámara:", error);

      throw error;  position: { x: number; y: number; z: number };  const [assetLoader] = useState<AssetLoader>({

    }

  }, []);  distance: number;    loaded: new Map(),



  // Iniciar AR  surface: ARSurface | null;    loading: new Set(),

  const startAR = useCallback(async () => {

    try {}    failed: new Set(),

      setArState(prev => ({ ...prev, isLoading: true }));

  });

      const capabilities = await detectCapabilities();

      // 📱 Estado del sistema AR

      if (!capabilities.hasCamera) {

        throw new Error("Cámara no disponible");interface ARSystemState {  // 🚀 Estado AR Mejorado

      }

  session: ARSession;  const [arState, setArState] = useState<ARExperienceState>({

      await startCamera();

        tracking: ARTracking;    mode: "viewer", // Detección automática más adelante

      setArState(prev => ({ 

        ...prev,   objects: ARObject[];    isActive: false,

        isActive: true, 

        isLoading: false,  selectedObjectId: string | null;    loadingState: "loading",

        mode: capabilities.hasWebXR ? 'webxr' : 'fallback'

      }));  isLoading: boolean;    hasError: false,



      startRenderLoop();  error: string | null;    errorMessage: "",



    } catch (error) {  permissions: {    progress: 0,

      setArState(prev => ({ 

        ...prev,     camera: 'granted' | 'denied' | 'pending';  });

        isLoading: false, 

        error: error instanceof Error ? error.message : "Error iniciando AR"     motion: 'granted' | 'denied' | 'pending';

      }));

    }  };  // 🔧 Capacidades del Dispositivo

  }, [detectCapabilities, startCamera]);

}  const [deviceCapabilities, setDeviceCapabilities] =

  // Loop de renderizado

  const startRenderLoop = useCallback(() => {    useState<DeviceCapabilities>({

    const render = () => {

      if (!arState.isActive || !canvasRef.current) return;export default function ARExperience() {      hasCamera: false,



      const canvas = canvasRef.current;  const params = useParams();      hasWebXR: false,

      const ctx = canvas.getContext('2d');

      if (!ctx) return;  const router = useRouter();      isSecureContext: false,



      // Ajustar canvas  const experienceId = params.id as string;      isMobile: false,

      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width;      supportsAR: false,

      canvas.height = rect.height;

  // 📊 Estados principales    });

      // Limpiar

      ctx.clearRect(0, 0, canvas.width, canvas.height);  const [experience, setExperience] = useState<Experience | null>(null);



      // Renderizar objetos AR  const [arState, setArState] = useState<ARSystemState>({  // ✋ Estado de Interacción AR

      arObjects.forEach(obj => {

        if (!obj.isVisible) return;    session: {  const [arInteraction, setArInteraction] = useState<ARInteractionState>({



        const screenX = (obj.position.x + 1) * canvas.width * 0.5;      isActive: false,    position: { x: 0.5, y: 0.5 },

        const screenY = (1 - obj.position.y) * canvas.height * 0.5;

        const size = Math.min(canvas.width, canvas.height) * 0.15 * obj.scale;      mode: 'fallback',    scale: 1.0,



        renderARObject(ctx, obj, screenX, screenY, size);      hasCamera: false,    rotation: 0,

      });

      hasWebXR: false,    isDragging: false,

      animationRef.current = requestAnimationFrame(render);

    };      frameRate: 0    isScaling: false,



    render();    },    lastTouchDistance: 0,

  }, [arState.isActive, arObjects]);

    tracking: {  });

  // Renderizar objeto AR

  const renderARObject = useCallback((      surfaces: [],

    ctx: CanvasRenderingContext2D,

    obj: ARObject,      anchors: [],  // 🎥 Referencias Técnicas

    x: number,

    y: number,      hitTestResults: []  const videoRef = useRef<HTMLVideoElement>(null);

    size: number

  ) => {    },  const canvasRef = useRef<HTMLCanvasElement>(null);

    ctx.save();

    objects: [],  const animationRef = useRef<number>();

    // Efectos de selección

    if (obj.isSelected) {    selectedObjectId: null,  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

      ctx.shadowColor = '#00ff88';

      ctx.shadowBlur = 20;    isLoading: true,

      ctx.strokeStyle = '#00ff88';

      ctx.lineWidth = 4;    error: null,  // 🔍 Detección Avanzada de Capacidades AR

    }

    permissions: {  const checkARCapabilities = useCallback(async () => {

    // Renderizar según tipo

    switch (obj.asset.assetType) {      camera: 'pending',    const isSecure =

      case 'message':

        // Fondo del mensaje      motion: 'pending'      window.isSecureContext || location.hostname === "localhost";

        ctx.fillStyle = obj.isSelected ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 0, 0, 0.8)';

        ctx.fillRect(x - size/2, y - size/3, size, size * 0.6);    }    const hasMediaDevices = !!(

        

        if (obj.isSelected) {  });      navigator.mediaDevices && navigator.mediaDevices.getUserMedia

          ctx.strokeRect(x - size/2, y - size/3, size, size * 0.6);

        }    );

        

        // Texto  // 🎥 Referencias para AR    const isMobile =

        ctx.fillStyle = 'white';

        ctx.font = `${size/8}px Arial`;  const videoRef = useRef<HTMLVideoElement>(null);      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(

        ctx.textAlign = 'center';

        ctx.fillText(obj.asset.name, x, y);  const canvasRef = useRef<HTMLCanvasElement>(null);        navigator.userAgent

        

        // Ícono  const xrSessionRef = useRef<XRSession | null>(null);      );

        ctx.font = `${size/4}px Arial`;

        ctx.fillText('💬', x, y - size/6);  const animationFrameRef = useRef<number>();

        break;

  const mediaStreamRef = useRef<MediaStream | null>(null);    // 🌐 Verificar soporte WebXR

      case 'image':

        // Marco de imagen    let hasWebXR = false;

        ctx.fillStyle = obj.isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.9)';

        ctx.fillRect(x - size/2, y - size/2, size, size);  // 🔍 Detectar capacidades AR del dispositivo    if ("xr" in navigator) {

        

        ctx.strokeStyle = obj.isSelected ? '#3b82f6' : '#6b7280';  const detectARCapabilities = useCallback(async () => {      try {

        ctx.lineWidth = obj.isSelected ? 4 : 2;

        ctx.strokeRect(x - size/2, y - size/2, size, size);    console.log("🔍 Detectando capacidades AR...");        const xr = (navigator as any).xr;

        

        // Contenido            if (xr && typeof xr.isSessionSupported === "function") {

        ctx.fillStyle = obj.isSelected ? '#1e40af' : '#374151';

        ctx.font = `${size/4}px Arial`;    try {          hasWebXR = await xr.isSessionSupported("immersive-ar");

        ctx.textAlign = 'center';

        ctx.fillText('🖼️', x, y - size/8);      // Verificar WebXR        }

        

        ctx.font = `${size/10}px Arial`;      const hasWebXR = 'xr' in navigator && 'isSessionSupported' in navigator.xr;      } catch (error) {

        ctx.fillStyle = 'white';

        ctx.fillText(obj.asset.name, x, y + size/4);      let supportsImmersiveAR = false;        console.log("WebXR no disponible:", error);

        break;

            }

      case 'video':

        // Panel de video      if (hasWebXR) {    }

        ctx.fillStyle = obj.isSelected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(20, 20, 20, 0.9)';

        ctx.fillRect(x - size/2, y - size/2, size, size);        try {

        

        ctx.strokeStyle = obj.isSelected ? '#ef4444' : '#6b7280';          supportsImmersiveAR = await navigator.xr.isSessionSupported('immersive-ar');    const supportsAR = isSecure && (hasWebXR || hasMediaDevices);

        ctx.lineWidth = obj.isSelected ? 4 : 2;

        ctx.strokeRect(x - size/2, y - size/2, size, size);        } catch (err) {

        

        // Play button          console.log("WebXR immersive-ar no soportado:", err);    setDeviceCapabilities({

        ctx.fillStyle = obj.isSelected ? '#dc2626' : '#f87171';

        ctx.beginPath();        }      hasCamera: isSecure && hasMediaDevices,

        ctx.moveTo(x - size/8, y - size/8);

        ctx.lineTo(x + size/8, y);      }      hasWebXR,

        ctx.lineTo(x - size/8, y + size/8);

        ctx.closePath();      isSecureContext: isSecure,

        ctx.fill();

              // Verificar cámara      isMobile,

        // Label

        ctx.fillStyle = 'white';      const hasCamera = !!(navigator.mediaDevices?.getUserMedia);      supportsAR,

        ctx.font = `${size/10}px Arial`;

        ctx.textAlign = 'center';          });

        ctx.fillText(obj.asset.name, x, y + size/3);

        break;      // Verificar contexto seguro



      case 'model3d':      const isSecure = window.isSecureContext;    console.log("🔧 Capacidades AR detectadas:", {

        // Cubo 3D

        const cubeSize = size * 0.8;            hasCamera: isSecure && hasMediaDevices,

        const depth = cubeSize * 0.3;

              console.log("📊 Capacidades detectadas:", {      hasWebXR,

        // Cara frontal

        ctx.fillStyle = obj.isSelected ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.7)';        hasWebXR,      isSecureContext: isSecure,

        ctx.fillRect(x - cubeSize/2, y - cubeSize/2, cubeSize, cubeSize);

                supportsImmersiveAR,      isMobile,

        // Cara superior

        ctx.fillStyle = obj.isSelected ? 'rgba(160, 82, 45, 0.9)' : 'rgba(160, 82, 45, 0.7)';        hasCamera,      supportsAR,

        ctx.beginPath();

        ctx.moveTo(x - cubeSize/2, y - cubeSize/2);        isSecure    });

        ctx.lineTo(x - cubeSize/2 + depth, y - cubeSize/2 - depth);

        ctx.lineTo(x + cubeSize/2 + depth, y - cubeSize/2 - depth);      });  }, []);

        ctx.lineTo(x + cubeSize/2, y - cubeSize/2);

        ctx.closePath();

        ctx.fill();

              return {  // 🚀 Inicialización de Capacidades

        // Cara lateral

        ctx.fillStyle = obj.isSelected ? 'rgba(101, 67, 33, 0.9)' : 'rgba(101, 67, 33, 0.7)';        hasWebXR,  useEffect(() => {

        ctx.beginPath();

        ctx.moveTo(x + cubeSize/2, y - cubeSize/2);        supportsImmersiveAR,    checkARCapabilities();

        ctx.lineTo(x + cubeSize/2 + depth, y - cubeSize/2 - depth);

        ctx.lineTo(x + cubeSize/2 + depth, y + cubeSize/2 - depth);        hasCamera,  }, [checkARCapabilities]);

        ctx.lineTo(x + cubeSize/2, y + cubeSize/2);

        ctx.closePath();        isSecure

        ctx.fill();

              };  // 🎯 Carga Progresiva de Experiencia con Detección de Modo AR

        if (obj.isSelected) {

          ctx.strokeRect(x - cubeSize/2, y - cubeSize/2, cubeSize, cubeSize);        const loadExperienceData = useCallback(async () => {

        }

            } catch (error) {    if (!experienceId) {

        // Label

        ctx.fillStyle = 'white';      console.error("❌ Error detectando capacidades:", error);      setArState((prev) => ({

        ctx.font = `${size/10}px Arial`;

        ctx.textAlign = 'center';      return {        ...prev,

        ctx.fillText(obj.asset.name, x, y + size/2);

        break;        hasWebXR: false,        hasError: true,



      case 'webcontent':        supportsImmersiveAR: false,        errorMessage: "ID de experiencia no válido",

        // Panel web

        ctx.fillStyle = obj.isSelected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.1)';        hasCamera: false,        loadingState: "error",

        ctx.fillRect(x - size/2, y - size/2, size, size);

                isSecure: false      }));

        // Barra superior

        ctx.fillStyle = obj.isSelected ? '#059669' : '#10b981';      };      return;

        ctx.fillRect(x - size/2, y - size/2, size, size/6);

            }    }

        ctx.strokeStyle = obj.isSelected ? '#047857' : '#059669';

        ctx.lineWidth = obj.isSelected ? 3 : 2;  }, []);

        ctx.strokeRect(x - size/2, y - size/2, size, size);

            try {

        // Icono

        ctx.fillStyle = 'white';  // 📥 Cargar experiencia AR      console.log("� Cargando experiencia AR:", experienceId);

        ctx.font = `${size/4}px Arial`;

        ctx.textAlign = 'center';  const loadARExperience = useCallback(async () => {

        ctx.fillText('🌐', x, y);

            console.log(`📥 Cargando experiencia AR: ${experienceId}`);      // Fase 1: Cargar datos básicos

        // Label

        ctx.font = `${size/10}px Arial`;          setArState((prev) => ({

        ctx.fillText(obj.asset.name, x, y + size/3);

        break;    try {        ...prev,



      default:      setArState(prev => ({ ...prev, isLoading: true, error: null }));        loadingState: "loading",

        // Default

        ctx.fillStyle = obj.isSelected ? 'rgba(107, 114, 128, 0.9)' : 'rgba(107, 114, 128, 0.7)';        progress: 10,

        ctx.fillRect(x - size/2, y - size/2, size, size);

              const data = experienceId.match(/^[0-9]+$/)      }));

        if (obj.isSelected) {

          ctx.strokeRect(x - size/2, y - size/2, size, size);        ? await getExperienceById(experienceId)

        }

                : await getExperienceBySlug(experienceId);      const isUuid =

        ctx.fillStyle = 'white';

        ctx.font = `${size/8}px Arial`;        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(

        ctx.textAlign = 'center';

        ctx.fillText(obj.asset.name, x, y);      if (!data || !data.data) {          experienceId

    }

        throw new Error("Experiencia no encontrada");        );

    ctx.restore();

  }, []);      }



  // Manejar toque en canvas      let response;

  const handleCanvasTouch = useCallback((e: React.TouchEvent) => {

    e.preventDefault();      const normalizedExp = normalizeExperience(data.data);      try {

    

    if (e.touches.length === 1) {      setExperience(normalizedExp);        if (isUuid) {

      const touch = e.touches[0];

      const rect = canvasRef.current?.getBoundingClientRect();          response = await getExperienceById(experienceId);

      if (!rect) return;

      // Crear objetos AR para cada asset        } else {

      const x = (touch.clientX - rect.left) / rect.width;

      const y = (touch.clientY - rect.top) / rect.height;      const arObjects: ARObject[] = normalizedExp.assets.map((asset, index) => ({          response = await getExperienceBySlug(experienceId);



      // Buscar objeto tocado        id: `object_${index}`,        }

      const hitObject = arObjects.find(obj => {

        const objX = (obj.position.x + 1) * 0.5;        asset,      } catch (networkError) {

        const objY = (1 - obj.position.y) * 0.5;

        const distance = Math.sqrt(Math.pow(x - objX, 2) + Math.pow(y - objY, 2));        position: { x: 0, y: 0, z: -2 }, // 2 metros frente al usuario        throw new Error(

        return distance < 0.1;

      });        rotation: { x: 0, y: 0, z: 0 },          "Error de conexión. Verifica que el API esté disponible."



      if (hitObject) {        scale: 1.0,        );

        setArObjects(prev => prev.map(obj => ({

          ...obj,        isVisible: true,      }

          isSelected: obj.id === hitObject.id ? !obj.isSelected : false

        })));        isTracked: false

      }

    }      }));      if (!response?.success || !response.data) {

  }, [arObjects]);

        throw new Error("Experiencia no encontrada");

  // Detener AR

  const stopAR = useCallback(() => {      setArState(prev => ({      }

    if (streamRef.current) {

      streamRef.current.getTracks().forEach(track => track.stop());        ...prev,

      streamRef.current = null;

    }        objects: arObjects,      // Fase 2: Normalizar y detectar tipo AR

    

    if (animationRef.current) {        isLoading: false      setArState((prev) => ({ ...prev, progress: 30 }));

      cancelAnimationFrame(animationRef.current);

      animationRef.current = undefined;      }));

    }

          const normalizedExperience = normalizeExperience(response.data);

    setArState(prev => ({ ...prev, isActive: false, mode: 'inactive' }));

  }, []);      console.log("✅ Experiencia AR cargada:", normalizedExp.title);      setExperience(normalizedExperience);



  const handleBack = useCallback(() => {      console.log("🎯 Objetos AR creados:", arObjects.length);

    stopAR();

    router.push('/experiences');      // 🧠 Detección Inteligente del Modo AR

  }, [stopAR, router]);

    } catch (error) {      const arMode = detectARMode(normalizedExperience);

  // Effects

  useEffect(() => {      console.error("❌ Error cargando experiencia:", error);      console.log(`🎯 Modo AR detectado: ${arMode}`);

    loadExperience();

    detectCapabilities();      setArState(prev => ({

  }, [loadExperience, detectCapabilities]);

        ...prev,      // Fase 3: Precargar assets críticos

  useEffect(() => {

    if (arState.isActive) {        isLoading: false,      setArState((prev) => ({ ...prev, progress: 50, mode: arMode }));

      startRenderLoop();

    }        error: error instanceof Error ? error.message : "Error desconocido"      await preloadCriticalAssets(normalizedExperience.assets);

    

    return () => {      }));

      if (animationRef.current) {

        cancelAnimationFrame(animationRef.current);    }      // Fase 4: Listo para AR

      }

    };  }, [experienceId]);      setArState((prev) => ({

  }, [arState.isActive, startRenderLoop]);

        ...prev,

  useEffect(() => {

    return () => {  // 🎥 Inicializar cámara para AR        loadingState: "ready",

      stopAR();

    };  const initializeCamera = useCallback(async () => {        progress: 100,

  }, [stopAR]);

    console.log("🎥 Inicializando cámara AR...");        hasError: false,

  // Loading

  if (arState.isLoading) {          }));

    return (

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">    try {

        <div className="text-center text-white">

          <div className="relative w-24 h-24 mx-auto mb-8">      setArState(prev => ({      console.log("✅ Experiencia AR lista:", normalizedExperience.title);

            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>

            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>        ...prev,    } catch (error: any) {

          </div>

          <h2 className="text-2xl font-bold mb-4">🌟 Cargando AR</h2>        permissions: { ...prev.permissions, camera: 'pending' }      console.error("❌ Error cargando experiencia:", error);

          <p className="text-blue-200">Preparando experiencia...</p>

        </div>      }));      setArState((prev) => ({

      </div>

    );        ...prev,

  }

      const stream = await navigator.mediaDevices.getUserMedia({        hasError: true,

  // Error

  if (arState.error) {        video: {        errorMessage: error.message || "Error desconocido",

    return (

      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center">          facingMode: 'environment', // Cámara trasera        loadingState: "error",

        <div className="text-center text-white max-w-md mx-4">

          <div className="text-8xl mb-8">⚠️</div>          width: { ideal: 1920, max: 1920 },        progress: 0,

          <h2 className="text-2xl font-bold mb-4">Error</h2>

          <p className="text-red-200 mb-8">{arState.error}</p>          height: { ideal: 1080, max: 1080 },      }));

          <button

            onClick={() => window.location.reload()}          frameRate: { ideal: 30, max: 60 }    }

            className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-semibold"

          >        }  }, [experienceId]);

            🔄 Reintentar

          </button>      });

        </div>

      </div>  // 🧠 Detectar Modo AR Automáticamente

    );

  }      mediaStreamRef.current = stream;  const detectARMode = useCallback((exp: Experience): ARMode => {



  // No experiencia          // Lógica de detección basada en los assets y metadatos

  if (!experience) {

    return (      if (videoRef.current) {    const hasMarkerAssets = exp.assets.some(

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">

        <div className="text-center text-white">        videoRef.current.srcObject = stream;      (asset) =>

          <div className="text-8xl mb-8">🤔</div>

          <h2 className="text-2xl font-bold">Experiencia no encontrada</h2>        await new Promise((resolve) => {        asset.name.toLowerCase().includes("marker") ||

        </div>

      </div>          if (videoRef.current) {        asset.name.toLowerCase().includes("target") ||

    );

  }            videoRef.current.onloadedmetadata = resolve;        (asset.assetType === "image" && asset.name.toLowerCase().includes("qr"))



  // AR Activo          }    );

  if (arState.isActive) {

    return (        });

      <div className="relative w-full h-screen bg-black overflow-hidden">

        {/* Video de cámara */}      }    // Si hay muchos assets o son 3D, probablemente sea viewer mode

        <video

          ref={videoRef}    const hasComplexAssets =

          className="absolute inset-0 w-full h-full object-cover"

          playsInline      setArState(prev => ({      exp.assets.some(

          muted

          autoPlay        ...prev,        (asset) => asset.assetType === "model3d" || asset.assetType === "video"

        />

        permissions: { ...prev.permissions, camera: 'granted' },      ) || exp.assets.length > 2;

        {/* Canvas AR */}

        <canvas        session: { ...prev.session, hasCamera: true }

          ref={canvasRef}

          className="absolute inset-0 w-full h-full z-10"      }));    if (hasMarkerAssets && !hasComplexAssets) {

          onTouchStart={handleCanvasTouch}

        />      return "marker";



        {/* HUD */}      console.log("✅ Cámara inicializada correctamente");    }

        <div className="absolute inset-0 pointer-events-none z-20">

          {/* Header */}      return stream;

          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">

            <div className="flex items-center justify-between">    return "viewer"; // Default para experiencias libres

              <button

                onClick={stopAR}    } catch (error) {  }, []);

                className="flex items-center space-x-2 bg-black/80 px-6 py-3 rounded-full text-white font-semibold hover:bg-black/90"

              >      console.error("❌ Error inicializando cámara:", error);

                <span>←</span>

                <span>Salir</span>      setArState(prev => ({  // 📦 Precargar Assets Críticos

              </button>

        ...prev,  const preloadCriticalAssets = useCallback(

              <div className="bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-400/50">

                <div className="flex items-center space-x-2">        permissions: { ...prev.permissions, camera: 'denied' },    async (assets: Asset[]) => {

                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>

                  <span className="text-emerald-300 font-semibold">AR ACTIVO</span>        error: "No se pudo acceder a la cámara"      const imageAssets = assets.filter(

                </div>

              </div>      }));        (asset) => asset.assetType === "image" && asset.assetUrl

            </div>

          </div>      throw error;      );



          {/* Instrucciones */}    }

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

            <div className="bg-black/40 backdrop-blur-md px-8 py-4 rounded-2xl text-center text-white">  }, []);      const promises = imageAssets.map(async (asset) => {

              <div className="text-lg font-semibold mb-2">

                👆 Toca los objetos AR        if (!asset.assetUrl || assetLoader.loaded.has(asset.id)) return;

              </div>

              <div className="text-sm text-white/70">  // 🌐 Inicializar sesión WebXR

                Mueve el dispositivo para explorar

              </div>  const initializeWebXRSession = useCallback(async () => {        assetLoader.loading.add(asset.id);

            </div>

          </div>    console.log("🌐 Inicializando sesión WebXR...");



          {/* Panel de objetos */}            try {

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent pointer-events-auto">

            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4">    try {          const img = new Image();

              <div className="text-white font-semibold mb-3 text-center">

                🎯 Objetos AR ({arObjects.length})      if (!navigator.xr) {          img.crossOrigin = "anonymous";

              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">        throw new Error("WebXR no disponible");

                {arObjects.map((obj) => (

                  <button      }          await new Promise<void>((resolve, reject) => {

                    key={obj.id}

                    onClick={() => setArObjects(prev => prev.map(o => ({            img.onload = () => {

                      ...o,

                      isSelected: o.id === obj.id ? !o.isSelected : false      const session = await navigator.xr.requestSession('immersive-ar', {              assetLoader.loaded.set(asset.id, img);

                    })))}

                    className={`p-3 rounded-xl text-center transition-all ${        requiredFeatures: ['local'],              assetLoader.loading.delete(asset.id);

                      obj.isSelected

                        ? 'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-300'        optionalFeatures: ['hit-test', 'anchors', 'plane-detection']              resolve();

                        : 'bg-white/10 border border-white/20 text-white/80'

                    }`}      });            };

                  >

                    <div className="text-xl mb-1">            img.onerror = () => {

                      {obj.asset.assetType === 'message' && '💬'}

                      {obj.asset.assetType === 'image' && '🖼️'}      xrSessionRef.current = session;              assetLoader.failed.add(asset.id);

                      {obj.asset.assetType === 'video' && '🎥'}

                      {obj.asset.assetType === 'model3d' && '📦'}              assetLoader.loading.delete(asset.id);

                      {obj.asset.assetType === 'webcontent' && '🌐'}

                    </div>      // Configurar eventos de sesión              reject(new Error(`Failed to load ${asset.name}`));

                    <div className="text-xs truncate">

                      {obj.asset.name}      session.addEventListener('end', () => {            };

                    </div>

                  </button>        console.log("🛑 Sesión WebXR terminada");            img.src = asset.assetUrl!;

                ))}

              </div>        xrSessionRef.current = null;          });

            </div>

          </div>        setArState(prev => ({

        </div>

      </div>          ...prev,          console.log(`✅ Asset precargado: ${asset.name}`);

    );

  }          session: { ...prev.session, isActive: false, mode: 'fallback' }        } catch (error) {



  // Pantalla de inicio        }));          console.warn(`⚠️ No se pudo precargar: ${asset.name}`, error);

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">      });        }

      <div className="flex items-center justify-between p-6">

        <button      });

          onClick={handleBack}

          className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/20"      setArState(prev => ({

        >

          <span>←</span>        ...prev,      await Promise.allSettled(promises);

          <span>Volver</span>

        </button>        session: {    },

      </div>

          ...prev.session,    [assetLoader]

      <div className="flex-1 flex items-center justify-center p-6">

        <div className="text-center text-white max-w-lg">          isActive: true,  );

          <div className="mb-12">

            <div className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">          mode: 'immersive-ar',

              {experience.title}

            </div>          hasWebXR: true  // Ejecutar carga

            {experience.description && (

              <p className="text-blue-200 leading-relaxed text-lg mb-6">        }  useEffect(() => {

                {experience.description}

              </p>      }));    loadExperienceData();

            )}

          </div>  }, [loadExperienceData]);



          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-12">      console.log("✅ Sesión WebXR inicializada");

            <div className="text-3xl mb-6">🌟 Realidad Aumentada</div>

            <div className="text-xl font-semibold mb-4">      return session;  // 🎬 Renderizado AR Automático y Suave

              {experience.assets.length} objeto{experience.assets.length !== 1 ? 's' : ''} AR

            </div>  useEffect(() => {

            <div className="text-blue-200 mb-6">

              Tipos: {[...new Set(experience.assets.map(a => a.assetType))].join(', ')}    } catch (error) {    if (arState.isActive && canvasRef.current) {

            </div>

                  console.error("❌ Error inicializando WebXR:", error);      console.log("🚀 Iniciando renderizado AR...");

            <div className="grid grid-cols-2 gap-3 mb-6">

              {experience.assets.slice(0, 4).map((asset, index) => (      throw error;      startARRenderingLoop();

                <div key={index} className="bg-white/5 rounded-lg p-3 text-sm">

                  <div className="text-lg mb-1">    }    }

                    {asset.assetType === 'message' && '💬'}

                    {asset.assetType === 'image' && '🖼️'}  }, []);

                    {asset.assetType === 'video' && '🎥'}

                    {asset.assetType === 'model3d' && '📦'}    return () => {

                    {asset.assetType === 'webcontent' && '🌐'}

                  </div>  // 🎯 Iniciar experiencia AR completa      if (animationRef.current) {

                  <div className="truncate">{asset.name}</div>

                </div>  const startARExperience = useCallback(async () => {        cancelAnimationFrame(animationRef.current);

              ))}

            </div>    console.log("🚀 Iniciando experiencia AR...");      }

          </div>

        };

          <div className={`mb-8 bg-white/10 rounded-xl p-6 ${

            arState.hasCamera ? 'border-green-400/50' : 'border-red-400/50'    try {  }, [arState.isActive]);

          }`}>

            <div className="flex items-center justify-center space-x-3">      const capabilities = await detectARCapabilities();

              <span className="text-2xl">

                {arState.hasCamera ? '✅' : '❌'}        // 🎯 Modo de Prueba Sin Cámara (Profesional)

              </span>

              <div>      // Siempre inicializar cámara  const startARPreview = useCallback(() => {

                <div className="font-semibold">

                  {arState.hasCamera ? 'Cámara Disponible' : 'Cámara No Disponible'}      await initializeCamera();    console.log("🎭 Iniciando vista previa AR...");

                </div>

                <div className="text-sm text-white/70">          setArState((prev) => ({

                  {window.isSecureContext ? 'Contexto seguro ✓' : 'Requiere HTTPS ⚠️'}

                </div>      // Intentar WebXR si está disponible      ...prev,

              </div>

            </div>      if (capabilities.supportsImmersiveAR) {      isActive: true,

          </div>

        try {      loadingState: "ready",

          <button

            onClick={startAR}          await initializeWebXRSession();    }));

            disabled={!arState.hasCamera || !window.isSecureContext}

            className={`w-full p-6 rounded-2xl text-white font-bold text-xl mb-6 ${          startWebXRLoop();  }, []);

              !arState.hasCamera || !window.isSecureContext

                ? "bg-gray-600 cursor-not-allowed opacity-60"        } catch (xrError) {

                : "bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600"

            }`}          console.log("⚠️ WebXR falló, usando fallback:", xrError);  // 📱 Inicio de AR con Cámara Profesional

          >

            {!window.isSecureContext ? "❌ Requiere HTTPS" :           startFallbackARLoop();  const startARCamera = useCallback(async () => {

             !arState.hasCamera ? "❌ Cámara No Disponible" :

             "🚀 INICIAR EXPERIENCIA AR"}        }    if (!deviceCapabilities.supportsAR) {

          </button>

      } else {      setArState((prev) => ({

          <div className="bg-white/5 rounded-xl p-6 text-left">

            <div className="font-semibold mb-4 text-center">📋 Instrucciones</div>        console.log("📱 Usando modo fallback AR (sin WebXR)");        ...prev,

            <div className="space-y-2 text-sm text-white/80">

              <div>• Permite acceso a la cámara</div>        startFallbackARLoop();        hasError: true,

              <div>• Apunta hacia superficies planas</div>

              <div>• Los objetos AR aparecen en el mundo real</div>      }        errorMessage: "AR no está disponible en este dispositivo",

              <div>• Toca para seleccionar e interactuar</div>

              <div>• Mueve el dispositivo para explorar</div>        loadingState: "error",

            </div>

          </div>      console.log("✅ Experiencia AR iniciada");      }));

        </div>

      </div>            return;

    </div>

  );    } catch (error) {    }

}
      console.error("❌ Error iniciando AR:", error);

      setArState(prev => ({    try {

        ...prev,      setArState((prev) => ({ ...prev, loadingState: "permissions" }));

        error: "No se pudo iniciar la experiencia AR"      console.log("📹 Solicitando acceso a cámara...");

      }));

    }      // Configuración optimizada para AR

  }, [detectARCapabilities, initializeCamera, initializeWebXRSession]);      const constraints: MediaStreamConstraints = {

        video: {

  // 🔄 Loop de renderizado WebXR (AR nativo)          facingMode: deviceCapabilities.isMobile

  const startWebXRLoop = useCallback(() => {            ? { ideal: "environment" }

    console.log("🔄 Iniciando loop WebXR...");            : "user",

              width: { ideal: 1280, min: 640 },

    const render = (timestamp: number, frame: XRFrame) => {          height: { ideal: 720, min: 480 },

      if (!xrSessionRef.current || !frame) return;          frameRate: { ideal: 30, min: 15 },

        },

      try {      };

        // Obtener pose del viewer

        const viewerPose = frame.getViewerPose(frame.session.renderState.baseSpace!);      const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!viewerPose) return;      setMediaStream(stream);



        // Hit testing para detección de superficies      // Transición suave a modo activo

        performHitTesting(frame);      await new Promise((resolve) => setTimeout(resolve, 100));

        

        // Actualizar tracking de objetos      if (videoRef.current) {

        updateObjectTracking(frame);        videoRef.current.srcObject = stream;

                await videoRef.current.play();

        // Renderizar objetos AR

        renderARObjects(frame, viewerPose);        setArState((prev) => ({

          ...prev,

        // Actualizar FPS          isActive: true,

        setArState(prev => ({          loadingState: "ready",

          ...prev,        }));

          session: { ...prev.session, frameRate: Math.round(1000 / 16.67) } // ~60fps

        }));        console.log("✅ Cámara AR iniciada exitosamente");

      }

      } catch (error) {    } catch (error: any) {

        console.error("❌ Error en render loop:", error);      console.error("❌ Error de cámara:", error);

      }

      const errorMessages: Record<string, string> = {

      if (xrSessionRef.current) {        NotAllowedError:

        xrSessionRef.current.requestAnimationFrame(render);          "📷 Permisos de cámara denegados.\nPor favor permite el acceso y recarga.",

      }        NotFoundError: "📷 No se encontró cámara disponible.",

    };        NotSupportedError: "📱 Tu navegador no soporta cámara AR.",

        NotReadableError: "📷 Cámara ocupada por otra aplicación.",

    if (xrSessionRef.current) {      };

      xrSessionRef.current.requestAnimationFrame(render);

    }      setArState((prev) => ({

  }, []);        ...prev,

        hasError: true,

  // 📱 Loop de renderizado fallback (Canvas 2D)        errorMessage:

  const startFallbackARLoop = useCallback(() => {          errorMessages[error.name] || `Error de cámara: ${error.message}`,

    console.log("📱 Iniciando loop fallback AR...");        loadingState: "error",

          }));

    setArState(prev => ({    }

      ...prev,  }, [deviceCapabilities]);

      session: { ...prev.session, isActive: true, mode: 'fallback' }

    }));  // ✋ Sistema de Interacción AR Profesional y Suave

  const getTouchDistance = useCallback((touches: React.TouchList): number => {

    const render = () => {    if (touches.length < 2) return 0;

      if (!canvasRef.current || !videoRef.current) return;    const dx = touches[0].clientX - touches[1].clientX;

    const dy = touches[0].clientY - touches[1].clientY;

      try {    return Math.sqrt(dx * dx + dy * dy);

        const canvas = canvasRef.current;  }, []);

        const ctx = canvas.getContext('2d');

        if (!ctx) return;  const getRelativePosition = useCallback(

    (clientX: number, clientY: number) => {

        // Ajustar tamaño del canvas      const canvas = canvasRef.current;

        const rect = canvas.getBoundingClientRect();      if (!canvas) return { x: 0.5, y: 0.5 };

        const pixelRatio = window.devicePixelRatio || 1;

              const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * pixelRatio;      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

        canvas.height = rect.height * pixelRatio;      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

        ctx.scale(pixelRatio, pixelRatio);

      return { x, y };

        // Limpiar canvas    },

        ctx.clearRect(0, 0, rect.width, rect.height);    []

  );

        // Simular detección de superficies

        simulateSurfaceDetection();  // ✋ Manejadores de Eventos Táctiles Profesionales

          const handleTouchStart = useCallback((e: React.TouchEvent) => {

        // Renderizar objetos AR en 2D    e.preventDefault();

        renderFallbackARObjects(ctx, rect);

    if (e.touches.length === 1) {

        // Actualizar FPS      const touch = e.touches[0];

        const now = performance.now();      const pos = getRelativePosition(touch.clientX, touch.clientY);

        setArState(prev => ({      

          ...prev,      setArInteraction(prev => ({

          session: { ...prev.session, frameRate: Math.round(1000 / 16.67) }        ...prev,

        }));        isDragging: true,

        isScaling: false,

      } catch (error) {        position: pos,

        console.error("❌ Error en fallback render:", error);      }));

      }    } else if (e.touches.length === 2) {

      const distance = getTouchDistance(e.touches);

      animationFrameRef.current = requestAnimationFrame(render);      setArInteraction(prev => ({

    };        ...prev,

        isScaling: true,

    render();        isDragging: false,

  }, []);        lastTouchDistance: distance,

      }));

  // 🎯 Realizar hit testing para detección de superficies    }

  const performHitTesting = useCallback((frame: XRFrame) => {  }, [getRelativePosition, getTouchDistance]);

    // Implementación básica de hit testing

    // En una implementación real, esto usaría XRHitTestSource  const handleTouchMove = useCallback((e: React.TouchEvent) => {

    console.log("🎯 Realizando hit testing...");    e.preventDefault();

  }, []);

    if (arInteraction.isDragging && e.touches.length === 1) {

  // 🔄 Actualizar tracking de objetos AR      const touch = e.touches[0];

  const updateObjectTracking = useCallback((frame: XRFrame) => {      const pos = getRelativePosition(touch.clientX, touch.clientY);

    setArState(prev => ({      setArInteraction(prev => ({ ...prev, position: pos }));

      ...prev,    } else if (arInteraction.isScaling && e.touches.length === 2) {

      objects: prev.objects.map(obj => ({      const distance = getTouchDistance(e.touches);

        ...obj,      if (arInteraction.lastTouchDistance > 0) {

        isTracked: true // En implementación real, verificar tracking real        const scaleFactor = distance / arInteraction.lastTouchDistance;

      }))        const newScale = Math.max(0.3, Math.min(3.0, arInteraction.scale * scaleFactor));

    }));        setArInteraction(prev => ({

  }, []);          ...prev,

          scale: newScale,

  // 🎨 Renderizar objetos AR (WebXR)          lastTouchDistance: distance,

  const renderARObjects = useCallback((frame: XRFrame, viewerPose: XRViewerPose) => {        }));

    console.log("🎨 Renderizando objetos AR (WebXR)");      }

    // Implementación del renderizado 3D real    }

  }, []);  }, [arInteraction, getRelativePosition, getTouchDistance]);



  // 🎨 Renderizar objetos AR (Fallback 2D)  const handleTouchEnd = useCallback((e: React.TouchEvent) => {

  const renderFallbackARObjects = useCallback((ctx: CanvasRenderingContext2D, rect: DOMRect) => {    e.preventDefault();

    arState.objects.forEach((obj, index) => {    setArInteraction(prev => ({

      if (!obj.isVisible) return;      ...prev,

      isDragging: false,

      // Calcular posición en pantalla basada en posición 3D simulada      isScaling: false,

      const screenX = (obj.position.x + 1) * rect.width * 0.5;    }));

      const screenY = (1 - obj.position.y) * rect.height * 0.5;  }, []);

      const size = Math.min(rect.width, rect.height) * 0.2 * obj.scale;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {

      // Renderizar según tipo de asset    e.preventDefault();

      renderAssetOnCanvas(ctx, obj.asset, screenX, screenY, size, obj.id === arState.selectedObjectId);    const pos = getRelativePosition(e.clientX, e.clientY);

    });    setArInteraction(prev => ({

  }, [arState.objects, arState.selectedObjectId]);      ...prev,

      isDragging: true,

  // 🖼️ Renderizar asset específico en canvas      position: pos,

  const renderAssetOnCanvas = useCallback((    }));

    ctx: CanvasRenderingContext2D,   }, [getRelativePosition]);

    asset: Asset, 

    x: number,   const handleMouseMove = useCallback((e: React.MouseEvent) => {

    y: number,     if (arInteraction.isDragging) {

    size: number,      e.preventDefault();

    isSelected: boolean      const pos = getRelativePosition(e.clientX, e.clientY);

  ) => {      setArInteraction(prev => ({ ...prev, position: pos }));

    ctx.save();    }

  }, [arInteraction.isDragging, getRelativePosition]);

    // Sombra y efectos para objetos seleccionados

    if (isSelected) {  const handleMouseUp = useCallback((e: React.MouseEvent) => {

      ctx.shadowColor = '#00ff88';    e.preventDefault();

      ctx.shadowBlur = 20;    setArInteraction(prev => ({ ...prev, isDragging: false }));

      ctx.strokeStyle = '#00ff88';  }, []);

      ctx.lineWidth = 3;

    }  const handleWheel = useCallback((e: React.WheelEvent) => {

    e.preventDefault();

    switch (asset.assetType) {    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;

      case 'message':    const newScale = Math.max(0.3, Math.min(3.0, arInteraction.scale * scaleFactor));

        renderTextAsset(ctx, asset, x, y, size, isSelected);    setArInteraction(prev => ({ ...prev, scale: newScale }));

        break;  }, [arInteraction.scale]);

      case 'image':

        renderImageAsset(ctx, asset, x, y, size, isSelected);  // 🎬 Sistema de Renderizado AR Profesional

        break;  const startARRenderingLoop = useCallback(() => {

      case 'video':    const canvas = canvasRef.current;

        renderVideoAsset(ctx, asset, x, y, size, isSelected);    const ctx = canvas?.getContext("2d");

        break;

      case 'model3d':    if (!canvas || !ctx) {

        render3DAsset(ctx, asset, x, y, size, isSelected);      console.warn("❌ Canvas no disponible para renderizado AR");

        break;      return;

      case 'webcontent':    }

        renderWebAsset(ctx, asset, x, y, size, isSelected);

        break;    console.log("🎨 Iniciando bucle de renderizado AR...");

      default:

        renderDefaultAsset(ctx, asset, x, y, size, isSelected);    const renderFrame = (timestamp: number) => {

    }      if (!arState.isActive) {

        if (animationRef.current) {

    ctx.restore();          cancelAnimationFrame(animationRef.current);

  }, []);          animationRef.current = undefined;

        }

  // 📝 Renderizado específico por tipo de asset        return;

  const renderTextAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number, isSelected: boolean) => {      }

    // Fondo con vidrio esmerilado

    ctx.fillStyle = isSelected ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 0, 0, 0.7)';      // Ajuste dinámico de resolución

    ctx.fillRect(x - size/2, y - size/3, size, size * 0.6);      const rect = canvas.getBoundingClientRect();

          const pixelRatio = window.devicePixelRatio || 1;

    if (isSelected) {

      ctx.strokeRect(x - size/2, y - size/3, size, size * 0.6);      canvas.width = rect.width * pixelRatio;

    }      canvas.height = rect.height * pixelRatio;

    

    // Texto      ctx.scale(pixelRatio, pixelRatio);

    ctx.fillStyle = 'white';      canvas.style.width = rect.width + "px";

    ctx.font = `${size/6}px 'Segoe UI', Arial, sans-serif`;      canvas.style.height = rect.height + "px";

    ctx.textAlign = 'center';

    ctx.textBaseline = 'middle';      // Limpiar con degradado sutil para mejor calidad visual

          ctx.clearRect(0, 0, rect.width, rect.height);

    const text = asset.description || asset.name;

    const words = text.split(' ');      // Renderizar contenido AR

    const maxWidth = size * 0.8;      if (experience?.assets?.length) {

    let line = '';        renderARContent(ctx, rect.width, rect.height, timestamp);

    let lineY = y - size/8;      }

    

    for (let n = 0; n < words.length; n++) {      // HUD minimalista

      const testLine = line + words[n] + ' ';      renderARInterface(ctx, rect.width, rect.height);

      const metrics = ctx.measureText(testLine);

      const testWidth = metrics.width;      // Continuar bucle

            animationRef.current = requestAnimationFrame(renderFrame);

      if (testWidth > maxWidth && n > 0) {    };

        ctx.fillText(line, x, lineY);

        line = words[n] + ' ';    animationRef.current = requestAnimationFrame(renderFrame);

        lineY += size/6;  }, [arState.isActive, experience]);

      } else {

        line = testLine;  // 🎯 Renderizado de Contenido AR Optimizado

      }  const renderARContent = useCallback(

    }    (

    ctx.fillText(line, x, lineY);      ctx: CanvasRenderingContext2D,

          width: number,

    // Ícono      height: number,

    ctx.font = `${size/4}px Arial`;      timestamp: number

    ctx.fillText('💬', x, y + size/4);    ) => {

  };      if (!experience?.assets?.length) return;



  const renderImageAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number, isSelected: boolean) => {      const currentAsset = experience.assets[currentAssetIndex];

    // Marco de imagen con efecto holográfico      if (!currentAsset) return;

    ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.9)';

    ctx.fillRect(x - size/2, y - size/2, size, size);      // Posición con suavizado

          const centerX = width * arInteraction.position.x;

    ctx.strokeStyle = isSelected ? '#3b82f6' : '#6b7280';      const centerY = height * arInteraction.position.y;

    ctx.lineWidth = isSelected ? 4 : 2;      const scale = arInteraction.scale;

    ctx.strokeRect(x - size/2, y - size/2, size, size);      const rotation = arInteraction.rotation + timestamp * 0.001; // Rotación suave

    

    // Ícono y etiqueta      ctx.save();

    ctx.fillStyle = isSelected ? '#1e40af' : '#374151';      ctx.translate(centerX, centerY);

    ctx.font = `${size/3}px Arial`;      ctx.rotate(rotation);

    ctx.textAlign = 'center';      ctx.scale(scale, scale);

    ctx.fillText('🖼️', x, y - size/6);

          // Renderizar según tipo de asset

    ctx.font = `${size/8}px 'Segoe UI', Arial, sans-serif`;      switch (currentAsset.assetType) {

    ctx.fillText(asset.name, x, y + size/4);        case "message":

  };          renderMessageAsset(ctx, currentAsset);

          break;

  const renderVideoAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number, isSelected: boolean) => {        case "image":

    // Panel de video con efectos          renderImageAsset(ctx, currentAsset);

    ctx.fillStyle = isSelected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(20, 20, 20, 0.9)';          break;

    ctx.fillRect(x - size/2, y - size/2, size, size);        case "video":

              renderVideoAsset(ctx, currentAsset);

    ctx.strokeStyle = isSelected ? '#ef4444' : '#6b7280';          break;

    ctx.lineWidth = isSelected ? 4 : 2;        case "model3d":

    ctx.strokeRect(x - size/2, y - size/2, size, size);          render3DAsset(ctx, currentAsset);

              break;

    // Botón de play        case "webcontent":

    ctx.fillStyle = isSelected ? '#dc2626' : '#f87171';          renderWebContentAsset(ctx, currentAsset);

    ctx.beginPath();          break;

    ctx.moveTo(x - size/8, y - size/8);      }

    ctx.lineTo(x + size/8, y);

    ctx.lineTo(x - size/8, y + size/8);      ctx.restore();

    ctx.closePath();

    ctx.fill();      // Efectos de interacción

          if (arInteraction.isDragging || arInteraction.isScaling) {

    // Etiqueta        renderInteractionFeedback(ctx, centerX, centerY, scale);

    ctx.fillStyle = 'white';      }

    ctx.font = `${size/8}px 'Segoe UI', Arial, sans-serif`;    },

    ctx.textAlign = 'center';    [experience, currentAssetIndex, arInteraction]

    ctx.fillText(asset.name, x, y + size/3);  );

  };

  // 🎨 HUD Minimalista y Profesional

  const render3DAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number, isSelected: boolean) => {  const renderARInterface = useCallback(

    // Simulación de objeto 3D con perspectiva    (ctx: CanvasRenderingContext2D, width: number, height: number) => {

    const cubeSize = size * 0.8;      // Solo mostrar cruz central sutil

    const depth = cubeSize * 0.3;      const centerX = width / 2;

          const centerY = height / 2;

    // Cara frontal

    ctx.fillStyle = isSelected ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.7)';      ctx.save();

    ctx.fillRect(x - cubeSize/2, y - cubeSize/2, cubeSize, cubeSize);      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";

          ctx.lineWidth = 1;

    // Cara superior (perspectiva)      ctx.setLineDash([5, 5]);

    ctx.fillStyle = isSelected ? 'rgba(160, 82, 45, 0.9)' : 'rgba(160, 82, 45, 0.7)';

    ctx.beginPath();      ctx.beginPath();

    ctx.moveTo(x - cubeSize/2, y - cubeSize/2);      ctx.moveTo(centerX - 15, centerY);

    ctx.lineTo(x - cubeSize/2 + depth, y - cubeSize/2 - depth);      ctx.lineTo(centerX + 15, centerY);

    ctx.lineTo(x + cubeSize/2 + depth, y - cubeSize/2 - depth);      ctx.moveTo(centerX, centerY - 15);

    ctx.lineTo(x + cubeSize/2, y - cubeSize/2);      ctx.lineTo(centerX, centerY + 15);

    ctx.closePath();      ctx.stroke();

    ctx.fill();

          ctx.restore();

    // Cara lateral

    ctx.fillStyle = isSelected ? 'rgba(101, 67, 33, 0.9)' : 'rgba(101, 67, 33, 0.7)';      // Indicadores de esquina para AR tracking

    ctx.beginPath();      const cornerSize = 20;

    ctx.moveTo(x + cubeSize/2, y - cubeSize/2);      const margin = 15;

    ctx.lineTo(x + cubeSize/2 + depth, y - cubeSize/2 - depth);

    ctx.lineTo(x + cubeSize/2 + depth, y + cubeSize/2 - depth);      ctx.save();

    ctx.lineTo(x + cubeSize/2, y + cubeSize/2);      ctx.strokeStyle = "rgba(0, 200, 255, 0.4)";

    ctx.closePath();      ctx.lineWidth = 2;

    ctx.fill();

          // Esquinas del frame AR

    // Contornos      const corners = [

    ctx.strokeStyle = isSelected ? '#8b5cf6' : '#6b7280';        [margin, margin], // top-left

    ctx.lineWidth = isSelected ? 3 : 2;        [width - margin, margin], // top-right

    ctx.strokeRect(x - cubeSize/2, y - cubeSize/2, cubeSize, cubeSize);        [margin, height - margin], // bottom-left

            [width - margin, height - margin], // bottom-right

    // Etiqueta      ];

    ctx.fillStyle = 'white';

    ctx.font = `${size/8}px 'Segoe UI', Arial, sans-serif`;      corners.forEach(([x, y], index) => {

    ctx.textAlign = 'center';        ctx.beginPath();

    ctx.fillText('📦 ' + asset.name, x, y + size/2);        if (index === 0) {

  };          // top-left

          ctx.moveTo(x, y + cornerSize);

  const renderWebAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number, isSelected: boolean) => {          ctx.lineTo(x, y);

    // Panel web con efecto browser          ctx.lineTo(x + cornerSize, y);

    ctx.fillStyle = isSelected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.1)';        } else if (index === 1) {

    ctx.fillRect(x - size/2, y - size/2, size, size);          // top-right

              ctx.moveTo(x - cornerSize, y);

    // Barra de navegador          ctx.lineTo(x, y);

    ctx.fillStyle = isSelected ? '#059669' : '#10b981';          ctx.lineTo(x, y + cornerSize);

    ctx.fillRect(x - size/2, y - size/2, size, size/6);        } else if (index === 2) {

              // bottom-left

    ctx.strokeStyle = isSelected ? '#047857' : '#059669';          ctx.moveTo(x, y - cornerSize);

    ctx.lineWidth = isSelected ? 3 : 2;          ctx.lineTo(x, y);

    ctx.strokeRect(x - size/2, y - size/2, size, size);          ctx.lineTo(x + cornerSize, y);

            } else {

    // Ícono web          // bottom-right

    ctx.fillStyle = 'white';          ctx.moveTo(x - cornerSize, y);

    ctx.font = `${size/4}px Arial`;          ctx.lineTo(x, y);

    ctx.textAlign = 'center';          ctx.lineTo(x, y - cornerSize);

    ctx.fillText('🌐', x, y);        }

            ctx.stroke();

    // URL simulada      });

    ctx.font = `${size/10}px monospace`;

    ctx.fillStyle = 'white';      ctx.restore();

    ctx.fillText('web content', x, y - size/3);    },

        []

    // Etiqueta  );

    ctx.font = `${size/8}px 'Segoe UI', Arial, sans-serif`;

    ctx.fillText(asset.name, x, y + size/3);  // 🎨 Funciones de Renderizado AR Profesionales

  };  const renderMessageAsset = useCallback(

    (ctx: CanvasRenderingContext2D, asset: Asset) => {

  const renderDefaultAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number, isSelected: boolean) => {      const text = asset.assetContent || asset.name || "Mensaje AR";

    // Asset genérico      const maxWidth = 300;

    ctx.fillStyle = isSelected ? 'rgba(107, 114, 128, 0.9)' : 'rgba(107, 114, 128, 0.7)';      const padding = 20;

    ctx.fillRect(x - size/2, y - size/2, size, size);

          ctx.save();

    ctx.strokeStyle = isSelected ? '#4b5563' : '#6b7280';

    ctx.lineWidth = isSelected ? 3 : 2;      // Fondo con gradiente suave y moderno

    ctx.strokeRect(x - size/2, y - size/2, size, size);      const gradient = ctx.createLinearGradient(

            -maxWidth / 2,

    ctx.fillStyle = 'white';        -50,

    ctx.font = `${size/6}px 'Segoe UI', Arial, sans-serif`;        maxWidth / 2,

    ctx.textAlign = 'center';        50

    ctx.fillText(asset.name, x, y);      );

          gradient.addColorStop(0, "rgba(59, 130, 246, 0.95)"); // Blue-500

    // Ícono genérico      gradient.addColorStop(1, "rgba(147, 51, 234, 0.95)"); // Purple-600

    ctx.font = `${size/4}px Arial`;

    ctx.fillText('📄', x, y - size/4);      // Sombra sutil

  };      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";

      ctx.shadowOffsetY = 8;

  // 🌊 Simular detección de superficies (fallback)      ctx.shadowBlur = 24;

  const simulateSurfaceDetection = useCallback(() => {

    // Simular superficies horizontales detectadas      ctx.fillStyle = gradient;

    const mockSurfaces: ARSurface[] = [      ctx.roundRect(-maxWidth / 2, -50, maxWidth, 100, 16);

      {      ctx.fill();

        id: 'floor',

        type: 'horizontal',      // Reset sombra

        center: { x: 0, y: -1.5, z: 0 },      ctx.shadowColor = "transparent";

        size: { width: 10, height: 10 },

        confidence: 0.8      // Border elegante

      },      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";

      {      ctx.lineWidth = 2;

        id: 'table',      ctx.roundRect(-maxWidth / 2, -50, maxWidth, 100, 16);

        type: 'horizontal',       ctx.stroke();

        center: { x: 0.5, y: 0, z: -1 },

        size: { width: 2, height: 1.5 },      // Texto con tipografía moderna

        confidence: 0.6      ctx.fillStyle = "white";

      }      ctx.font = "bold 20px system-ui, -apple-system, sans-serif";

    ];      ctx.textAlign = "center";

      ctx.textBaseline = "middle";

    setArState(prev => ({

      ...prev,      // Texto con mejor renderizado

      tracking: {      const lines = wrapText(ctx, text, maxWidth - padding * 2);

        ...prev.tracking,      const lineHeight = 24;

        surfaces: mockSurfaces      const startY = (-(lines.length - 1) * lineHeight) / 2;

      }

    }));      lines.forEach((line, index) => {

  }, []);        ctx.fillText(line, 0, startY + index * lineHeight);

      });

  // 🎯 Interacción táctil con objetos AR

  const handleCanvasTouch = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {      ctx.restore();

    event.preventDefault();    },

        []

    if (event.touches.length === 1) {  );

      const touch = event.touches[0];

      const rect = canvasRef.current?.getBoundingClientRect();  const renderImageAsset = useCallback(

      if (!rect) return;    (ctx: CanvasRenderingContext2D, asset: Asset) => {

      const img = assetLoader.loaded.get(asset.id);

      const x = (touch.clientX - rect.left) / rect.width;      const size = 150;

      const y = (touch.clientY - rect.top) / rect.height;

      ctx.save();

      // Buscar objeto AR en esas coordenadas

      const hitObject = arState.objects.find(obj => {      if (img && img instanceof HTMLImageElement) {

        const objScreenX = (obj.position.x + 1) * 0.5;        // Calcular aspect ratio

        const objScreenY = (1 - obj.position.y) * 0.5;        const aspectRatio = img.width / img.height;

        const distance = Math.sqrt(        let drawWidth = size;

          Math.pow(x - objScreenX, 2) + Math.pow(y - objScreenY, 2)        let drawHeight = size;

        );

        return distance < 0.1; // Radio de detección        if (aspectRatio > 1) {

      });          drawHeight = size / aspectRatio;

        } else {

      if (hitObject) {          drawWidth = size * aspectRatio;

        setArState(prev => ({        }

          ...prev,

          selectedObjectId: prev.selectedObjectId === hitObject.id ? null : hitObject.id        // Sombra moderna

        }));        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";

        console.log("🎯 Objeto seleccionado:", hitObject.asset.name);        ctx.shadowOffsetY = 12;

      }        ctx.shadowBlur = 24;

    }

  }, [arState.objects]);        // Dibujar imagen con bordes redondeados

        ctx.beginPath();

  // 🛑 Detener experiencia AR        ctx.roundRect(

  const stopARExperience = useCallback(() => {          -drawWidth / 2,

    console.log("🛑 Deteniendo experiencia AR...");          -drawHeight / 2,

              drawWidth,

    // Detener WebXR          drawHeight,

    if (xrSessionRef.current) {          12

      xrSessionRef.current.end();        );

      xrSessionRef.current = null;        ctx.clip();

    }        ctx.drawImage(

              img,

    // Detener cámara          -drawWidth / 2,

    if (mediaStreamRef.current) {          -drawHeight / 2,

      mediaStreamRef.current.getTracks().forEach(track => track.stop());          drawWidth,

      mediaStreamRef.current = null;          drawHeight

    }        );

          } else {

    // Detener animación        // Placeholder elegante

    if (animationFrameRef.current) {        ctx.fillStyle = "rgba(107, 114, 128, 0.8)"; // Gray-500

      cancelAnimationFrame(animationFrameRef.current);        ctx.roundRect(-size / 2, -size / 2, size, size, 12);

      animationFrameRef.current = undefined;        ctx.fill();

    }

            ctx.fillStyle = "white";

    setArState(prev => ({        ctx.font = "14px system-ui";

      ...prev,        ctx.textAlign = "center";

      session: {        ctx.textBaseline = "middle";

        ...prev.session,        ctx.fillText("🖼️ Cargando...", 0, 0);

        isActive: false      }

      }

    }));      ctx.restore();

        },

    console.log("✅ Experiencia AR detenida");    [assetLoader]

  }, []);  );



  // 🏠 Volver al inicio  const renderVideoAsset = useCallback(

  const handleBack = useCallback(() => {    (ctx: CanvasRenderingContext2D, asset: Asset) => {

    stopARExperience();      const size = 150;

    router.push('/experiences');

  }, [stopARExperience, router]);      ctx.save();



  // 🎬 Effects      // Fondo de video elegante

  useEffect(() => {      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);

    loadARExperience();      gradient.addColorStop(0, "rgba(17, 24, 39, 0.95)"); // Gray-900

  }, [loadARExperience]);      gradient.addColorStop(1, "rgba(55, 65, 81, 0.95)"); // Gray-700



  // Cleanup al desmontar      ctx.fillStyle = gradient;

  useEffect(() => {      ctx.roundRect(-size / 2, -size / 2, size, size, 16);

    return () => {      ctx.fill();

      stopARExperience();

    };      // Botón play moderno

  }, [stopARExperience]);      ctx.fillStyle = "rgba(239, 68, 68, 0.9)"; // Red-500

      ctx.beginPath();

  // 🎨 RENDERIZADO DE ESTADOS      ctx.arc(0, 0, 30, 0, Math.PI * 2);

      ctx.fill();

  // Cargando

  if (arState.isLoading) {      // Icono play

    return (      ctx.fillStyle = "white";

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">      ctx.beginPath();

        <div className="text-center text-white">      ctx.moveTo(-8, -12);

          <div className="relative w-24 h-24 mx-auto mb-8">      ctx.lineTo(-8, 12);

            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>      ctx.lineTo(12, 0);

            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>      ctx.closePath();

            <div className="absolute inset-2 border-2 border-purple-400/50 border-b-transparent rounded-full animate-spin"></div>      ctx.fill();

            <div className="absolute inset-4 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>

          </div>      // Label

          <h2 className="text-2xl font-bold mb-4">🌟 Preparando AR</h2>      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

          <p className="text-blue-200">Cargando experiencia de realidad aumentada...</p>      ctx.font = "bold 12px system-ui";

        </div>      ctx.textAlign = "center";

      </div>      ctx.fillText("VIDEO", 0, size / 2 - 15);

    );

  }      ctx.restore();

    },

  // Error    []

  if (arState.error) {  );

    return (

      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center">  const render3DAsset = useCallback(

        <div className="text-center text-white max-w-md mx-4">    (ctx: CanvasRenderingContext2D, asset: Asset) => {

          <div className="text-8xl mb-8 animate-pulse">⚠️</div>      const size = 150;

          <h2 className="text-2xl font-bold mb-4">Error AR</h2>

          <p className="text-red-200 mb-8 leading-relaxed">{arState.error}</p>      ctx.save();

          <div className="space-y-4">

            <button      // Fondo 3D futurista

              onClick={() => window.location.reload()}      const gradient = ctx.createLinearGradient(

              className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"        -size / 2,

            >        -size / 2,

              🔄 Reintentar        size / 2,

            </button>        size / 2

            <button      );

              onClick={handleBack}      gradient.addColorStop(0, "rgba(99, 102, 241, 0.9)"); // Indigo-500

              className="w-full bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200"      gradient.addColorStop(1, "rgba(139, 92, 246, 0.9)"); // Violet-500

            >

              ← Volver      ctx.fillStyle = gradient;

            </button>      ctx.roundRect(-size / 2, -size / 2, size, size, 16);

          </div>      ctx.fill();

        </div>

      </div>      // Cubo 3D isométrico moderno

    );      const cubeSize = 40;

  }      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";

  // Sin experiencia      ctx.lineWidth = 2;

  if (!experience) {

    return (      // Cara frontal

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">      ctx.fillRect(-cubeSize / 2, -cubeSize / 2, cubeSize, cubeSize);

        <div className="text-center text-white">      ctx.strokeRect(-cubeSize / 2, -cubeSize / 2, cubeSize, cubeSize);

          <div className="text-8xl mb-8">🤔</div>

          <h2 className="text-2xl font-bold">Experiencia no encontrada</h2>      // Cara superior (isométrica)

        </div>      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";

      </div>      ctx.beginPath();

    );      ctx.moveTo(-cubeSize / 2, -cubeSize / 2);

  }      ctx.lineTo(-cubeSize / 4, -cubeSize * 0.75);

      ctx.lineTo(cubeSize * 0.75, -cubeSize * 0.75);

  // 🎬 EXPERIENCIA AR ACTIVA      ctx.lineTo(cubeSize / 2, -cubeSize / 2);

  if (arState.session.isActive) {      ctx.closePath();

    return (      ctx.fill();

      <div className="relative w-full h-screen bg-black overflow-hidden">      ctx.stroke();

        {/* 📹 Video de cámara */}

        <video      // Cara lateral

          ref={videoRef}      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

          className="absolute inset-0 w-full h-full object-cover"      ctx.beginPath();

          playsInline      ctx.moveTo(cubeSize / 2, -cubeSize / 2);

          muted      ctx.lineTo(cubeSize * 0.75, -cubeSize * 0.75);

          autoPlay      ctx.lineTo(cubeSize * 0.75, cubeSize * 0.25);

        />      ctx.lineTo(cubeSize / 2, cubeSize / 2);

      ctx.closePath();

        {/* 🎨 Canvas para overlay AR */}      ctx.fill();

        <canvas      ctx.stroke();

          ref={canvasRef}

          className="absolute inset-0 w-full h-full z-10 touch-none"      // Label

          onTouchStart={handleCanvasTouch}      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

        />      ctx.font = "bold 12px system-ui";

      ctx.textAlign = "center";

        {/* 🎮 HUD AR */}      ctx.fillText("MODELO 3D", 0, size / 2 - 15);

        <div className="absolute inset-0 pointer-events-none z-20">

          {/* Barra superior */}      ctx.restore();

          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">    },

            <div className="flex items-center justify-between">    []

              <button  );

                onClick={stopARExperience}

                className="flex items-center space-x-3 bg-black/80 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:bg-black/90 hover:scale-105"  const renderWebContentAsset = useCallback(

              >    (ctx: CanvasRenderingContext2D, asset: Asset) => {

                <span>←</span>      const size = 150;

                <span>Salir AR</span>

              </button>      ctx.save();



              <div className="flex items-center space-x-4">      // Fondo web moderno

                {/* Modo AR */}      const gradient = ctx.createLinearGradient(

                <div className="bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/50 px-4 py-2 rounded-full">        -size / 2,

                  <div className="flex items-center space-x-2">        -size / 2,

                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>        size / 2,

                    <span className="text-emerald-300 font-semibold uppercase tracking-wider">        size / 2

                      {arState.session.mode} AR      );

                    </span>      gradient.addColorStop(0, "rgba(16, 185, 129, 0.9)"); // Emerald-500

                  </div>      gradient.addColorStop(1, "rgba(6, 182, 212, 0.9)"); // Cyan-500

                </div>

      ctx.fillStyle = gradient;

                {/* FPS counter */}      ctx.roundRect(-size / 2, -size / 2, size, size, 16);

                <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/50 px-4 py-2 rounded-full">      ctx.fill();

                  <span className="text-blue-300 font-mono text-sm">

                    {arState.session.frameRate} FPS      // Ventana de navegador

                  </span>      const browserWidth = size * 0.7;

                </div>      const browserHeight = size * 0.5;

              </div>

            </div>      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";

          </div>      ctx.roundRect(

        -browserWidth / 2,

          {/* Instrucciones centrales */}        -browserHeight / 2,

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">        browserWidth,

            {arState.selectedObjectId ? (        browserHeight,

              <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-400/50 px-8 py-4 rounded-2xl text-center animate-pulse">        8

                <div className="text-emerald-300 text-lg font-semibold mb-2">      );

                  🎯 Objeto Seleccionado      ctx.fill();

                </div>

                <div className="text-white text-sm">      // Barra de navegador

                  {arState.objects.find(obj => obj.id === arState.selectedObjectId)?.asset.name}      ctx.fillStyle = "rgba(107, 114, 128, 0.1)";

                </div>      ctx.roundRect(

              </div>        -browserWidth / 2,

            ) : (        -browserHeight / 2,

              <div className="bg-black/40 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl text-center text-white">        browserWidth,

                <div className="text-lg font-semibold mb-2">        browserHeight * 0.25,

                  👆 Toca para Interactuar        8

                </div>      );

                <div className="text-sm text-white/70">      ctx.fill();

                  Mueve el dispositivo para ver objetos AR

                </div>      // Puntos del navegador

              </div>      [

            )}        -browserWidth * 0.35,

          </div>        -browserWidth * 0.25,

        -browserWidth * 0.15,

          {/* Panel de objetos */}      ].forEach((x, index) => {

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent pointer-events-auto">        const colors = [

            <div className="flex flex-col space-y-4">          "rgba(239, 68, 68, 0.8)",

                        "rgba(245, 158, 11, 0.8)",

              {/* Lista de objetos */}          "rgba(34, 197, 94, 0.8)",

              <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-4">        ];

                <div className="text-white font-semibold mb-3 text-center">        ctx.fillStyle = colors[index];

                  🎯 Objetos AR ({arState.objects.length})        ctx.beginPath();

                </div>        ctx.arc(x, -browserHeight * 0.3, 4, 0, Math.PI * 2);

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">        ctx.fill();

                  {arState.objects.map((obj) => (      });

                    <button

                      key={obj.id}      // Líneas de contenido

                      onClick={() => setArState(prev => ({      for (let i = 0; i < 3; i++) {

                        ...prev,        ctx.fillStyle = `rgba(107, 114, 128, ${0.3 + i * 0.1})`;

                        selectedObjectId: prev.selectedObjectId === obj.id ? null : obj.id        const lineWidth = browserWidth * (0.6 - i * 0.1);

                      }))}        ctx.fillRect(

                      className={`p-3 rounded-xl text-center transition-all duration-200 ${          -lineWidth / 2,

                        obj.id === arState.selectedObjectId          -browserHeight * 0.1 + i * 8,

                          ? 'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-300'          lineWidth,

                          : 'bg-white/10 border border-white/20 text-white/80 hover:bg-white/20'          3

                      }`}        );

                    >      }

                      <div className="text-2xl mb-1">

                        {obj.asset.assetType === 'message' && '💬'}      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

                        {obj.asset.assetType === 'image' && '🖼️'}      ctx.font = "bold 10px system-ui";

                        {obj.asset.assetType === 'video' && '🎥'}      ctx.textAlign = "center";

                        {obj.asset.assetType === 'model3d' && '📦'}      ctx.fillText("WEB CONTENT", 0, size / 2 - 12);

                        {obj.asset.assetType === 'webcontent' && '🌐'}

                      </div>      ctx.restore();

                      <div className="text-xs font-medium truncate">    },

                        {obj.asset.name}    []

                      </div>  );

                      <div className={`text-xs mt-1 ${obj.isTracked ? 'text-green-400' : 'text-red-400'}`}>

                        {obj.isTracked ? '📍 Tracked' : '❌ Lost'}  // Feedback visual para interacciones

                      </div>  const renderInteractionFeedback = useCallback(

                    </button>    (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {

                  ))}      ctx.save();

                </div>      ctx.translate(x, y);

              </div>

      // Anillo de interacción pulsante

              {/* Controles rápidos */}      const time = Date.now() * 0.003;

              <div className="flex justify-center space-x-4">      const radius = 60 * scale + Math.sin(time * 2) * 10;

                <button

                  onClick={() => {      ctx.strokeStyle = `rgba(34, 197, 94, ${0.6 + Math.sin(time * 3) * 0.3})`;

                    // Reset posiciones      ctx.lineWidth = 3;

                    setArState(prev => ({      ctx.setLineDash([10, 5]);

                      ...prev,      ctx.beginPath();

                      objects: prev.objects.map(obj => ({      ctx.arc(0, 0, radius, 0, Math.PI * 2);

                        ...obj,      ctx.stroke();

                        position: { x: 0, y: 0, z: -2 },

                        scale: 1.0      ctx.restore();

                      }))    },

                    }));    []

                  }}  );

                  className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/50 px-6 py-3 rounded-full text-blue-300 font-semibold hover:bg-blue-500/30 transition-all duration-200"

                >  // Helper para texto envuelto

                  🎯 Reset Posiciones  const wrapText = (

                </button>    ctx: CanvasRenderingContext2D,

              </div>    text: string,

            </div>    maxWidth: number

          </div>  ): string[] => {

        </div>    const words = text.split(" ");

      </div>    const lines: string[] = [];

    );    let currentLine = "";

  }

    for (const word of words) {

  // 📱 Pantalla de inicio AR      const testLine = currentLine + (currentLine ? " " : "") + word;

  return (      const metrics = ctx.measureText(testLine);

    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">

      {/* Header */}      if (metrics.width > maxWidth && currentLine) {

      <div className="flex items-center justify-between p-6">        lines.push(currentLine);

        <button        currentLine = word;

          onClick={handleBack}      } else {

          className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all duration-200"        currentLine = testLine;

        >      }

          <span>←</span>    }

          <span>Volver</span>

        </button>    if (currentLine) lines.push(currentLine);

      </div>    return lines;

  };

      {/* Contenido principal */}

      <div className="flex-1 flex items-center justify-center p-6">  const drawImageAsset = (

        <div className="text-center text-white max-w-lg">    ctx: CanvasRenderingContext2D,

          {/* Info de experiencia */}    asset: Asset,

          <div className="mb-12">    x: number,

            <div className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">    y: number,

              {experience.title}    size: number

            </div>  ) => {

            {experience.description && (    // Create image element if not exists

              <p className="text-blue-200 leading-relaxed text-lg mb-6">    const imageKey = `image_${asset.id}`;

                {experience.description}    if (!(window as any)[imageKey] && asset.assetUrl) {

              </p>      const img = new Image();

            )}      img.crossOrigin = "anonymous";

          </div>      img.onload = () => {

        (window as any)[imageKey] = img;

          {/* Panel de información AR */}      };

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-12">      img.onerror = () => {

            <div className="text-3xl mb-6">🌟 Realidad Aumentada</div>        console.error("Failed to load image:", asset.assetUrl);

            <div className="text-xl font-semibold mb-4">        (window as any)[imageKey] = null;

              {experience.assets.length} contenido{experience.assets.length !== 1 ? 's' : ''} AR      };

            </div>      img.src = asset.assetUrl;

            <div className="text-blue-200 mb-6">    }

              Tipos: {[...new Set(experience.assets.map(a => a.assetType))].join(', ')}

            </div>    const img = (window as any)[imageKey];

                if (img && img.complete) {

            {/* Lista de assets */}      // Draw the image

            <div className="grid grid-cols-2 gap-3 mb-6">      const aspectRatio = img.width / img.height;

              {experience.assets.slice(0, 4).map((asset, index) => (      let drawWidth = size;

                <div key={index} className="bg-white/5 rounded-lg p-3 text-sm">      let drawHeight = size;

                  <div className="text-lg mb-1">

                    {asset.assetType === 'message' && '💬'}      if (aspectRatio > 1) {

                    {asset.assetType === 'image' && '🖼️'}        drawHeight = size / aspectRatio;

                    {asset.assetType === 'video' && '🎥'}      } else {

                    {asset.assetType === 'model3d' && '📦'}        drawWidth = size * aspectRatio;

                    {asset.assetType === 'webcontent' && '🌐'}      }

                  </div>

                  <div className="truncate">{asset.name}</div>      ctx.drawImage(

                </div>        img,

              ))}        x - drawWidth / 2,

              {experience.assets.length > 4 && (        y - drawHeight / 2,

                <div className="bg-white/5 rounded-lg p-3 text-sm flex items-center justify-center">        drawWidth,

                  +{experience.assets.length - 4} más        drawHeight

                </div>      );

              )}

            </div>      // Add border

          </div>      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";

      ctx.lineWidth = 3;

          {/* Estado de permisos */}      ctx.strokeRect(

          <div className={`mb-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 ${        x - drawWidth / 2,

            arState.permissions.camera === 'granted' ? 'border-green-400/50' :         y - drawHeight / 2,

            arState.permissions.camera === 'denied' ? 'border-red-400/50' : 'border-yellow-400/50'        drawWidth,

          }`}>        drawHeight

            <div className="flex items-center justify-center space-x-3">      );

              <span className="text-2xl">    } else {

                {arState.permissions.camera === 'granted' ? '✅' :       // Loading placeholder

                 arState.permissions.camera === 'denied' ? '❌' : '⏳'}      ctx.fillStyle = "rgba(100, 100, 100, 0.8)";

              </span>      ctx.fillRect(x - size / 2, y - size / 2, size, size);

              <div>

                <div className="font-semibold">      ctx.fillStyle = "white";

                  {arState.permissions.camera === 'granted' ? 'Cámara Lista' :       ctx.font = "16px Arial";

                   arState.permissions.camera === 'denied' ? 'Cámara Denegada' : 'Cámara Pendiente'}      ctx.textAlign = "center";

                </div>      ctx.textBaseline = "middle";

                <div className="text-sm text-white/70">      ctx.fillText("Cargando imagen...", x, y);

                  {window.isSecureContext ? 'Contexto seguro ✓' : 'Requiere HTTPS ⚠️'}    }

                </div>  };

              </div>

            </div>  const drawVideoAsset = (

          </div>    ctx: CanvasRenderingContext2D,

    asset: Asset,

          {/* Botón principal */}    x: number,

          <button    y: number,

            onClick={startARExperience}    size: number

            disabled={!window.isSecureContext}  ) => {

            className={`w-full p-6 rounded-2xl text-white font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl mb-6 ${    // Video placeholder with play button

              !window.isSecureContext    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";

                ? "bg-gray-600 cursor-not-allowed opacity-60"    ctx.fillRect(x - size / 2, y - size / 2, size, size);

                : "bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 shadow-blue-500/25"

            }`}    // Border

          >    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";

            {!window.isSecureContext ? "❌ Requiere HTTPS" : "🚀 INICIAR EXPERIENCIA AR"}    ctx.lineWidth = 3;

          </button>    ctx.strokeRect(x - size / 2, y - size / 2, size, size);



          {/* Instrucciones */}    // Play button

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

            <div className="font-semibold mb-4 text-center">📋 Instrucciones</div>    ctx.beginPath();

            <div className="space-y-2 text-sm text-white/80">    ctx.moveTo(x - size / 6, y - size / 4);

              <div>• Permite acceso a la cámara cuando se solicite</div>    ctx.lineTo(x - size / 6, y + size / 4);

              <div>• Apunta la cámara hacia superficies planas</div>    ctx.lineTo(x + size / 4, y);

              <div>• Los objetos AR aparecerán superpuestos en la realidad</div>    ctx.closePath();

              <div>• Toca los objetos para interactuar con ellos</div>    ctx.fill();

              <div>• Mueve el dispositivo para explorar desde diferentes ángulos</div>

            </div>    // Label

          </div>    ctx.fillStyle = "white";

        </div>    ctx.font = "14px Arial";

      </div>    ctx.textAlign = "center";

    </div>    ctx.fillText("VIDEO", x, y + size / 2 - 10);

  );  };

}
  const drawModel3DAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    // 3D model placeholder with cube icon
    ctx.fillStyle = "rgba(50, 50, 150, 0.8)";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);

    // 3D cube icon
    const cubeSize = size / 3;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    // Front face
    ctx.strokeRect(x - cubeSize / 2, y - cubeSize / 2, cubeSize, cubeSize);

    // Back face (offset)
    const offset = cubeSize / 4;
    ctx.strokeRect(
      x - cubeSize / 2 + offset,
      y - cubeSize / 2 - offset,
      cubeSize,
      cubeSize
    );

    // Connecting lines
    ctx.beginPath();
    ctx.moveTo(x - cubeSize / 2, y - cubeSize / 2);
    ctx.lineTo(x - cubeSize / 2 + offset, y - cubeSize / 2 - offset);
    ctx.moveTo(x + cubeSize / 2, y - cubeSize / 2);
    ctx.lineTo(x + cubeSize / 2 + offset, y - cubeSize / 2 - offset);
    ctx.moveTo(x + cubeSize / 2, y + cubeSize / 2);
    ctx.lineTo(x + cubeSize / 2 + offset, y + cubeSize / 2 - offset);
    ctx.stroke();

    // Label
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MODELO 3D", x, y + size / 2 - 8);
  };

  const drawWebContentAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    // Web content placeholder with browser icon
    ctx.fillStyle = "rgba(100, 150, 200, 0.8)";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);

    // Browser icon (simplified)
    ctx.fillStyle = "white";
    ctx.fillRect(x - size / 3, y - size / 3, size / 1.5, size / 4);

    // Address bar
    ctx.strokeStyle = "rgba(200, 200, 200, 1)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - size / 4, y - size / 5, size / 2, size / 8);

    // Label
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("WEB CONTENT", x, y + size / 2 - 8);
  };

  // Funciones auxiliares para navegación
  const nextAsset = useCallback(() => {
    if (experience && experience.assets.length > 1) {
      setCurrentAssetIndex(prev => (prev + 1) % experience.assets.length);
    }
  }, [experience]);

  const prevAsset = useCallback(() => {
    if (experience && experience.assets.length > 1) {
      setCurrentAssetIndex(prev => 
        (prev - 1 + experience.assets.length) % experience.assets.length
      );
    }
  }, [experience]);

  // 🛑 Funciones de Control AR
  const stopAR = useCallback(() => {
    console.log("🛑 Deteniendo AR...");
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    setArState(prev => ({ ...prev, isActive: false }));
  }, [mediaStream]);

  const handleBack = useCallback(() => {
    stopAR();
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/experiences");
    }
  }, [stopAR, router]);

  // 🔄 Estado de Carga Profesional
  if (arState.loadingState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          {/* Spinner futurista */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-purple-400/50 border-b-transparent rounded-full animate-spin animate-reverse"></div>
          </div>

          {/* Texto con progreso */}
          <div className="space-y-3">
            <h2 className="text-white text-xl font-semibold">
              Preparando Experiencia AR
            </h2>
            <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto overflow-hidden">
              <div
                className={`bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out ${
                  arState.progress > 0 ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  transform: `scaleX(${arState.progress / 100})`,
                  transformOrigin: 'left center'
                }}
              />
            </div>
            <p className="text-blue-200 text-sm">
              {arState.progress}% completado
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🔐 Estado de Permisos
  if (arState.loadingState === "permissions") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6 animate-pulse">📹</div>
          <h2 className="text-2xl font-semibold mb-4">Acceso a Cámara</h2>
          <p className="text-blue-200 mb-6">
            Permitiendo acceso a la cámara para la experiencia AR...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (arState.hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-2xl font-semibold mb-4">Error</div>
          <div className="text-blue-200 mb-8">{arState.errorMessage}</div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              🔄 Intentar de nuevo
            </button>

            <button
              onClick={handleBack}
              className="w-full glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No experience
  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">🤔</div>
          <div className="text-xl font-semibold">
            No se pudo cargar la experiencia
          </div>
        </div>
      </div>
    );
  }

  // 🎬 EXPERIENCIA AR ACTIVA - PROFESIONAL Y MINIMALISTA
  if (arState.isActive) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* 📹 Feed de Cámara */}
        {mediaStream && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
        )}

        {/* 🎨 Canvas AR Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-20 touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* ✨ HUD MINIMALISTA Y PROFESIONAL */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 🔝 Barra Superior Minimalista */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/40 to-transparent pointer-events-auto z-50">
            <div className="flex items-center justify-between">
              {/* Botón Salir Elegante */}
              <button
                onClick={stopAR}
                className="group flex items-center space-x-2 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white font-medium transition-all duration-300 hover:bg-black/80 hover:scale-105"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Salir</span>
              </button>

              {/* Indicador de Estado AR */}
              <div className="flex items-center space-x-2">
                {/* Modo AR */}
                <div className="bg-black/60 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-300 text-sm font-medium uppercase tracking-wider">
                      {arState.mode} AR
                    </span>
                  </div>
                </div>

                {/* Asset Actual */}
                {experience && (
                  <div className="bg-black/60 backdrop-blur-md border border-blue-500/30 px-3 py-1.5 rounded-full">
                    <span className="text-blue-300 text-sm font-medium">
                      {currentAssetIndex + 1}/{experience.assets.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🎯 Instrucciones Contextuales Minimalistas */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
            {!arInteraction.isDragging && !arInteraction.isScaling && (
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl text-center text-white animate-fade-in">
                <div className="text-sm text-white/80 mb-1">
                  {arState.mode === "marker"
                    ? "📱 Apunta al marcador"
                    : "✋ Toca para interactuar"}
                </div>
                <div className="text-xs text-white/60">
                  {deviceCapabilities.isMobile
                    ? "Pellizca para escalar"
                    : "Rueda para escalar"}
                </div>
              </div>
            )}

            {(arInteraction.isDragging || arInteraction.isScaling) && (
              <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-400/50 px-4 py-2 rounded-xl text-center animate-pulse">
                <div className="text-cyan-300 text-sm font-medium">
                  {arInteraction.isDragging ? "📍 Moviendo" : "🔍 Escalando"}
                </div>
              </div>
            )}
          </div>

          {/* 🔻 Controles Inferiores Elegantes */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent pointer-events-auto z-50">
            <div className="flex flex-col space-y-3">
              
              {/* Navegación de Assets (si hay múltiples) */}
              {experience && experience.assets.length > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                    <button
                      onClick={prevAsset}
                      title="Asset anterior"
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="flex space-x-1">
                      {experience.assets.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentAssetIndex(index)}
                          title={`Ver asset ${index + 1}`}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentAssetIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextAsset}
                      title="Asset siguiente"
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Controles Rápidos Minimalistas */}
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setArInteraction(prev => ({ ...prev, position: { x: 0.5, y: 0.5 }, scale: 1.0 }))}
                  className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-full text-white text-sm font-medium hover:bg-black/80 transition-all duration-200"
                >
                  🎯 Centrar
                </button>
                
                <button
                  onClick={() => setArInteraction(prev => ({ ...prev, scale: Math.max(0.3, prev.scale * 0.8) }))}
                  className="bg-black/60 backdrop-blur-md border border-white/10 w-10 h-10 rounded-full text-white font-bold hover:bg-black/80 transition-all duration-200"
                >
                  -
                </button>
                
                <button
                  onClick={() => setArInteraction(prev => ({ ...prev, scale: Math.min(3.0, prev.scale * 1.2) }))}
                  className="bg-black/60 backdrop-blur-md border border-white/10 w-10 h-10 rounded-full text-white font-bold hover:bg-black/80 transition-all duration-200"
                >
                  +
                </button>
              </div>

              {/* Información del Asset Actual */}
              {experience && (
                <div className="flex justify-center">
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                    <div className="text-center">
                      <div className="text-white text-sm font-medium">
                        {experience.assets[currentAssetIndex].name}
                      </div>
                      <div className="text-white/60 text-xs uppercase tracking-wider">
                        {experience.assets[currentAssetIndex].assetType}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Intro screen - Start AR
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={handleBack}
          className="glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          ← Volver
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="mb-8">
            <div className="text-3xl font-bold mb-4">{experience.title}</div>
            {experience.description && (
              <div className="text-blue-200/80 leading-relaxed mb-4">
                {experience.description}
              </div>
            )}
          </div>

          <div className="mb-8 glass p-6 rounded-lg backdrop-blur-sm">
            <div className="text-2xl mb-4">📱 AR Real</div>
            <div className="text-lg font-medium mb-2">
              {experience.assets.length} contenido
              {experience.assets.length !== 1 ? "s" : ""} disponible
              {experience.assets.length !== 1 ? "s" : ""}
            </div>
            <div className="text-sm text-blue-200/70">
              Tipos:{" "}
              {[...new Set(experience.assets.map((a) => a.assetType))].join(
                ", "
              )}
            </div>
          </div>

          {/* Camera support status */}
          {deviceCapabilities.hasCamera !== undefined && (
            <div
              className={`mb-6 glass p-4 rounded-lg backdrop-blur-sm ${
                deviceCapabilities.hasCamera
                  ? "bg-green-900/30"
                  : "bg-red-900/30"
              }`}
            >
              <div
                className={`flex items-center space-x-2 ${
                  deviceCapabilities.hasCamera
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                <span className="text-xl">
                  {deviceCapabilities.hasCamera ? "✅" : "❌"}
                </span>
                <span className="text-sm">
                  {deviceCapabilities.hasCamera
                    ? "Cámara disponible"
                    : window.isSecureContext
                    ? "Cámara no soportada"
                    : "Se requiere HTTPS"}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={startARCamera}
            disabled={!deviceCapabilities.supportsAR}
            className={`w-full p-4 rounded-lg text-white font-semibold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-3 ${
              !deviceCapabilities.supportsAR
                ? "bg-gray-600 cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 shadow-blue-500/25"
            }`}
          >
            {!deviceCapabilities.supportsAR
              ? "❌ AR No Disponible"
              : "🚀 INICIAR CÁMARA AR"}
          </button>

          <button
            onClick={startARPreview}
            className="w-full p-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow-violet-500/25"
          >
            � VISTA PREVIA AR
          </button>

          <div className="mt-6 glass p-4 rounded-lg backdrop-blur-sm">
            <div className="text-sm text-blue-200/70">
              <div className="font-medium mb-2">🔧 Instrucciones:</div>
              {!window.isSecureContext ? (
                <>
                  <div className="text-yellow-300 mb-2">
                    ⚠️ Para usar la cámara:
                  </div>
                  <div>• Usa HTTPS: https://localhost:3000</div>
                  <div>• O usa el task "start-frontend" (HTTPS)</div>
                  <div>• La cámara requiere contexto seguro</div>
                </>
              ) : (
                <>
                  <div>• Permite acceso a la cámara</div>
                  <div>• Apunta hacia superficies planas</div>
                  <div>• El contenido aparece superpuesto en la realidad</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
