import { AssetDto } from "@/types";

/**
 * Detecta si se está accediendo desde red local (móvil) o localhost
 * @returns información sobre el entorno de acceso
 */
export function getEnvironmentInfo() {
  if (typeof window === "undefined") {
    // Server-side
    return {
      isServer: true,
      isLocalhost: false,
      isNetwork: false,
      hostname: "localhost",
      protocol: "http:",
    };
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isNetwork = !isLocalhost && hostname !== "";

  return {
    isServer: false,
    isLocalhost,
    isNetwork,
    hostname,
    protocol,
  };
}

/**
 * Obtiene la URL base del frontend según el entorno
 * @returns URL base para construir enlaces (ej: QR codes)
 */
export function getFrontendBaseUrl(): string {
  const env = getEnvironmentInfo();

  if (env.isServer) {
    // En servidor, usar variable de entorno
    return process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || "http://localhost:3000";
  }

  if (env.isNetwork) {
    // En red local, usar la IP actual
    return `${env.protocol}//${env.hostname}:3000`;
  }

  // Localhost
  return `${env.protocol}//localhost:3000`;
}

/**
 * Genera URL completa para experiencia AR (útil para QR codes)
 * @param slug Slug de la experiencia
 * @returns URL completa para acceder a la experiencia
 */
export function getExperienceUrl(slug: string): string {
  const baseUrl = getFrontendBaseUrl();
  return `${baseUrl}/x/${slug}`;
}

/**
 * Obtiene la base URL para uploads
 * Siempre usa "/uploads" para same-origin requests via Next.js rewrites
 */
export function getUploadsBase(): string {
  return "/uploads";
}

/**
 * Construye URL para asset basado en ruta relativa
 * @param relativePath Ruta relativa del archivo (ej: "models/file.glb" o "/uploads/models/file.glb")
 * @returns URL completa same-origin (ej: "/uploads/models/file.glb")
 */
export function getAssetUrl(relativePath: string): string {
  if (!relativePath) return "";

  const base = getUploadsBase();
  const rel = relativePath.replace(/^\/+/, ""); // Remover slashes iniciales

  // Si ya tiene el prefijo /uploads, devolverlo tal como está
  if (rel.startsWith("uploads/")) {
    return `/${rel}`;
  }

  return `${base}/${rel}`;
}

/**
 * Normaliza URL de asset para uso consistente
 * Maneja diferentes formatos de URLs y convierte a same-origin
 * @param asset AssetDto con url a normalizar
 * @returns URL normalizada same-origin o cadena vacía si no es resolvible
 */
export function normalizeAssetUrl(asset: AssetDto): string {
  if (!asset.url) {
    console.warn("Asset sin URL:", asset.name);
    return "";
  }

  console.log("Normalizando URL para", asset.name, ":", asset.url);

  // Si es blob URL, no es resolvible desde servidor
  if (asset.url.startsWith("blob:")) {
    console.warn("Blob URL no resolvible para", asset.name, ":", asset.url);
    return "";
  }

  // Si ya es ruta relativa correcta /uploads/...
  if (asset.url.startsWith("/uploads/")) {
    console.log("URL ya normalizada:", asset.url);
    return asset.url;
  }

  // Si es URL completa, extraer solo la parte de la ruta
  if (asset.url.startsWith("http")) {
    try {
      const url = new URL(asset.url);
      if (url.pathname.startsWith("/uploads/")) {
        console.log("Extrayendo pathname de URL completa:", url.pathname);
        return url.pathname;
      } else {
        console.warn("URL completa sin /uploads/ en pathname:", asset.url);
        return "";
      }
    } catch (error) {
      console.error("Error parseando URL completa:", asset.url, error);
      return "";
    }
  }

  // Si es ruta relativa sin prefijo /uploads, agregarla
  if (!asset.url.startsWith("http") && !asset.url.startsWith("/")) {
    const normalizedUrl = getAssetUrl(asset.url);
    console.log("Agregando prefijo /uploads a ruta relativa:", normalizedUrl);
    return normalizedUrl;
  }

  console.warn("No se pudo normalizar URL para", asset.name, ":", asset.url);
  return "";
}

/**
 * Valida si un asset tiene URL resolvible
 * @param asset AssetDto a validar
 * @returns true si el asset tiene URL válida y resolvible
 */
export function isAssetUrlValid(asset: AssetDto): boolean {
  const normalizedUrl = normalizeAssetUrl(asset);
  return normalizedUrl.length > 0;
}

/**
 * Obtiene extensión de archivo desde asset
 * @param asset AssetDto
 * @returns extensión en minúsculas (ej: "glb", "jpg") o cadena vacía
 */
export function getAssetExtension(asset: AssetDto): string {
  const url = asset.url || "";
  const match = url.match(/\.([^./?#]+)(?:[?#]|$)/);
  return match ? match[1].toLowerCase() : "";
}

/**
 * Determina si el asset es un modelo 3D basado en extensión y tipo
 * @param asset AssetDto
 * @returns true si es modelo 3D válido
 */
export function is3DModel(asset: AssetDto): boolean {
  if (asset.kind !== "model3d") return false;

  const ext = getAssetExtension(asset);
  const valid3DExtensions = ["glb", "gltf", "usdz", "obj", "fbx", "dae"];

  return valid3DExtensions.includes(ext);
}

/**
 * Logs informativos para debugging de assets
 * @param asset AssetDto
 * @param context Contexto donde se usa (ej: "ARViewer", "Model3DRenderer")
 */
export function logAssetInfo(asset: AssetDto, context: string = "Asset"): void {
  console.group(`[${context}] Asset Info: ${asset.name}`);
  console.log("ID:", asset.id);
  console.log("Kind:", asset.kind);
  console.log("Original URL:", asset.url);
  console.log("MIME Type:", asset.mimeType);
  console.log("File Size:", asset.fileSizeBytes);
  console.log("Extension:", getAssetExtension(asset));
  console.log("Is 3D Model:", is3DModel(asset));
  console.log("Is URL Valid:", isAssetUrlValid(asset));
  console.log("Normalized URL:", normalizeAssetUrl(asset));
  console.groupEnd();
}
