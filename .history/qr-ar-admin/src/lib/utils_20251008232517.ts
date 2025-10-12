/**
 * Utilidades CSS - cn (className) y helpers
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind CSS de manera inteligente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera clases para estados de carga
 */
export function loadingClasses(isLoading: boolean) {
  return cn(
    'transition-opacity duration-200',
    isLoading && 'opacity-50 pointer-events-none'
  );
}

/**
 * Genera clases para estados de error
 */
export function errorClasses(hasError: boolean) {
  return cn(
    'transition-colors duration-200',
    hasError && 'border-red-300 bg-red-50'
  );
}

/**
 * Genera clases responsivas para grid
 */
export function gridClasses(cols: { sm?: number; md?: number; lg?: number; xl?: number }) {
  return cn(
    'grid gap-4',
    cols.sm && `grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  );
}