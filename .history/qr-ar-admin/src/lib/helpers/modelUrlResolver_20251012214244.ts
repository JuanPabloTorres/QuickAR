/**
 * Model URL Resolver
 * Helps resolve blob URLs to actual server files
 */

// Get API base URL with fallback
function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return "http://localhost:5001";
}

const API_BASE_URL = getApiBaseUrl();

export interface AvailableFile {
  name: string;
  url: string;
  size: number;
  modified: string;
}

/**
 * Get list of available model files from the server
 */
export async function getAvailableModelFiles(): Promise<AvailableFile[]> {
  try {
    // This would need a server endpoint to list files
    // For now, we'll use a fallback approach
    const response = await fetch(`${API_BASE_URL}/api/files/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('File listing endpoint not available, using fallback');
  }

  // Fallback: return empty array, will use other resolution methods
  return [];
}

/**
 * Try to resolve a blob URL to a real server URL
 */
export async function resolveBlobUrl(
  blobUrl: string, 
  assetName: string, 
  assetId: string
): Promise<string | null> {
  // Extract UUID from blob URL if possible
  const uuidMatch = blobUrl.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  const blobUuid = uuidMatch ? uuidMatch[0] : null;

  // Try multiple strategies to find the correct file
  const strategies = [
    // Strategy 1: Try exact asset ID match
    () => `/uploads/models/${assetId}.glb`,
    
    // Strategy 2: Try name-based filename
    () => {
      const sanitized = assetName.toLowerCase()
        .replace(/[^a-z0-9\-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return `/uploads/models/${sanitized}.glb`;
    },
    
    // Strategy 3: Try common patterns with timestamps
    () => {
      const timestamp = Date.now().toString();
      const sanitized = assetName.toLowerCase()
        .replace(/[^a-z0-9\-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return `/uploads/models/${timestamp}_${sanitized}.glb`;
    },
  ];

  // Try each strategy
  for (const strategy of strategies) {
    const candidateUrl = strategy();
    const fullUrl = `${API_BASE_URL}${candidateUrl}`;
    
    try {
      const response = await fetch(fullUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Found model file: ${candidateUrl}`);
        return candidateUrl;
      }
    } catch (error) {
      // Continue to next strategy
    }
  }

  console.warn(`❌ Could not resolve blob URL to server file: ${blobUrl}`);
  return null;
}

/**
 * Get a fallback model URL (latest uploaded model)
 */
export async function getLatestModelUrl(): Promise<string | null> {
  const knownModels = [
    '/uploads/models/1759374916_d30996f3.glb', // Known working model
    '/uploads/models/1759450973_f27edb5c.glb',
    '/uploads/models/1760248530_56275aab.glb',
    '/uploads/models/1760250740_39d3d473.glb', // Latest based on directory listing
  ];

  // Try models in reverse order (newest first)
  for (const model of knownModels.reverse()) {
    try {
      const response = await fetch(`${API_BASE_URL}${model}`, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Using fallback model: ${model}`);
        return model;
      }
    } catch (error) {
      // Continue to next model
    }
  }

  return null;
}

/**
 * Smart URL resolution that tries multiple approaches
 */
export async function smartResolveModelUrl(
  assetUrl: string | undefined,
  assetName: string,
  assetId: string
): Promise<string> {
  // If it's already a valid server URL, use it
  if (assetUrl && !assetUrl.startsWith('blob:') && assetUrl.startsWith('/uploads/')) {
    return assetUrl;
  }

  // If it's a blob URL, try to resolve it
  if (assetUrl && assetUrl.startsWith('blob:')) {
    const resolved = await resolveBlobUrl(assetUrl, assetName, assetId);
    if (resolved) {
      return resolved;
    }
  }

  // Fallback to latest available model
  const fallback = await getLatestModelUrl();
  if (fallback) {
    return fallback;
  }

  // Ultimate fallback
  return '/uploads/models/default-model.glb';
}