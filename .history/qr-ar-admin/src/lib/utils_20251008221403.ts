/**
 * General Utilities - Utilidades generales para la aplicación
 * Funciones auxiliares, formateo, manejo de errores y otras utilidades comunes
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ========================================
// UTILIDADES DE CSS Y STYLING
// ========================================

/**
 * Combina clases CSS con soporte para Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera clases CSS responsivas para grid
 */
export function getGridClasses(
  breakpoints: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  } = { sm: 1, md: 2, lg: 3, xl: 4 }
): string {
  const classes: string[] = ['grid', 'gap-4']
  
  if (breakpoints.sm) classes.push(`grid-cols-${breakpoints.sm}`)
  if (breakpoints.md) classes.push(`md:grid-cols-${breakpoints.md}`)
  if (breakpoints.lg) classes.push(`lg:grid-cols-${breakpoints.lg}`)
  if (breakpoints.xl) classes.push(`xl:grid-cols-${breakpoints.xl}`)
  
  return classes.join(' ')
}

// ========================================
// UTILIDADES DE STRINGS
// ========================================

/**
 * Capitaliza la primera letra de una string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Trunca una string a un largo máximo
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Limpia una string para usar como ID HTML
 */
export function toHtmlId(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Pluraliza una palabra según la cantidad
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular
  return plural || `${singular}s`
}

/**
 * Convierte camelCase a kebab-case
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Convierte kebab-case a camelCase
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// ========================================
// UTILIDADES DE FECHAS
// ========================================

/**
 * Formatea una fecha en formato español
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('es-ES', options)
}

/**
 * Formatea fecha y hora
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Obtiene la diferencia en días entre dos fechas
 */
export function getDaysDifference(date1: Date, date2: Date = new Date()): number {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * Verifica si una fecha es de esta semana
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6))
  return date >= weekStart && date <= weekEnd
}

// ========================================
// UTILIDADES DE NÚMEROS
// ========================================

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(num: number, locale = 'es-ES'): string {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Convierte bytes a formato legible
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Redondea un número a decimales específicos
 */
export function roundTo(num: number, decimals = 2): number {
  return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals)
}

/**
 * Clamp un número entre min y max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

/**
 * Genera un número random entre min y max
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// ========================================
// UTILIDADES DE ARRAYS
// ========================================

/**
 * Elimina duplicados de un array
 */
export function uniqueArray<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/**
 * Agrupa elementos de un array por una key
 */
export function groupBy<T, K extends keyof T>(
  arr: T[],
  key: K
): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const group = String(item[key])
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Mezcla un array aleatoriamente
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Divide un array en chunks de tamaño específico
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

// ========================================
// UTILIDADES DE OBJETOS
// ========================================

/**
 * Verifica si un objeto está vacío
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0
}

/**
 * Crea una copia profunda de un objeto
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  
  const clonedObj = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }
  return clonedObj
}

/**
 * Omite propiedades específicas de un objeto
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

/**
 * Selecciona solo propiedades específicas de un objeto
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

// ========================================
// UTILIDADES DE URLs
// ========================================

/**
 * Construye una URL con query parameters
 */
export function buildUrl(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : undefined)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  
  return url.toString()
}

/**
 * Extrae query parameters de una URL
 */
export function getUrlParams(url: string): Record<string, string> {
  const urlObj = new URL(url)
  const params: Record<string, string> = {}
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
}

// ========================================
// UTILIDADES DE VALIDACIÓN
// ========================================

/**
 * Valida si una string es una URL válida
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

/**
 * Valida si una string es un email válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida si una string es un slug válido
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/
  return slugRegex.test(slug)
}

// ========================================
// UTILIDADES DE PERFORMANCE
// ========================================

/**
 * Crea una función debounced
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Crea una función throttled
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Ejecuta una función de manera lazy (cuando sea necesaria)
 */
export function lazy<T>(factory: () => T): () => T {
  let cached: T
  let hasCached = false
  
  return () => {
    if (!hasCached) {
      cached = factory()
      hasCached = true
    }
    return cached
  }
}

// ========================================
// UTILIDADES DE PROMESAS
// ========================================

/**
 * Crea un sleep/delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Timeout para promesas
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
    )
  ])
}

/**
 * Retry una promesa con backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      await sleep(delay)
    }
  }
  
  throw lastError!
}

// ========================================
// UTILIDADES DE STORAGE
// ========================================

/**
 * Wrapper seguro para localStorage
 */
export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === 'undefined') return defaultValue || null
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch {
      return defaultValue || null
    }
  },
  
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore storage errors
    }
  },
  
  remove(key: string): void {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Ignore storage errors
    }
  },
  
  clear(): void {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.clear()
    } catch {
      // Ignore storage errors
    }
  }
}

// ========================================
// UTILIDADES DE DESARROLLO
// ========================================

/**
 * Log condicional para desarrollo
 */
export function devLog(...args: any[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV]', ...args)
  }
}

/**
 * Mide el tiempo de ejecución de una función
 */
export async function measureTime<T>(
  label: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  
  devLog(`${label}: ${(end - start).toFixed(2)}ms`)
  return result
}