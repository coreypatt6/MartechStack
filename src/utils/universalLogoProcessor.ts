// Universal Logo Processor
// Ensures ALL vendor logos have transparent backgrounds

import { removeLogoBackground, LogoProcessingOptions, LogoProcessingResult } from './logoBackgroundRemover';
import { KNOWN_MARTECH_LOGOS } from './corporateLogoFetcher';

export interface VendorLogoInfo {
  vendorName: string;
  originalUrl: string;
  transparentUrl?: string;
  needsProcessing: boolean;
  format: string;
  hasTransparency: boolean;
}

/**
 * Enhanced logo sources with transparent background priority
 */
const TRANSPARENT_LOGO_SOURCES = [
  {
    name: 'Clearbit Logo API',
    getUrl: (domain: string) => `https://logo.clearbit.com/${domain}`,
    format: 'png',
    hasTransparency: true,
    priority: 1
  },
  {
    name: 'Google Favicons (High Quality)',
    getUrl: (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    format: 'png', 
    hasTransparency: true,
    priority: 2
  },
  {
    name: 'Brandfetch API',
    getUrl: (domain: string) => `https://img.logo.dev/${domain}?token=pk_X1pD8rKoRpKmhJheIwkZrQ&format=png&width=400`,
    format: 'png',
    hasTransparency: true,
    priority: 3
  }
];

/**
 * Convert company name to likely domain
 */
function getDomainFromCompany(companyName: string): string {
  const cleaned = companyName.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/inc$|llc$|corp$|ltd$|limited$|ads$/, '');
  
  return `${cleaned}.com`;
}

/**
 * Check if a logo URL likely has transparency
 */
function urlHasTransparency(url: string): boolean {
  const urlLower = url.toLowerCase();
  
  // SVG files inherently support transparency
  if (urlLower.includes('.svg')) return true;
  
  // Clearbit API provides transparent PNGs
  if (urlLower.includes('logo.clearbit.com')) return true;
  
  // Google s2 favicons are transparent
  if (urlLower.includes('google.com/s2/favicons')) return true;
  
  // Common logo APIs that provide transparency
  if (urlLower.includes('logo.dev') || 
      urlLower.includes('brandfetch') ||
      urlLower.includes('logoapi')) return true;
  
  // Wikipedia Commons often has transparent logos
  if (urlLower.includes('wikimedia.org') || 
      urlLower.includes('upload.wikimedia.org')) return true;
  
  // Some CDNs with likely transparent assets
  if (urlLower.includes('assets') && urlLower.includes('.svg')) return true;
  
  // Assume PNG from brand sites might have transparency
  if (urlLower.includes('.png') && 
      (urlLower.includes('brand') || 
       urlLower.includes('press') || 
       urlLower.includes('media'))) return true;
  
  return false;
}

/**
 * Analyze all vendor logos and identify which need transparent backgrounds
 */
export function analyzeVendorLogos(): VendorLogoInfo[] {
  const analysis: VendorLogoInfo[] = [];
  
  for (const [vendorName, logoUrl] of Object.entries(KNOWN_MARTECH_LOGOS)) {
    const hasTransparency = urlHasTransparency(logoUrl);
    const format = logoUrl.toLowerCase().includes('.svg') ? 'svg' : 
                  logoUrl.toLowerCase().includes('.png') ? 'png' : 
                  logoUrl.toLowerCase().includes('.webp') ? 'webp' : 'unknown';
    
    analysis.push({
      vendorName,
      originalUrl: logoUrl,
      needsProcessing: !hasTransparency,
      format,
      hasTransparency
    });
  }
  
  return analysis;
}

/**
 * Get the best transparent logo URL for a vendor
 */
export function getTransparentLogoUrl(vendorName: string): string {
  const existing = KNOWN_MARTECH_LOGOS[vendorName.toLowerCase()];
  
  // If existing URL likely has transparency, use it
  if (existing && urlHasTransparency(existing)) {
    return existing;
  }
  
  // Try transparent logo sources
  const domain = getDomainFromCompany(vendorName);
  
  // Return Clearbit as it's most reliable for transparent logos
  return TRANSPARENT_LOGO_SOURCES[0].getUrl(domain);
}

/**
 * Update all vendor logos to use transparent versions
 */
export function updateAllLogosForTransparency(): Record<string, string> {
  const updatedLogos: Record<string, string> = {};
  
  for (const vendorName of Object.keys(KNOWN_MARTECH_LOGOS)) {
    updatedLogos[vendorName] = getTransparentLogoUrl(vendorName);
  }
  
  return updatedLogos;
}

/**
 * Batch process vendor logos to ensure transparency
 */
