#!/usr/bin/env node

/**
 * Process All Vendor Logos with Enhanced Transparency Algorithm
 * This script applies the improved transparent background processing to all current vendor logos
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Extract all logo URLs from the current vendor data
const VENDOR_LOGOS = [
  { name: 'Salesforce CDP', url: 'https://logo.clearbit.com/salesforce.com' },
  { name: 'Adobe Experience Platform', url: 'https://logo.clearbit.com/adobe.com' },
  { name: 'Segment', url: 'https://logo.clearbit.com/segment.com' },
  { name: 'Tealium', url: 'https://logo.clearbit.com/tealium.com' },
  { name: 'Mailchimp', url: 'https://logo.clearbit.com/mailchimp.com' },
  { name: 'SendGrid', url: 'https://logo.clearbit.com/sendgrid.com' },
  { name: 'Klaviyo', url: 'https://logo.clearbit.com/klaviyo.com' },
  { name: 'Twilio', url: 'https://logo.clearbit.com/twilio.com' },
  { name: 'Braze', url: 'https://logo.clearbit.com/braze.com' },
  { name: 'Google Analytics', url: 'https://logo.clearbit.com/google.com' },
  { name: 'Adobe Analytics', url: 'https://logo.clearbit.com/adobe.com' },
  { name: 'Mixpanel', url: 'https://logo.clearbit.com/mixpanel.com' },
  { name: 'Amplitude', url: 'https://logo.clearbit.com/amplitude.com' },
  { name: 'Hotjar', url: 'https://logo.clearbit.com/hotjar.com' },
  { name: 'Optimizely', url: 'https://logo.clearbit.com/optimizely.com' },
  { name: 'Contentful', url: 'https://logo.clearbit.com/contentful.com' },
  { name: 'WordPress', url: 'https://logo.clearbit.com/wordpress.com' },
  { name: 'Hootsuite', url: 'https://logo.clearbit.com/hootsuite.com' },
  { name: 'Buffer', url: 'https://logo.clearbit.com/buffer.com' },
  { name: 'Sprout Social', url: 'https://logo.clearbit.com/sproutsocial.com' },
  { name: 'Brandwatch', url: 'https://logo.clearbit.com/brandwatch.com' },
  { name: 'Mention', url: 'https://logo.clearbit.com/mention.com' },
  { name: 'Zendesk', url: 'https://logo.clearbit.com/zendesk.com' },
  { name: 'Intercom', url: 'https://logo.clearbit.com/intercom.com' },
  { name: 'Freshworks', url: 'https://logo.clearbit.com/freshworks.com' },
  { name: 'HubSpot', url: 'https://logo.clearbit.com/hubspot.com' },
  { name: 'Salesforce Service Cloud', url: 'https://logo.clearbit.com/salesforce.com' },
  { name: 'LiveChat', url: 'https://logo.clearbit.com/livechat.com' },
  { name: 'Google Ads', url: 'https://logo.clearbit.com/google.com' },
  { name: 'Facebook Ads', url: 'https://logo.clearbit.com/facebook.com' },
  { name: 'LinkedIn Ads', url: 'https://logo.clearbit.com/linkedin.com' },
  { name: 'The Trade Desk', url: 'https://logo.clearbit.com/thetradedesk.com' },
  { name: 'Amazon DSP', url: 'https://logo.clearbit.com/amazon.com' },
  { name: 'LiveRamp', url: 'https://logo.clearbit.com/liveramp.com' },
  { name: 'Cision', url: 'https://logo.clearbit.com/cision.com' }
];

/**
 * Enhanced background color detection using corner sampling
 */
function detectBackgroundColor(data, width, height) {
  const colorMap = new Map();
  const sampleSize = Math.min(20, Math.floor(width * 0.1));
  
  const sampleRegions = [
    {x: 0, y: 0, w: sampleSize, h: sampleSize},
    {x: width - sampleSize, y: 0, w: sampleSize, h: sampleSize},
    {x: 0, y: height - sampleSize, w: sampleSize, h: sampleSize},
    {x: width - sampleSize, y: height - sampleSize, w: sampleSize, h: sampleSize}
  ];
  
  for (const region of sampleRegions) {
    for (let y = region.y; y < region.y + region.h; y++) {
      for (let x = region.x; x < region.x + region.w; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const quantizedR = Math.round(r / 8) * 8;
        const quantizedG = Math.round(g / 8) * 8;
        const quantizedB = Math.round(b / 8) * 8;
        
        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }
    }
  }
  
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([colorKey]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return {r, g, b};
    });
    
  return sortedColors.length > 0 ? sortedColors : [{r: 255, g: 255, b: 255}];
}

/**
 * Calculate color distance
 */
function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Calculate saturation
 */
function calculateSaturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/**
 * Calculate transparency factor
 */
