// Logo Background Remover and Transparency Utility
// Ensures all logos have transparent backgrounds for consistent branding

import * as sharp from 'sharp';

export interface LogoProcessingOptions {
  removeWhiteBackground?: boolean;
  outputFormat?: 'png' | 'webp';
  maxSize?: { width: number; height: number };
  quality?: number;
}

export interface LogoProcessingResult {
  success: boolean;
  processedImageBuffer?: Buffer;
  processedImageBase64?: string;
  originalFormat: string;
  outputFormat: string;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    channels: number;
    hasAlpha: boolean;
  };
}

/**
 * Downloads an image from a URL and returns the buffer
 */
async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    throw new Error(`Error downloading image from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Removes white/light backgrounds from logos and ensures transparency
 */
export async function removeLogoBackground(
  imageInput: string | Buffer,
  options: LogoProcessingOptions = {}
): Promise<LogoProcessingResult> {
  const {
    removeWhiteBackground = true,
    outputFormat = 'png',
    maxSize = { width: 512, height: 512 },
    quality = 90
  } = options;

  try {
    // Get image buffer
    let imageBuffer: Buffer;
    if (typeof imageInput === 'string') {
      imageBuffer = await downloadImage(imageInput);
    } else {
      imageBuffer = imageInput;
    }

    // Get image metadata
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    const originalFormat = metadata.format || 'unknown';
    const hasAlpha = metadata.channels === 4 || metadata.channels === 2;

    // Start processing pipeline
    let processedImage = image;

    // Resize if needed while maintaining aspect ratio
    if (metadata.width && metadata.height) {
      if (metadata.width > maxSize.width || metadata.height > maxSize.height) {
        processedImage = processedImage.resize(maxSize.width, maxSize.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
    }

    // Remove white background if requested and image doesn't have alpha channel
    if (removeWhiteBackground && !hasAlpha) {
      // Method 1: Remove white/near-white backgrounds
      processedImage = processedImage
        .removeAlpha() // Remove any existing alpha
        .threshold(240) // Convert near-white to pure white
        .normalise() // Normalize the image
        .linear(1.2, -(255 * 0.2)) // Increase contrast
        .gamma(1.2); // Adjust gamma

      // Create transparency mask for white areas
      const mask = await sharp(imageBuffer)
        .resize(maxSize.width, maxSize.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .greyscale()
        .threshold(240, { grayscale: false })
        .negate()
        .png()
        .toBuffer();

      // Apply the mask to create transparency
      processedImage = processedImage
        .png()
        .composite([{ input: mask, blend: 'dest-in' }]);
    }

    // Ensure output format supports transparency
    if (outputFormat === 'png') {
      processedImage = processedImage.png({ quality });
    } else if (outputFormat === 'webp') {
      processedImage = processedImage.webp({ quality });
    }

    // Get final buffer and metadata
    const processedBuffer = await processedImage.toBuffer();
    const finalMetadata = await sharp(processedBuffer).metadata();

    return {
      success: true,
      processedImageBuffer: processedBuffer,
      processedImageBase64: `data:image/${outputFormat};base64,${processedBuffer.toString('base64')}`,
      originalFormat,
      outputFormat,
      metadata: {
        width: finalMetadata.width || 0,
        height: finalMetadata.height || 0,
        channels: finalMetadata.channels || 0,
        hasAlpha: (finalMetadata.channels === 4 || finalMetadata.channels === 2)
      }
    };

  } catch (error) {
    return {
      success: false,
      originalFormat: 'unknown',
      outputFormat,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Advanced background removal using color-based removal
 */
export async function removeColorBackground(
  imageInput: string | Buffer,
  backgroundColor: { r: number; g: number; b: number } = { r: 255, g: 255, b: 255 },
  tolerance: number = 10,
  options: LogoProcessingOptions = {}
): Promise<LogoProcessingResult> {
  const {
    outputFormat = 'png',
    maxSize = { width: 512, height: 512 },
    quality = 90
  } = options;

  try {
    // Get image buffer
    let imageBuffer: Buffer;
    if (typeof imageInput === 'string') {
      imageBuffer = await downloadImage(imageInput);
    } else {
      imageBuffer = imageInput;
    }

    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const originalFormat = metadata.format || 'unknown';

    // Resize if needed
    let processedImage = image;
    if (metadata.width && metadata.height) {
      if (metadata.width > maxSize.width || metadata.height > maxSize.height) {
        processedImage = processedImage.resize(maxSize.width, maxSize.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
    }

    // Create a mask for the background color
    const maskBuffer = await processedImage
      .clone()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = maskBuffer;
    const maskData = Buffer.alloc(info.width * info.height);

    // Process each pixel
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Check if pixel is within tolerance of background color
      const distance = Math.sqrt(
        Math.pow(r - backgroundColor.r, 2) +
        Math.pow(g - backgroundColor.g, 2) +
        Math.pow(b - backgroundColor.b, 2)
      );

      const pixelIndex = Math.floor(i / info.channels);
      maskData[pixelIndex] = distance <= tolerance ? 0 : 255;
    }

    // Create mask image
    const mask = sharp(maskData, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 1
      }
    }).png();

    // Apply mask to original image
    const result = await processedImage
      .png()
      .composite([{ input: await mask.toBuffer(), blend: 'dest-in' }])
      .toBuffer();

    const finalMetadata = await sharp(result).metadata();

    return {
      success: true,
      processedImageBuffer: result,
      processedImageBase64: `data:image/${outputFormat};base64,${result.toString('base64')}`,
      originalFormat,
      outputFormat,
      metadata: {
        width: finalMetadata.width || 0,
        height: finalMetadata.height || 0,
        channels: finalMetadata.channels || 0,
        hasAlpha: (finalMetadata.channels === 4 || finalMetadata.channels === 2)
      }
    };

  } catch (error) {
    return {
      success: false,
      originalFormat: 'unknown',
      outputFormat,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Batch process multiple logos to ensure transparency
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
 * Process Salesforce family logos specifically
 */
export async function processSalesforceLogos(): Promise<Array<{ name: string; result: LogoProcessingResult }>> {
  const salesforceLogos = [
    {
      name: 'Salesforce Primary',
      url: 'https://www.salesforce.com/news/wp-content/uploads/sites/3/2021/05/Salesforce-logo-1.jpg'
    },
    {
      name: 'MuleSoft', 
      url: 'https://www.mulesoft.com/sites/default/files/MuleSoft_logo_rgb.png'
    },
    {
      name: 'Salesforce.org',
      url: 'https://www.salesforce.org/wp-content/uploads/2021/01/sfdc-org-logo.png'
    },
    {
      name: 'Slack',
      url: 'https://a.slack-edge.com/80588/marketing/img/logos/company/slack-logo.png'
    },
    {
      name: 'Tableau',
      url: 'https://logos-world.net/wp-content/uploads/2021/10/Tableau-Logo.png'
    }
  ];

  const results: Array<{ name: string; result: LogoProcessingResult }> = [];

  for (const logo of salesforceLogos) {
    try {
      const result = await removeLogoBackground(logo.url, {
        removeWhiteBackground: true,
        outputFormat: 'png',
        maxSize: { width: 512, height: 512 },
        quality: 95
      });
      
      results.push({ name: logo.name, result });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      results.push({
        name: logo.name,
        result: {
          success: false,
          originalFormat: 'unknown',
          outputFormat: 'png',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  return results;
}

/**
 * Utility to check if an image already has transparency
 */
export async function checkImageTransparency(imageInput: string | Buffer): Promise<{
  hasTransparency: boolean;
  format: string;
  channels: number;
  dimensions: { width: number; height: number };
}> {
  try {
    let imageBuffer: Buffer;
    if (typeof imageInput === 'string') {
      imageBuffer = await downloadImage(imageInput);
    } else {
      imageBuffer = imageInput;
    }

    const metadata = await sharp(imageBuffer).metadata();
    
    return {
      hasTransparency: (metadata.channels === 4 || metadata.channels === 2),
      format: metadata.format || 'unknown',
      channels: metadata.channels || 0,
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0
      }
    };
  } catch (error) {
    throw new Error(`Error checking image transparency: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { downloadImage };