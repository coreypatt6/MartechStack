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
 * Enhanced background color detection using corner sampling
 */
function detectBackgroundColor(data: Uint8ClampedArray, width: number, height: number): Array<{r: number, g: number, b: number}> {
  const colorMap = new Map<string, number>();
  const sampleSize = Math.min(20, Math.floor(width * 0.1)); // Sample from corners
  
  // Sample corners and edges
  const sampleRegions = [
    // Top-left corner
    {x: 0, y: 0, w: sampleSize, h: sampleSize},
    // Top-right corner  
    {x: width - sampleSize, y: 0, w: sampleSize, h: sampleSize},
    // Bottom-left corner
    {x: 0, y: height - sampleSize, w: sampleSize, h: sampleSize},
    // Bottom-right corner
    {x: width - sampleSize, y: height - sampleSize, w: sampleSize, h: sampleSize}
  ];
  
  for (const region of sampleRegions) {
    for (let y = region.y; y < region.y + region.h; y++) {
      for (let x = region.x; x < region.x + region.w; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Quantize colors to reduce noise
        const quantizedR = Math.round(r / 8) * 8;
        const quantizedG = Math.round(g / 8) * 8;
        const quantizedB = Math.round(b / 8) * 8;
        
        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }
    }
  }
  
  // Return most common colors (top 3)
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([colorKey]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return {r, g, b};
    });
    
  return sortedColors.length > 0 ? sortedColors : [{r: 255, g: 255, b: 255}]; // Default to white
}

/**
 * Calculate color distance using Delta E algorithm
 */
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  // Simple Euclidean distance in RGB space (could be improved with LAB color space)
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Calculate color saturation
 */
function calculateSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/**
 * Calculate transparency factor based on multiple criteria
 */
function calculateTransparencyFactor(brightness: number, saturation: number, colorDistance: number): number {
  let factor = 0;
  
  // Brightness-based transparency
  if (brightness > 240) {
    factor = Math.max(factor, 0.9);
  } else if (brightness > 220) {
    factor = Math.max(factor, 0.7);
  } else if (brightness > 200) {
    factor = Math.max(factor, 0.5);
  }
  
  // Saturation-based transparency (low saturation = more likely background)
  if (saturation < 0.05) {
    factor = Math.max(factor, 0.8);
  } else if (saturation < 0.1) {
    factor = Math.max(factor, 0.6);
  }
  
  // Color distance-based transparency
  if (colorDistance < 20) {
    factor = Math.max(factor, 0.9);
  } else if (colorDistance < 40) {
    factor = Math.max(factor, 0.7);
  }
  
  return Math.min(factor, 1);
}

/**
 * Apply edge smoothing to reduce transparency artifacts
 */
function smoothTransparencyEdges(data: Uint8ClampedArray, width: number, height: number): void {
  const tempData = new Uint8ClampedArray(data);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      
      // Only smooth pixels that are partially transparent
      const alpha = data[i + 3];
      if (alpha > 0 && alpha < 255) {
        // Average with surrounding pixels
        let totalAlpha = 0;
        let count = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ni = ((y + dy) * width + (x + dx)) * 4;
            totalAlpha += tempData[ni + 3];
            count++;
          }
        }
        
        data[i + 3] = Math.round(totalAlpha / count);
      }
    }
  }
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
      
      // Enhanced background removal algorithm
      // Step 1: Detect the most common background color (corner sampling)
      const backgroundColors = detectBackgroundColor(data, finalWidth, finalHeight);
      
      // Step 2: Process pixels with improved algorithm
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Calculate color distance from detected background colors
        let minDistance = Infinity;
        for (const bgColor of backgroundColors) {
          const distance = colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b);
          minDistance = Math.min(minDistance, distance);
        }
        
        // Enhanced white/light background detection
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114); // Weighted brightness
        const saturation = calculateSaturation(r, g, b);
        
        // Multi-criteria background detection
        const isBackground = 
          (brightness > 230 && saturation < 0.1) || // Very light with low saturation
          (brightness > 240 && saturation < 0.2) || // White-ish
          (minDistance < 30); // Close to detected background color
        
        if (isBackground) {
          // Create smooth transparency with improved edge detection
          const transparencyFactor = calculateTransparencyFactor(brightness, saturation, minDistance);
          data[i + 3] = Math.max(0, a * (1 - transparencyFactor));
        } else {
          // Enhance contrast for non-background pixels
          const contrastBoost = 1.1;
          data[i] = Math.min(255, r * contrastBoost);
          data[i + 1] = Math.min(255, g * contrastBoost);
          data[i + 2] = Math.min(255, b * contrastBoost);
        }
      }
      
      // Step 3: Apply edge smoothing to reduce artifacts
      smoothTransparencyEdges(data, finalWidth, finalHeight);
      
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