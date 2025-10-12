/**
 * Índice de componentes AR
 * 
 * Exporta todos los componentes relacionados con Realidad Aumentada
 * para uso en toda la aplicación
 */

// Componentes principales de AR
export { ARScene } from './ARScene';
export { ExperienceViewer } from './ExperienceViewer';
export { AssetRenderer } from './AssetRenderer';
export { AROverlay } from './ArOverlay';

// Tipos y interfaces
export type {
  ARSceneProps,
} from './ARScene';

export type {
  ExperienceViewerProps,
} from './ExperienceViewer';

export type {
  AssetRendererProps,
} from './AssetRenderer';

export type {
  AROverlayProps,
} from './AROverlay';