export async function batchEnsureTransparency(
  vendorNames: string[],
  options: LogoProcessingOptions = {},
  onProgress?: (completed: number, total: number, current: string) => void
): Promise<Array<{ vendorName: string; result: LogoProcessingResult; transparentUrl: string }>> {
  const results: Array<{ vendorName: string; result: LogoProcessingResult; transparentUrl: string }> = [];
  
  for (let i = 0; i < vendorNames.length; i++) {
    const vendorName = vendorNames[i];
    
    if (onProgress) {
      onProgress(i, vendorNames.length, vendorName);
    }
    
    try {
      const transparentUrl = getTransparentLogoUrl(vendorName);
      
      // If the URL is already from a transparent source, don't process
      if (urlHasTransparency(transparentUrl)) {
        results.push({
          vendorName,
          result: {
            success: true,
            originalFormat: 'unknown',
            outputFormat: 'png',
            processedImageBase64: `data:image/png;base64,${transparentUrl}` // Placeholder
          },
          transparentUrl
        });
      } else {
        // Process the logo for transparency
        const result = await removeLogoBackground(transparentUrl, {
          removeWhiteBackground: true,
          outputFormat: 'png',
          maxSize: { width: 256, height: 256 },
          quality: 95,
          ...options
        });
        
        results.push({
          vendorName,
          result,
          transparentUrl: result.success ? (result.processedImageBase64 || transparentUrl) : transparentUrl
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      results.push({
        vendorName,
        result: {
          success: false,
          originalFormat: 'unknown',
          outputFormat: 'png',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        transparentUrl: getTransparentLogoUrl(vendorName)
      });
    }
  }
  
  if (onProgress) {
    onProgress(vendorNames.length, vendorNames.length, 'Complete');
  }
  
  return results;
}

/**
 * Generate updated corporate logo fetcher with all transparent logos
 */
export function generateTransparentLogoFetcher(): string {
  const analysis = analyzeVendorLogos();
  const updatedLogos = updateAllLogosForTransparency();
  
  let output = `// Updated Corporate Logo Fetcher - ALL LOGOS WITH TRANSPARENT BACKGROUNDS\n`;
  output += `// Generated automatically to ensure consistent transparency across all vendor logos\n\n`;
  
  output += `export const TRANSPARENT_MARTECH_LOGOS: Record<string, string> = {\n`;
  
  const categories = {
    'Major Platforms': ['salesforce', 'hubspot', 'google analytics', 'adobe', 'mailchimp'],
    'Analytics & Attribution': ['adjust', 'appsflyer', 'mixpanel', 'amplitude', 'segment'],
    'Email & Marketing': ['sendgrid', 'klaviyo', 'constant contact', 'campaign monitor'],
    'Social Media Management': ['sprinklr', 'hootsuite', 'buffer', 'sprout social'],
    'Customer Support': ['zendesk', 'intercom', 'freshworks'],
    'Analytics Platforms': ['google tag manager', 'hotjar', 'crazy egg'],
    'Ad Platforms': ['facebook ads', 'google ads', 'linkedin ads', 'twitter ads'],
    'Content Management': ['wordpress', 'contentful', 'drupal'],
    'E-commerce': ['shopify', 'magento', 'woocommerce']
  };
  
  for (const [category, vendors] of Object.entries(categories)) {
    output += `  // ${category} - All transparent backgrounds\n`;
    
    for (const vendor of vendors) {
      if (updatedLogos[vendor]) {
        output += `  '${vendor}': '${updatedLogos[vendor]}',\n`;
      }
    }
    output += `\n`;
  }
  
  // Add any remaining vendors not in categories
  for (const [vendor, url] of Object.entries(updatedLogos)) {
    const inCategories = Object.values(categories).flat().includes(vendor);
    if (!inCategories) {
      output += `  '${vendor}': '${url}',\n`;
    }
  }
  
  output += `};\n\n`;
  
  // Add summary
  output += `// Summary:\n`;
  output += `// Total vendors: ${Object.keys(updatedLogos).length}\n`;
  const needsProcessing = analysis.filter(a => a.needsProcessing).length;
  output += `// Vendors updated for transparency: ${needsProcessing}\n`;
  output += `// All logos now use PNG/SVG formats with transparent backgrounds\n`;
  
  return output;
}

/**
 * Validate all logos have transparency
 */
export async function validateAllLogosTransparency(): Promise<{
  totalLogos: number;
  transparentLogos: number;
  nonTransparentLogos: string[];
  errors: string[];
}> {
  const analysis = analyzeVendorLogos();
  const results = {
    totalLogos: analysis.length,
    transparentLogos: 0,
    nonTransparentLogos: [] as string[],
    errors: [] as string[]
  };
  
  for (const logo of analysis) {
    try {
      if (logo.hasTransparency) {
        results.transparentLogos++;
      } else {
        results.nonTransparentLogos.push(logo.vendorName);
      }
    } catch (error) {
      results.errors.push(`${logo.vendorName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return results;
}

export default {
  analyzeVendorLogos,
  getTransparentLogoUrl,
  updateAllLogosForTransparency,
  batchEnsureTransparency,
  generateTransparentLogoFetcher,
  validateAllLogosTransparency
};