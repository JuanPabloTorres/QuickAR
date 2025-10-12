/**
 * Quick AR - Frontend Refactorizado
 *
 * Sistema completo de Realidad Aumentada con arquitectura moderna
 * ===============================================================
 *
 * ESTRUCTURA COMPLETADA:
 *
 * 📁 src/
 * ├── 📁 lib/
 * │   ├── 📄 types.ts                    ✅ Sistema de tipos completo
 * │   ├── 📁 api/
 * │   │   └── 📄 client.ts               ✅ Cliente API unificado
 * │   └── 📁 helpers/
 * │       └── 📄 experienceHelpers.ts    ✅ Utilidades para experiencias
 * │
 * ├── 📁 components/
 * │   ├── 📁 ui/                         ✅ Biblioteca de componentes UI
 * │   │   ├── 📄 button.tsx
 * │   │   ├── 📄 card.tsx
 * │   │   ├── 📄 Input.tsx
 * │   │   ├── 📄 Modal.tsx
 * │   │   └── 📄 Select.tsx
 * │   └── 📁 ar/                         ✅ Componentes AR especializados
 * │       ├── 📄 ARScene.tsx             - Escena principal AR
 * │       ├── 📄 ExperienceViewer.tsx    - Visor de experiencias
 * │       ├── 📄 AssetRenderer.tsx       - Renderizado de assets
 * │       ├── 📄 ArOverlay.tsx           - Overlay de información
 * │       └── 📄 index.ts                - Exportaciones AR
 * │
 * └── 📁 app/
 *     ├── 📁 experiences/
 *     │   └── 📄 page.tsx                ✅ Lista de experiencias
 *     └── 📁 ar/
 *         └── 📁 [id]/
 *             └── 📄 page.tsx            ✅ Visor AR individual
 *
 *
 * CARACTERÍSTICAS IMPLEMENTADAS:
 *
 * 🎯 AR Core:
 * - ✅ Renderizado de assets AR (texto, imagen, video, modelo 3D)
 * - ✅ Controles de navegación y manipulación
 * - ✅ Sistema de overlay con información contextual
 * - ✅ Estados de carga y error
 * - ✅ Simulación de tracking AR (preparado para AR real)
 *
 * 📱 UI/UX:
 * - ✅ Interfaz moderna y responsive
 * - ✅ Navegación intuitiva entre experiencias
 * - ✅ Filtros y búsqueda de experiencias
 * - ✅ Estados de carga elegantes
 * - ✅ Manejo de errores comprehensive
 *
 * 🔧 Arquitectura:
 * - ✅ Tipado TypeScript completo
 * - ✅ Cliente API que consume backend .NET sin cambios
 * - ✅ Transformación automática entre DTOs y modelos frontend
 * - ✅ Sistema de validaciones y helpers
 * - ✅ Componentes reutilizables y modulares
 *
 * 📊 Analytics & Tracking:
 * - ✅ Seguimiento de eventos AR
 * - ✅ Métricas de interacción
 * - ✅ Registro de errores
 * - ✅ Analytics de uso de experiencias
 *
 *
 * PRÓXIMOS PASOS RECOMENDADOS:
 *
 * 1. 🛠️ Páginas adicionales:
 *    - Página de administración (/admin)
 *    - Página de creación de experiencias (/experiences/create)
 *    - Página de edición (/experiences/[id]/edit)
 *
 * 2. 🎯 AR Avanzado:
 *    - Integración con WebXR API para AR real
 *    - Soporte para marcadores AR
 *    - Reconocimiento de imágenes
 *
 * 3. 📱 Funcionalidades:
 *    - Generador de códigos QR
 *    - Sistema de compartir experiencias
 *    - Configuración de usuario
 *
 * 4. 🎨 Mejoras UI:
 *    - Tema oscuro/claro
 *    - Animaciones avanzadas
 *    - Accesibilidad mejorada
 *
 *
 * NOTAS TÉCNICAS:
 *
 * - Backend .NET completamente intacto ✅
 * - API endpoints funcionando sin cambios ✅
 * - Sistema de tipos mapeado exactamente a DTOs ✅
 * - Preparado para AR real con WebXR ✅
 * - Arquitectura escalable y mantenible ✅
 *
 *
 * USO:
 *
 * ```typescript
 * // Importar componentes AR
 * import { ARScene, ExperienceViewer } from '@/components/ar';
 *
 * // Usar cliente API
 * import { apiClient } from '@/lib/api/client';
 * const experiences = await apiClient.getExperiences();
 *
 * // Usar helpers
 * import { filterExperiences, validateExperienceTitle } from '@/lib/helpers/experienceHelpers';
 * ```
 *
 */

// Exportaciones principales para uso externo
export * from "./components/ar";
export * from "./lib/api/client";
export * from "./lib/types";
// export * from './components/ui'; // Deshabilitado hasta completar migración

// Configuración por defecto
export const QUICK_AR_CONFIG = {
  version: "2.0.0",
  name: "Quick AR Platform",
  description: "Plataforma completa de Realidad Aumentada",
  features: {
    ar: true,
    analytics: true,
    multiAsset: true,
    responsive: true,
  },
} as const;
