#!/usr/bin/env node

// Simple test script to process Salesforce logos and ensure transparent backgrounds
// Using CommonJS imports to avoid TypeScript compilation issues

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SALESFORCE_LOGOS = [
  {
    name: 'Salesforce Primary',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg'
  },
  {
    name: 'Slack',
    url: 'https://a.slack-edge.com/80588/marketing/img/logos/company/slack-logo.png'
  }
];

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

async function processLogo(imageBuffer, name) {
  try {
    // Get metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`📊 Original: ${metadata.width}x${metadata.height}, ${metadata.channels} channels, ${metadata.format}`);
    
    // Process the image to ensure transparency
    let processedImage = sharp(imageBuffer);
    
    // If it's not already transparent (no alpha channel), process it
    if (metadata.channels < 4 && metadata.format !== 'svg') {
      console.log('🎨 Adding transparency...');
      
      // For JPG/PNG without alpha, remove white background
      processedImage = processedImage
        .png() // Convert to PNG for transparency support
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true });
      
      // Create a simple white background removal
      // This is a basic approach - more sophisticated methods exist
      if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
        // For JPEG, we'll use a threshold approach
        processedImage = processedImage
          .threshold(240) // Convert near-white to pure white
          .negate()       // Invert
          .threshold(15)  // Threshold to create mask
          .negate();      // Invert back
      }
    } else {
      console.log('✅ Already has transparency or is SVG');
      // Just ensure it's PNG format for consistency
      processedImage = processedImage
        .png()
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true });
    }
    
    const result = await processedImage.toBuffer();
    const finalMetadata = await sharp(result).metadata();
    
    console.log(`📊 Processed: ${finalMetadata.width}x${finalMetadata.height}, ${finalMetadata.channels} channels, ${finalMetadata.format}`);
    
    return {
      success: true,
      buffer: result,
      metadata: finalMetadata
    };
    
  } catch (error) {
    console.error(`❌ Error processing ${name}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🔥 Testing Salesforce logo transparency processing...');
  
  // Create output directory
  const outputDir = './processed-logos';
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  } catch {
    console.log(`📁 Output directory exists: ${outputDir}`);
  }
  
  for (const logo of SALESFORCE_LOGOS) {
    console.log(`\n🏷️  Processing: ${logo.name}`);
    console.log('=' .repeat(40));
    
    try {
      // Download the image
      const imageBuffer = await downloadImage(logo.url);
      
      // Process for transparency
      const result = await processLogo(imageBuffer, logo.name);
      
      if (result.success) {
        // Save the processed image
        const fileName = `${logo.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-transparent.png`;
        const filePath = path.join(outputDir, fileName);
        
        await fs.writeFile(filePath, result.buffer);
        console.log(`💾 Saved: ${fileName}`);
        console.log(`✅ Transparency: ${result.metadata.channels === 4 ? 'Yes' : 'No'}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to process ${logo.name}:`, error.message);
    }
  }
  
  console.log('\n🎉 Processing complete!');
  console.log('\n📋 Check the processed-logos/ directory for transparent PNG files.');
}

main().catch(console.error);