/**
 * Asset URL Migration Utility
 * Helps identify and fix blob URLs in the database
 */

import { getAllExperiences } from "@/lib/api/experiences";
import { Asset, Experience } from "@/types";

export interface URLAnalysis {
  experienceId: string;
  experienceTitle: string;
  assetId: string;
  assetName: string;
  assetType: string;
  currentUrl: string;
  isBlob: boolean;
  suggestedUrl?: string;
  exists?: boolean;
}

/**
 * Analyzes all assets to find problematic URLs
 */
export async function analyzeAssetURLs(): Promise<URLAnalysis[]> {
  try {
    const response = await getAllExperiences();
    if (!response.success) {
      throw new Error(response.message || "Failed to fetch experiences");
    }

    const results: URLAnalysis[] = [];
    
    for (const experience of response.data) {
      for (const asset of experience.assets) {
        const isBlob = asset.url?.startsWith('blob:') || false;
        
        let suggestedUrl: string | undefined;
        if (isBlob && asset.url) {
          // Extract filename from asset name or create one
          const extension = getExtensionForAssetType(asset.kind);
          const filename = sanitizeFilename(asset.name) + extension;
          const category = getCategoryForAssetType(asset.kind);
          suggestedUrl = `/uploads/${category}/${filename}`;
        }

        results.push({
          experienceId: experience.id,
          experienceTitle: experience.title,
          assetId: asset.id,
          assetName: asset.name,
          assetType: asset.kind,
          currentUrl: asset.url || '',
          isBlob,
          suggestedUrl,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error analyzing asset URLs:", error);
    throw error;
  }
}

/**
 * Check if a server URL actually exists
 */
export async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    const response = await fetch(fullUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get file extension for asset type
 */
function getExtensionForAssetType(assetType: string): string {
  switch (assetType) {
    case 'model3d':
      return '.glb';
    case 'image':
      return '.jpg';
    case 'video':
      return '.mp4';
    default:
      return '';
  }
}

/**
 * Get upload category for asset type
 */
function getCategoryForAssetType(assetType: string): string {
  switch (assetType) {
    case 'model3d':
      return 'models';
    case 'image':
      return 'images';
    case 'video':
      return 'videos';
    default:
      return 'files';
  }
}

/**
 * Sanitize filename for file system
 */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate a debug report for asset URLs
 */
export async function generateAssetUrlReport(): Promise<string> {
  const analysis = await analyzeAssetURLs();
  
  let report = `# Asset URL Analysis Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;

  const blobUrls = analysis.filter(a => a.isBlob);
  const validUrls = analysis.filter(a => !a.isBlob && a.currentUrl);
  const emptyUrls = analysis.filter(a => !a.currentUrl);

  report += `## Summary\n`;
  report += `- Total assets: ${analysis.length}\n`;
  report += `- Blob URLs (problematic): ${blobUrls.length}\n`;
  report += `- Valid server URLs: ${validUrls.length}\n`;
  report += `- Empty URLs: ${emptyUrls.length}\n\n`;

  if (blobUrls.length > 0) {
    report += `## Problematic Blob URLs\n\n`;
    for (const item of blobUrls) {
      report += `### ${item.experienceTitle} - ${item.assetName}\n`;
      report += `- Experience ID: ${item.experienceId}\n`;
      report += `- Asset ID: ${item.assetId}\n`;
      report += `- Type: ${item.assetType}\n`;
      report += `- Current URL: ${item.currentUrl}\n`;
      report += `- Suggested URL: ${item.suggestedUrl}\n\n`;
    }
  }

  return report;
}

/**
 * Log analysis to console with nice formatting
 */
export async function logAssetAnalysis(): Promise<void> {
  const analysis = await analyzeAssetURLs();
  
  console.group("🔍 Asset URL Analysis");
  console.log(`📊 Total assets: ${analysis.length}`);
  
  const blobUrls = analysis.filter(a => a.isBlob);
  if (blobUrls.length > 0) {
    console.group(`⚠️ Found ${blobUrls.length} blob URLs (problematic)`);
    blobUrls.forEach(item => {
      console.log(`🔴 ${item.experienceTitle} → ${item.assetName}`, {
        assetId: item.assetId,
        currentUrl: item.currentUrl,
        suggestedUrl: item.suggestedUrl
      });
    });
    console.groupEnd();
  }

  const validUrls = analysis.filter(a => !a.isBlob && a.currentUrl);
  console.log(`✅ Valid server URLs: ${validUrls.length}`);
  
  const emptyUrls = analysis.filter(a => !a.currentUrl);
  console.log(`ℹ️ Empty URLs: ${emptyUrls.length}`);
  
  console.groupEnd();
}