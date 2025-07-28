// Automatic Logo Transparency Processor
// Automatically processes all vendor logos to have transparent backgrounds

import { removeLogoBackground, LogoProcessingOptions } from './browserLogoProcessor';
import { updateVendorLogos } from './logoUpdater';
import { batchFetchCorporateLogos } from './corporateLogoFetcher';

export interface TransparencyProcessingResult {
  processedCount: number;
  totalCount: number;
  updatedVendors: any[];
  errors: string[];
}

/**
 * Automatically process all vendor logos to have transparent backgrounds
 */
export async function processAllLogosForTransparency(
  vendors: any[],
  onProgress?: (completed: number, total: number, current: string) => void
): Promise<TransparencyProcessingResult> {
  console.log('🎨 Starting automatic transparent background processing for all logos...');
  
  let processedCount = 0;
  const errors: string[] = [];
  let updatedVendors = [...vendors];

  // Step 1: Update with known high-quality logos first
  console.log('📋 Step 1: Updating with known high-quality logos...');
  updatedVendors = updateVendorLogos(updatedVendors);
  
  // Step 2: Fetch missing logos from corporate sources
  console.log('🌐 Step 2: Fetching missing corporate logos...');
  const vendorsNeedingLogos = updatedVendors.filter(vendor => 
    !vendor.logo || 
    vendor.logo.includes('placeholder.com') || 
    vendor.logo.includes('via.placeholder')
  );
  
  if (vendorsNeedingLogos.length > 0) {
    try {
      const results = await batchFetchCorporateLogos(
        vendorsNeedingLogos.map(v => ({ id: v.id, name: v.name, categories: v.categories })),
        {
          useWebScraping: true,
          preferHighQuality: true,
          timeoutMs: 10000,
          maxRetries: 2
        }
      );
      
      // Apply successful logo fetches
      updatedVendors = updatedVendors.map(vendor => {
        const result = results.find(r => r.vendorId === vendor.id);
        if (result && result.result.logoUrl && result.result.confidence > 50) {
          return {
            ...vendor,
            logo: result.result.logoUrl,
            logoSource: result.result.source,
            logoConfidence: result.result.confidence
          };
        }
        return vendor;
      });
    } catch (error) {
      console.error('Error fetching corporate logos:', error);
      errors.push(`Corporate logo fetch error: ${error.message}`);
    }
  }

  // Step 3: Process all logos for transparent backgrounds
  console.log('🎨 Step 3: Processing all logos for transparent backgrounds...');
  const logoProcessingOptions: LogoProcessingOptions = {
    removeWhiteBackground: true,
    outputFormat: 'png',
    maxSize: { width: 128, height: 128 },
    quality: 95
  };

  for (let i = 0; i < updatedVendors.length; i++) {
    const vendor = updatedVendors[i];
    
    if (onProgress) {
      onProgress(i, updatedVendors.length, vendor.name);
    }

    // Skip if vendor doesn't have a logo or already has a transparent background
    if (!vendor.logo || 
        vendor.logo.includes('placeholder.com') || 
        vendor.logo.includes('via.placeholder') ||
        vendor.logo.startsWith('data:image') ||
        vendor.hasTransparentBackground) {
      continue;
    }

    try {
      console.log(`🎨 Processing transparent background for: ${vendor.name}`);
      
      const result = await removeLogoBackground(vendor.logo, logoProcessingOptions);
      
      if (result.success && result.processedImageBase64) {
        updatedVendors[i] = {
          ...vendor,
          logo: result.processedImageBase64,
          hasTransparentBackground: true,
          logoSource: (vendor.logoSource || 'Original') + ' (Auto-Transparent)',
          logoProcessedAt: new Date().toISOString()
        };
        processedCount++;
        console.log(`✅ Successfully applied transparent background to: ${vendor.name}`);
      } else {
        console.warn(`⚠️ Failed to process transparent background for: ${vendor.name} - ${result.error}`);
        errors.push(`${vendor.name}: ${result.error}`);
      }
      
      // Small delay between processing to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error processing logo for ${vendor.name}:`, error);
      errors.push(`${vendor.name}: ${error.message}`);
    }
  }

  if (onProgress) {
    onProgress(updatedVendors.length, updatedVendors.length, 'Complete');
  }

  console.log(`✅ Automatic transparency processing complete! Processed ${processedCount} logos.`);
  
  return {
    processedCount,
    totalCount: updatedVendors.length,
    updatedVendors,
    errors
  };
}

/**
 * Check if a vendor's logo needs transparency processing
 */
export function needsTransparencyProcessing(vendor: any): boolean {
  return !!(
    vendor.logo && 
    !vendor.logo.includes('placeholder.com') && 
    !vendor.logo.includes('via.placeholder') &&
    !vendor.logo.startsWith('data:image') &&
    !vendor.hasTransparentBackground
  );
}

/**
 * Process a single vendor's logo for transparency
 */
export async function processSingleLogoForTransparency(
  vendor: any,
  options?: LogoProcessingOptions
): Promise<any> {
  if (!needsTransparencyProcessing(vendor)) {
    return vendor;
  }

  const defaultOptions: LogoProcessingOptions = {
    removeWhiteBackground: true,
    outputFormat: 'png',
    maxSize: { width: 128, height: 128 },
    quality: 95,
    ...options
  };

  try {
    const result = await removeLogoBackground(vendor.logo, defaultOptions);
    
    if (result.success && result.processedImageBase64) {
      return {
        ...vendor,
        logo: result.processedImageBase64,
        hasTransparentBackground: true,
        logoSource: (vendor.logoSource || 'Original') + ' (Auto-Transparent)',
        logoProcessedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error(`Error processing transparency for ${vendor.name}:`, error);
  }

  return vendor;
}

export default {
  processAllLogosForTransparency,
  needsTransparencyProcessing,
  processSingleLogoForTransparency
};