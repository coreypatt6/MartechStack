// Browser-Compatible Logo Background Processor
// Uses Canvas API instead of Sharp for client-side image processing

export interface LogoProcessingOptions {
  removeWhiteBackground?: boolean;
  outputFormat?: 'png' | 'webp';
  maxSize?: { width: number; height: number };
  quality?: number;
}

export interface LogoProcessingResult {
  success: boolean;
  processedImageBase64?: string;
  originalFormat: string;
  outputFormat: string;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    hasAlpha: boolean;
  };
}

/**
 * Downloads an image and returns a canvas element
 */
async function downloadImageToCanvas(url: string): Promise<{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      resolve({ canvas, ctx });
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image from ${url}`));
    };
    
    img.src = url;
  });
}

/**
 * Remove white/light backgrounds from logos using Canvas API
 */
export async function removeLogoBackground(
  imageUrl: string,
  options: LogoProcessingOptions = {}
): Promise<LogoProcessingResult> {
  const {
    removeWhiteBackground = true,
    outputFormat = 'png',
    maxSize = { width: 256, height: 256 },
    quality = 0.95
  } = options;

  try {
    // Download image to canvas
    const { canvas, ctx } = await downloadImageToCanvas(imageUrl);
    
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;
    
    // Resize if needed while maintaining aspect ratio
    let finalWidth = originalWidth;
    let finalHeight = originalHeight;
    
    if (originalWidth > maxSize.width || originalHeight > maxSize.height) {
      const aspectRatio = originalWidth / originalHeight;
      
      if (originalWidth > originalHeight) {
        finalWidth = maxSize.width;
        finalHeight = maxSize.width / aspectRatio;
      } else {
        finalHeight = maxSize.height;
        finalWidth = maxSize.height * aspectRatio;
      }
    }
    
    // Create final canvas
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    
    if (!finalCtx) {
      throw new Error('Could not get final canvas context');
    }
    
    finalCanvas.width = finalWidth;
    finalCanvas.height = finalHeight;
    
    // Draw resized image
    finalCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight);
    
    if (removeWhiteBackground) {
      // Get image data
      const imageData = finalCtx.getImageData(0, 0, finalWidth, finalHeight);
      const data = imageData.data;
      
      // Improved algorithm: Process pixels to remove white/light backgrounds with smooth edges
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // More precise white detection
        const brightness = (r + g + b) / 3;
        const colorVariance = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        
        // Check if pixel is white or near-white with low color variance
        const isWhitish = brightness > 235 && colorVariance < 15;
        
        if (isWhitish) {
          // Create smooth transparency based on how "white" the pixel is
          const whiteness = Math.min(brightness / 255, 1);
          const transparencyFactor = Math.pow(whiteness, 2); // Quadratic falloff for smoother edges
          data[i + 3] = Math.max(0, a * (1 - transparencyFactor));
        }
      }
      
      // Put processed data back
      finalCtx.putImageData(imageData, 0, 0);
    }
    
    // Convert to desired format
    const mimeType = outputFormat === 'webp' ? 'image/webp' : 'image/png';
    const processedImageBase64 = finalCanvas.toDataURL(mimeType, quality);
    
    return {
      success: true,
      processedImageBase64,
      originalFormat: 'unknown',
      outputFormat,
      metadata: {
        width: finalWidth,
        height: finalHeight,
        hasAlpha: true
      }
    };

  } catch (error) {
    console.error('Error processing logo:', error);
    return {
      success: false,
      originalFormat: 'unknown',
      outputFormat,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Batch process multiple logos
 */
export async function batchProcessLogos(
  logoUrls: string[],
  options: LogoProcessingOptions = {},
  onProgress?: (completed: number, total: number, current: string) => void
): Promise<Array<{ url: string; result: LogoProcessingResult }>> {
  const results: Array<{ url: string; result: LogoProcessingResult }> = [];

  for (let i = 0; i < logoUrls.length; i++) {
    const url = logoUrls[i];
    
    if (onProgress) {
      onProgress(i, logoUrls.length, url);
    }

    try {
      const result = await removeLogoBackground(url, options);
      results.push({ url, result });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.push({
        url,
        result: {
          success: false,
          originalFormat: 'unknown',
          outputFormat: options.outputFormat || 'png',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  if (onProgress) {
    onProgress(logoUrls.length, logoUrls.length, 'Complete');
  }

  return results;
}

/**
 * Check if an image already has transparency (browser version)
 */
export async function checkImageTransparency(imageUrl: string): Promise<{
  hasTransparency: boolean;
  format: string;
  dimensions: { width: number; height: number };
}> {
  try {
    const { canvas, ctx } = await downloadImageToCanvas(imageUrl);
    
    // Check if image has any transparent pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let hasTransparency = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        hasTransparency = true;
        break;
      }
    }
    
    // Guess format from URL
    const format = imageUrl.toLowerCase().includes('.svg') ? 'svg' :
                  imageUrl.toLowerCase().includes('.png') ? 'png' :
                  imageUrl.toLowerCase().includes('.webp') ? 'webp' : 'unknown';
    
    return {
      hasTransparency,
      format,
      dimensions: {
        width: canvas.width,
        height: canvas.height
      }
    };
  } catch (error) {
    throw new Error(`Error checking image transparency: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Simple fallback for vendors without logos
 */
export function generateFallbackLogo(vendorName: string, category: string = 'default'): string {
  const initials = vendorName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const categoryColors: Record<string, { bg: string; text: string }> = {
    cdp: { bg: '4F46E5', text: 'FFFFFF' },
    email: { bg: '0EA5E9', text: 'FFFFFF' },
    analytics: { bg: 'F59E0B', text: 'FFFFFF' },
    web: { bg: '8B5CF6', text: 'FFFFFF' },
    'social-publishing': { bg: 'EC4899', text: 'FFFFFF' },
    'social-listening': { bg: '10B981', text: 'FFFFFF' },
    'customer-service': { bg: '64748B', text: 'FFFFFF' },
    advertising: { bg: 'DC2626', text: 'FFFFFF' },
    default: { bg: '6B7280', text: 'FFFFFF' }
  };

  const colors = categoryColors[category] || categoryColors.default;
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors.bg}&color=${colors.text}&size=128&bold=true&format=png`;
}

export default {
  removeLogoBackground,
  batchProcessLogos,
  checkImageTransparency,
  generateFallbackLogo
};