function calculateTransparencyFactor(brightness, saturation, colorDistance) {
  let factor = 0;
  
  if (brightness > 240) {
    factor = Math.max(factor, 0.9);
  } else if (brightness > 220) {
    factor = Math.max(factor, 0.7);
  } else if (brightness > 200) {
    factor = Math.max(factor, 0.5);
  }
  
  if (saturation < 0.05) {
    factor = Math.max(factor, 0.8);
  } else if (saturation < 0.1) {
    factor = Math.max(factor, 0.6);
  }
  
  if (colorDistance < 20) {
    factor = Math.max(factor, 0.9);
  } else if (colorDistance < 40) {
    factor = Math.max(factor, 0.7);
  }
  
  return Math.min(factor, 1);
}

/**
 * Download image
 */
async function downloadImage(url) {
  console.log(`📥 Downloading: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    throw new Error(`Failed to download ${url}: ${error.message}`);
  }
}

/**
 * Process logo with enhanced transparency algorithm
 */
async function processLogoTransparency(imageBuffer, name) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`📊 Original: ${metadata.width}x${metadata.height}, ${metadata.channels} channels, ${metadata.format}`);
    
    // Convert to raw pixel data for processing
    const { data, info } = await sharp(imageBuffer)
      .png()
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    
    // Create new buffer with alpha channel
    const processedData = Buffer.alloc(width * height * 4);
    
    // Detect background colors
    const backgroundColors = detectBackgroundColor(data, width, height);
    console.log(`🎨 Detected background colors:`, backgroundColors);
    
    // Process each pixel
    for (let i = 0; i < data.length; i += channels) {
      const pixelIndex = Math.floor(i / channels) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const originalAlpha = channels === 4 ? data[i + 3] : 255;
      
      // Calculate color distance from background colors
      let minDistance = Infinity;
      for (const bgColor of backgroundColors) {
        const distance = colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b);
        minDistance = Math.min(minDistance, distance);
      }
      
      // Enhanced background detection
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      const saturation = calculateSaturation(r, g, b);
      
      const isBackground = 
        (brightness > 230 && saturation < 0.1) ||
        (brightness > 240 && saturation < 0.2) ||
        (minDistance < 30);
      
      let finalAlpha = originalAlpha;
      if (isBackground) {
        const transparencyFactor = calculateTransparencyFactor(brightness, saturation, minDistance);
        finalAlpha = Math.max(0, originalAlpha * (1 - transparencyFactor));
      } else {
        // Enhance contrast for logo content
        const contrastBoost = 1.1;
        processedData[pixelIndex] = Math.min(255, r * contrastBoost);
        processedData[pixelIndex + 1] = Math.min(255, g * contrastBoost);
        processedData[pixelIndex + 2] = Math.min(255, b * contrastBoost);
      }
      
      if (!isBackground) {
        processedData[pixelIndex] = r;
        processedData[pixelIndex + 1] = g;
        processedData[pixelIndex + 2] = b;
      }
      processedData[pixelIndex + 3] = finalAlpha;
    }
    
    // Create final image
    const result = await sharp(processedData, {
      raw: {
        width: width,
        height: height,
        channels: 4
      }
    })
    .png()
    .toBuffer();
    
    console.log(`✅ Processed successfully with transparency`);
    
    return {
      success: true,
      buffer: result,
      metadata: { width, height, channels: 4, format: 'png' }
    };
    
  } catch (error) {
    console.error(`❌ Error processing ${name}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main processing function
 */
async function main() {
  console.log('🚀 Processing all vendor logos with enhanced transparency algorithm...');
  
  // Create output directory
  const outputDir = './processed-transparent-logos';
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  } catch {
    console.log(`📁 Output directory exists: ${outputDir}`);
  }
  
  const results = [];
  
  for (let i = 0; i < VENDOR_LOGOS.length; i++) {
    const logo = VENDOR_LOGOS[i];
    console.log(`\n🏷️  Processing ${i + 1}/${VENDOR_LOGOS.length}: ${logo.name}`);
    console.log('=' .repeat(60));
    
    try {
      // Download the image
      const imageBuffer = await downloadImage(logo.url);
      
      // Process for transparency
      const result = await processLogoTransparency(imageBuffer, logo.name);
      
      if (result.success) {
        // Save the processed image
        const fileName = `${logo.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-transparent.png`;
        const filePath = path.join(outputDir, fileName);
        
        await fs.writeFile(filePath, result.buffer);
        console.log(`💾 Saved: ${fileName}`);
        
        results.push({
          name: logo.name,
          originalUrl: logo.url,
          processedFile: fileName,
          success: true
        });
      } else {
        results.push({
          name: logo.name,
          originalUrl: logo.url,
          success: false,
          error: result.error
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ Failed to process ${logo.name}:`, error.message);
      results.push({
        name: logo.name,
        originalUrl: logo.url,
        success: false,
        error: error.message
      });
    }
  }
  
  // Generate summary report
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('\n🎉 Processing Complete!');
  console.log('=' .repeat(60));
  console.log(`✅ Successfully processed: ${successful.length}/${VENDOR_LOGOS.length} logos`);
  console.log(`❌ Failed: ${failed.length}/${VENDOR_LOGOS.length} logos`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed logos:');
    failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }
  
  // Save results report
  const reportPath = path.join(outputDir, 'processing-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📋 Report saved: ${reportPath}`);
  console.log(`📁 Processed logos available in: ${outputDir}/`);
}

main().catch(console.error);