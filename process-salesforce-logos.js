#!/usr/bin/env node

// Script to process Salesforce logos and ensure transparent backgrounds
// This script will download, process, and save transparent versions of all Salesforce family logos

import { processSalesforceLogos, checkImageTransparency } from './src/utils/logoBackgroundRemover.js';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('🔥 Processing Salesforce logos for transparent backgrounds...');
  
  // Create output directory
  const outputDir = './processed-logos';
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  } catch (error) {
    console.log(`📁 Output directory already exists: ${outputDir}`);
  }

  try {
    // Process all Salesforce logos
    console.log('🚀 Starting logo processing...');
    const results = await processSalesforceLogos();
    
    console.log('\n📊 Processing Results:');
    console.log('=' .repeat(50));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const { name, result } of results) {
      console.log(`\n🏷️  ${name}:`);
      
      if (result.success && result.processedImageBuffer) {
        successCount++;
        
        // Save the processed image
        const fileName = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-transparent.png`;
        const filePath = path.join(outputDir, fileName);
        
        await fs.writeFile(filePath, result.processedImageBuffer);
        
        console.log(`   ✅ Success - Saved to: ${fileName}`);
        console.log(`   📐 Dimensions: ${result.metadata?.width}x${result.metadata?.height}`);
        console.log(`   🎨 Channels: ${result.metadata?.channels} (Alpha: ${result.metadata?.hasAlpha ? 'Yes' : 'No'})`);
        console.log(`   📁 Format: ${result.originalFormat} → ${result.outputFormat}`);
        
        // Also save base64 data URL for easy use
        const dataUrlFile = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-dataurl.txt`;
        const dataUrlPath = path.join(outputDir, dataUrlFile);
        await fs.writeFile(dataUrlPath, result.processedImageBase64 || '');
        console.log(`   📋 Data URL saved to: ${dataUrlFile}`);
        
      } else {
        errorCount++;
        console.log(`   ❌ Error: ${result.error}`);
      }
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log(`📈 Summary: ${successCount} successful, ${errorCount} failed`);
    
    if (successCount > 0) {
      console.log(`\n📂 All processed logos saved to: ${outputDir}/`);
      console.log('🎯 All logos now have transparent backgrounds and are in PNG format!');
      
      // List all files created
      const files = await fs.readdir(outputDir);
      console.log('\n📋 Files created:');
      files.forEach(file => {
        console.log(`   • ${file}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error processing logos:', error);
    process.exit(1);
  }
}

// Test individual logo transparency checking
async function testTransparencyCheck() {
  console.log('\n🔍 Testing transparency detection...');
  
  const testUrls = [
    'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg', // SVG should have transparency
    'https://www.salesforce.com/news/wp-content/uploads/sites/3/2021/05/Salesforce-logo-1.jpg' // JPG should not
  ];
  
  for (const url of testUrls) {
    try {
      const transparency = await checkImageTransparency(url);
      console.log(`🖼️  ${url.split('/').pop()}:`);
      console.log(`   Format: ${transparency.format}`);
      console.log(`   Transparency: ${transparency.hasTransparency ? 'Yes' : 'No'}`);
      console.log(`   Channels: ${transparency.channels}`);
      console.log(`   Dimensions: ${transparency.dimensions.width}x${transparency.dimensions.height}`);
    } catch (error) {
      console.log(`❌ Error checking ${url}: ${error.message}`);
    }
  }
}

// Run the main processing
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => testTransparencyCheck())
    .then(() => {
      console.log('\n🎉 Logo processing complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}