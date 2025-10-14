/**/**

 * 🌟 QUICK AR - EXPERIENCIA DE REALIDAD AUMENTADA * ✨ QUICK AR - EXPERIENCIA AR PROFESIONAL ✨

 *  * Versión limpia y optimizada sin duplicaciones

 * Sistema completo de AR que permite: */

 * - Escaneo QR automático para activar experiencias

 * - Superposición de contenido 3D, imágenes, videos y texto en el mundo real"use client";

 * - Tracking en tiempo real con la cámara del dispositivo  

 * - Detección de superficies para anclaje natural de objetosimport { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";

 * - Interfaz intuitiva para interacción naturalimport { normalizeExperience } from "@/lib/helpers/experienceHelpers";

 */import { Asset, Experience } from "@/types";

import { useParams, useRouter } from "next/navigation";

"use client";import { useCallback, useEffect, useRef, useState } from "react";



import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";// 🎯 Tipos de Experiencia AR

import { normalizeExperience } from "@/lib/helpers/experienceHelpers";type ARMode = "viewer" | "marker";

import { Asset, Experience } from "@/types";type LoadingState = "loading" | "ready" | "error" | "permissions";

import { useParams, useRouter } from "next/navigation";

import { useCallback, useEffect, useRef, useState } from "react";interface ARExperienceState {

  mode: ARMode;

// 🎯 Tipos AR Core  isActive: boolean;

interface ARSession {  loadingState: LoadingState;

  isActive: boolean;  hasError: boolean;

  mode: 'immersive-ar' | 'inline' | 'fallback';  errorMessage: string;

  hasCamera: boolean;  progress: number; // 0-100 para carga progresiva

  hasWebXR: boolean;}

  frameRate: number;

}interface DeviceCapabilities {

  hasCamera: boolean;

interface ARObject {  hasWebXR: boolean;

  id: string;  isSecureContext: boolean;

  asset: Asset;  isMobile: boolean;

  position: { x: number; y: number; z: number };  supportsAR: boolean;

  rotation: { x: number; y: number; z: number };}

  scale: number;

  isVisible: boolean;interface ARInteractionState {

  isTracked: boolean;  position: { x: number; y: number };

}  scale: number;

  rotation: number;

interface ARTracking {  isDragging: boolean;

  surfaces: ARSurface[];  isScaling: boolean;

  anchors: ARAnchor[];  lastTouchDistance: number;

  hitTestResults: ARHitTestResult[];}

}

// 🎨 Sistema de Assets Preloader

interface ARSurface {interface AssetLoader {

  id: string;  loaded: Map<string, any>;

  type: 'horizontal' | 'vertical';  loading: Set<string>;

  center: { x: number; y: number; z: number };  failed: Set<string>;

  size: { width: number; height: number };}

  confidence: number;

}export default function ARExperience() {

  const params = useParams();

interface ARAnchor {  const router = useRouter();

  id: string;  const experienceId = params.id as string;

  position: { x: number; y: number; z: number };

  rotation: { x: number; y: number; z: number };  // 📱 Estados Principales

  tracked: boolean;  const [experience, setExperience] = useState<Experience | null>(null);

}  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);



interface ARHitTestResult {  // 🎯 Asset Loader para carga progresiva

  position: { x: number; y: number; z: number };  const [assetLoader] = useState<AssetLoader>({

  distance: number;    loaded: new Map(),

  surface: ARSurface | null;    loading: new Set(),

}    failed: new Set(),

  });

// 📱 Estado del sistema AR

interface ARSystemState {  // 🚀 Estado AR Mejorado

  session: ARSession;  const [arState, setArState] = useState<ARExperienceState>({

  tracking: ARTracking;    mode: "viewer", // Detección automática más adelante

  objects: ARObject[];    isActive: false,

  selectedObjectId: string | null;    loadingState: "loading",

  isLoading: boolean;    hasError: false,

  error: string | null;    errorMessage: "",

  permissions: {    progress: 0,

    camera: 'granted' | 'denied' | 'pending';  });

    motion: 'granted' | 'denied' | 'pending';

  };  // 🔧 Capacidades del Dispositivo

}  const [deviceCapabilities, setDeviceCapabilities] =

    useState<DeviceCapabilities>({

export default function ARExperience() {      hasCamera: false,

  const params = useParams();      hasWebXR: false,

  const router = useRouter();      isSecureContext: false,

  const experienceId = params.id as string;      isMobile: false,

      supportsAR: false,

  // 📊 Estados principales    });

  const [experience, setExperience] = useState<Experience | null>(null);

  const [arState, setArState] = useState<ARSystemState>({  // ✋ Estado de Interacción AR

    session: {  const [arInteraction, setArInteraction] = useState<ARInteractionState>({

      isActive: false,    position: { x: 0.5, y: 0.5 },

      mode: 'fallback',    scale: 1.0,

      hasCamera: false,    rotation: 0,

      hasWebXR: false,    isDragging: false,

      frameRate: 0    isScaling: false,

    },    lastTouchDistance: 0,

    tracking: {  });

      surfaces: [],

      anchors: [],  // 🎥 Referencias Técnicas

      hitTestResults: []  const videoRef = useRef<HTMLVideoElement>(null);

    },  const canvasRef = useRef<HTMLCanvasElement>(null);

    objects: [],  const animationRef = useRef<number>();

    selectedObjectId: null,  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    isLoading: true,

    error: null,  // 🔍 Detección Avanzada de Capacidades AR

    permissions: {  const checkARCapabilities = useCallback(async () => {

      camera: 'pending',    const isSecure =

      motion: 'pending'      window.isSecureContext || location.hostname === "localhost";

    }    const hasMediaDevices = !!(

  });      navigator.mediaDevices && navigator.mediaDevices.getUserMedia

    );

  // 🎥 Referencias para AR    const isMobile =

  const videoRef = useRef<HTMLVideoElement>(null);      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(

  const canvasRef = useRef<HTMLCanvasElement>(null);        navigator.userAgent

  const xrSessionRef = useRef<XRSession | null>(null);      );

  const animationFrameRef = useRef<number>();

  const mediaStreamRef = useRef<MediaStream | null>(null);    // 🌐 Verificar soporte WebXR

    let hasWebXR = false;

  // 🔍 Detectar capacidades AR del dispositivo    if ("xr" in navigator) {

  const detectARCapabilities = useCallback(async () => {      try {

    console.log("🔍 Detectando capacidades AR...");        const xr = (navigator as any).xr;

            if (xr && typeof xr.isSessionSupported === "function") {

    try {          hasWebXR = await xr.isSessionSupported("immersive-ar");

      // Verificar WebXR        }

      const hasWebXR = 'xr' in navigator && 'isSessionSupported' in navigator.xr;      } catch (error) {

      let supportsImmersiveAR = false;        console.log("WebXR no disponible:", error);

            }

      if (hasWebXR) {    }

        try {

          supportsImmersiveAR = await navigator.xr.isSessionSupported('immersive-ar');    const supportsAR = isSecure && (hasWebXR || hasMediaDevices);

        } catch (err) {

          console.log("WebXR immersive-ar no soportado:", err);    setDeviceCapabilities({

        }      hasCamera: isSecure && hasMediaDevices,

      }      hasWebXR,

      isSecureContext: isSecure,

      // Verificar cámara      isMobile,

      const hasCamera = !!(navigator.mediaDevices?.getUserMedia);      supportsAR,

          });

      // Verificar contexto seguro

      const isSecure = window.isSecureContext;    console.log("🔧 Capacidades AR detectadas:", {

            hasCamera: isSecure && hasMediaDevices,

      console.log("📊 Capacidades detectadas:", {      hasWebXR,

        hasWebXR,      isSecureContext: isSecure,

        supportsImmersiveAR,      isMobile,

        hasCamera,      supportsAR,

        isSecure    });

      });  }, []);



      return {  // 🚀 Inicialización de Capacidades

        hasWebXR,  useEffect(() => {

        supportsImmersiveAR,    checkARCapabilities();

        hasCamera,  }, [checkARCapabilities]);

        isSecure

      };  // 🎯 Carga Progresiva de Experiencia con Detección de Modo AR

        const loadExperienceData = useCallback(async () => {

    } catch (error) {    if (!experienceId) {

      console.error("❌ Error detectando capacidades:", error);      setArState((prev) => ({

      return {        ...prev,

        hasWebXR: false,        hasError: true,

        supportsImmersiveAR: false,        errorMessage: "ID de experiencia no válido",

        hasCamera: false,        loadingState: "error",

        isSecure: false      }));

      };      return;

    }    }

  }, []);

    try {

  // 📥 Cargar experiencia AR      console.log("� Cargando experiencia AR:", experienceId);

  const loadARExperience = useCallback(async () => {

    console.log(`📥 Cargando experiencia AR: ${experienceId}`);      // Fase 1: Cargar datos básicos

          setArState((prev) => ({

    try {        ...prev,

      setArState(prev => ({ ...prev, isLoading: true, error: null }));        loadingState: "loading",

        progress: 10,

      const data = experienceId.match(/^[0-9]+$/)      }));

        ? await getExperienceById(experienceId)

        : await getExperienceBySlug(experienceId);      const isUuid =

        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(

      if (!data || !data.data) {          experienceId

        throw new Error("Experiencia no encontrada");        );

      }

      let response;

      const normalizedExp = normalizeExperience(data.data);      try {

      setExperience(normalizedExp);        if (isUuid) {

          response = await getExperienceById(experienceId);

      // Crear objetos AR para cada asset        } else {

      const arObjects: ARObject[] = normalizedExp.assets.map((asset, index) => ({          response = await getExperienceBySlug(experienceId);

        id: `object_${index}`,        }

        asset,      } catch (networkError) {

        position: { x: 0, y: 0, z: -2 }, // 2 metros frente al usuario        throw new Error(

        rotation: { x: 0, y: 0, z: 0 },          "Error de conexión. Verifica que el API esté disponible."

        scale: 1.0,        );

        isVisible: true,      }

        isTracked: false

      }));      if (!response?.success || !response.data) {

        throw new Error("Experiencia no encontrada");

      setArState(prev => ({      }

        ...prev,

        objects: arObjects,      // Fase 2: Normalizar y detectar tipo AR

        isLoading: false      setArState((prev) => ({ ...prev, progress: 30 }));

      }));

      const normalizedExperience = normalizeExperience(response.data);

      console.log("✅ Experiencia AR cargada:", normalizedExp.title);      setExperience(normalizedExperience);

      console.log("🎯 Objetos AR creados:", arObjects.length);

      // 🧠 Detección Inteligente del Modo AR

    } catch (error) {      const arMode = detectARMode(normalizedExperience);

      console.error("❌ Error cargando experiencia:", error);      console.log(`🎯 Modo AR detectado: ${arMode}`);

      setArState(prev => ({

        ...prev,      // Fase 3: Precargar assets críticos

        isLoading: false,      setArState((prev) => ({ ...prev, progress: 50, mode: arMode }));

        error: error instanceof Error ? error.message : "Error desconocido"      await preloadCriticalAssets(normalizedExperience.assets);

      }));

    }      // Fase 4: Listo para AR

  }, [experienceId]);      setArState((prev) => ({

        ...prev,

  // 🎥 Inicializar cámara para AR        loadingState: "ready",

  const initializeCamera = useCallback(async () => {        progress: 100,

    console.log("🎥 Inicializando cámara AR...");        hasError: false,

          }));

    try {

      setArState(prev => ({      console.log("✅ Experiencia AR lista:", normalizedExperience.title);

        ...prev,    } catch (error: any) {

        permissions: { ...prev.permissions, camera: 'pending' }      console.error("❌ Error cargando experiencia:", error);

      }));      setArState((prev) => ({

        ...prev,

      const stream = await navigator.mediaDevices.getUserMedia({        hasError: true,

        video: {        errorMessage: error.message || "Error desconocido",

          facingMode: 'environment', // Cámara trasera        loadingState: "error",

          width: { ideal: 1920, max: 1920 },        progress: 0,

          height: { ideal: 1080, max: 1080 },      }));

          frameRate: { ideal: 30, max: 60 }    }

        }  }, [experienceId]);

      });

  // 🧠 Detectar Modo AR Automáticamente

      mediaStreamRef.current = stream;  const detectARMode = useCallback((exp: Experience): ARMode => {

          // Lógica de detección basada en los assets y metadatos

      if (videoRef.current) {    const hasMarkerAssets = exp.assets.some(

        videoRef.current.srcObject = stream;      (asset) =>

        await new Promise((resolve) => {        asset.name.toLowerCase().includes("marker") ||

          if (videoRef.current) {        asset.name.toLowerCase().includes("target") ||

            videoRef.current.onloadedmetadata = resolve;        (asset.assetType === "image" && asset.name.toLowerCase().includes("qr"))

          }    );

        });

      }    // Si hay muchos assets o son 3D, probablemente sea viewer mode

    const hasComplexAssets =

      setArState(prev => ({      exp.assets.some(

        ...prev,        (asset) => asset.assetType === "model3d" || asset.assetType === "video"

        permissions: { ...prev.permissions, camera: 'granted' },      ) || exp.assets.length > 2;

        session: { ...prev.session, hasCamera: true }

      }));    if (hasMarkerAssets && !hasComplexAssets) {

      return "marker";

      console.log("✅ Cámara inicializada correctamente");    }

      return stream;

    return "viewer"; // Default para experiencias libres

    } catch (error) {  }, []);

      console.error("❌ Error inicializando cámara:", error);

      setArState(prev => ({  // 📦 Precargar Assets Críticos

        ...prev,  const preloadCriticalAssets = useCallback(

        permissions: { ...prev.permissions, camera: 'denied' },    async (assets: Asset[]) => {

        error: "No se pudo acceder a la cámara"      const imageAssets = assets.filter(

      }));        (asset) => asset.assetType === "image" && asset.assetUrl

      throw error;      );

    }

  }, []);      const promises = imageAssets.map(async (asset) => {

        if (!asset.assetUrl || assetLoader.loaded.has(asset.id)) return;

  // 🌐 Inicializar sesión WebXR

  const initializeWebXRSession = useCallback(async () => {        assetLoader.loading.add(asset.id);

    console.log("🌐 Inicializando sesión WebXR...");

            try {

    try {          const img = new Image();

      if (!navigator.xr) {          img.crossOrigin = "anonymous";

        throw new Error("WebXR no disponible");

      }          await new Promise<void>((resolve, reject) => {

            img.onload = () => {

      const session = await navigator.xr.requestSession('immersive-ar', {              assetLoader.loaded.set(asset.id, img);

        requiredFeatures: ['local'],              assetLoader.loading.delete(asset.id);

        optionalFeatures: ['hit-test', 'anchors', 'plane-detection']              resolve();

      });            };

            img.onerror = () => {

      xrSessionRef.current = session;              assetLoader.failed.add(asset.id);

              assetLoader.loading.delete(asset.id);

      // Configurar eventos de sesión              reject(new Error(`Failed to load ${asset.name}`));

      session.addEventListener('end', () => {            };

        console.log("🛑 Sesión WebXR terminada");            img.src = asset.assetUrl!;

        xrSessionRef.current = null;          });

        setArState(prev => ({

          ...prev,          console.log(`✅ Asset precargado: ${asset.name}`);

          session: { ...prev.session, isActive: false, mode: 'fallback' }        } catch (error) {

        }));          console.warn(`⚠️ No se pudo precargar: ${asset.name}`, error);

      });        }

      });

      setArState(prev => ({

        ...prev,      await Promise.allSettled(promises);

        session: {    },

          ...prev.session,    [assetLoader]

          isActive: true,  );

          mode: 'immersive-ar',

          hasWebXR: true  // Ejecutar carga

        }  useEffect(() => {

      }));    loadExperienceData();

  }, [loadExperienceData]);

      console.log("✅ Sesión WebXR inicializada");

      return session;  // 🎬 Renderizado AR Automático y Suave

  useEffect(() => {

    } catch (error) {    if (arState.isActive && canvasRef.current) {

      console.error("❌ Error inicializando WebXR:", error);      console.log("🚀 Iniciando renderizado AR...");

      throw error;      startARRenderingLoop();

    }    }

  }, []);

    return () => {

  // 🎯 Iniciar experiencia AR completa      if (animationRef.current) {

  const startARExperience = useCallback(async () => {        cancelAnimationFrame(animationRef.current);

    console.log("🚀 Iniciando experiencia AR...");      }

        };

    try {  }, [arState.isActive]);

      const capabilities = await detectARCapabilities();

        // 🎯 Modo de Prueba Sin Cámara (Profesional)

      // Siempre inicializar cámara  const startARPreview = useCallback(() => {

      await initializeCamera();    console.log("🎭 Iniciando vista previa AR...");

          setArState((prev) => ({

      // Intentar WebXR si está disponible      ...prev,

      if (capabilities.supportsImmersiveAR) {      isActive: true,

        try {      loadingState: "ready",

          await initializeWebXRSession();    }));

          startWebXRLoop();  }, []);

        } catch (xrError) {

          console.log("⚠️ WebXR falló, usando fallback:", xrError);  // 📱 Inicio de AR con Cámara Profesional

          startFallbackARLoop();  const startARCamera = useCallback(async () => {

        }    if (!deviceCapabilities.supportsAR) {

      } else {      setArState((prev) => ({

        console.log("📱 Usando modo fallback AR (sin WebXR)");        ...prev,

        startFallbackARLoop();        hasError: true,

      }        errorMessage: "AR no está disponible en este dispositivo",

        loadingState: "error",

      console.log("✅ Experiencia AR iniciada");      }));

            return;

    } catch (error) {    }

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
