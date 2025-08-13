#!/usr/bin/env node

/**
 * Update vendor logo URLs to use processed transparent versions
 */

import fs from 'fs/promises';
import path from 'path';

// Logo mapping from company domains to processed files
const LOGO_MAPPING = {
  'salesforce.com': ['salesforce-cdp-transparent.png', 'salesforce-service-cloud-transparent.png'],
  'adobe.com': ['adobe-experience-platform-transparent.png', 'adobe-analytics-transparent.png'],
  'segment.com': 'segment-transparent.png',
  'tealium.com': 'tealium-transparent.png',
  'mailchimp.com': 'mailchimp-transparent.png',
  'sendgrid.com': 'sendgrid-transparent.png',
  'klaviyo.com': 'klaviyo-transparent.png',
  'twilio.com': 'twilio-transparent.png',
  'braze.com': 'braze-transparent.png',
  'google.com': ['google-analytics-transparent.png', 'google-ads-transparent.png'],
  'mixpanel.com': 'mixpanel-transparent.png',
  'amplitude.com': 'amplitude-transparent.png',
  'hotjar.com': 'hotjar-transparent.png',
  'optimizely.com': 'optimizely-transparent.png',
  'contentful.com': 'contentful-transparent.png',
  'wordpress.com': 'wordpress-transparent.png',
  'hootsuite.com': 'hootsuite-transparent.png',
  'buffer.com': 'buffer-transparent.png',
  'sproutsocial.com': 'sprout-social-transparent.png',
  'brandwatch.com': 'brandwatch-transparent.png',
  'mention.com': 'mention-transparent.png',
  'zendesk.com': 'zendesk-transparent.png',
  'intercom.com': 'intercom-transparent.png',
  'freshworks.com': 'freshworks-transparent.png',
  'hubspot.com': 'hubspot-transparent.png',
  'livechat.com': 'livechat-transparent.png',
  'facebook.com': 'facebook-ads-transparent.png',
  'linkedin.com': 'linkedin-ads-transparent.png',
  'thetradedesk.com': 'the-trade-desk-transparent.png',
  'amazon.com': 'amazon-dsp-transparent.png',
  'liveramp.com': 'liveramp-transparent.png',
  'cision.com': 'cision-transparent.png'
};

async function updateVendorLogos() {
  console.log('🔄 Updating vendor logos to use transparent versions...');
  
  try {
    // Read the current mockData.ts file
    const mockDataPath = './src/data/mockData.ts';
    let content = await fs.readFile(mockDataPath, 'utf-8');
    
    console.log('📂 Read mockData.ts successfully');
    
    // Copy processed logos to public directory
    const publicLogosDir = './public/logos';
    try {
      await fs.mkdir(publicLogosDir, { recursive: true });
      console.log('📁 Created public/logos directory');
    } catch {
      console.log('📁 Public/logos directory already exists');
    }
    
    // Copy all processed logos to public directory
    const processedDir = './processed-transparent-logos';
    const files = await fs.readdir(processedDir);
    const logoFiles = files.filter(f => f.endsWith('.png'));
    
    console.log(`📋 Copying ${logoFiles.length} processed logos to public directory...`);
    
    for (const file of logoFiles) {
      const sourcePath = path.join(processedDir, file);
      const destPath = path.join(publicLogosDir, file);
      await fs.copyFile(sourcePath, destPath);
      console.log(`✅ Copied: ${file}`);
    }
    
    // Update logo URLs in the content
    console.log('🔗 Updating logo URLs in mockData.ts...');
    
    let updatedCount = 0;
    for (const [domain, logoFile] of Object.entries(LOGO_MAPPING)) {
      const oldPattern = new RegExp(`https://logo\\.clearbit\\.com/${domain.replace('.', '\\.')}`, 'g');
      
      if (Array.isArray(logoFile)) {
        // For domains with multiple logos (like Salesforce, Google), we'll use the first one
        // In a real implementation, you'd want to map specific vendors to specific logos
        const newUrl = `/logos/${logoFile[0]}`;
        const matches = content.match(oldPattern);
        if (matches) {
          content = content.replace(oldPattern, newUrl);
          updatedCount += matches.length;
          console.log(`🔄 Updated ${matches.length} occurrences of ${domain} to ${newUrl}`);
        }
      } else {
        const newUrl = `/logos/${logoFile}`;
        const matches = content.match(oldPattern);
        if (matches) {
          content = content.replace(oldPattern, newUrl);
          updatedCount += matches.length;
          console.log(`🔄 Updated ${matches.length} occurrences of ${domain} to ${newUrl}`);
        }
      }
    }
    
    // Write the updated content back
    await fs.writeFile(mockDataPath, content, 'utf-8');
    
    console.log('🎉 Update complete!');
    console.log(`✅ Updated ${updatedCount} logo URLs to use transparent versions`);
    console.log('📁 Transparent logos are now available in /public/logos/');
    console.log('🚀 You can now rebuild and run the application to see the transparent logos');
    
  } catch (error) {
    console.error('❌ Error updating vendor logos:', error.message);
    process.exit(1);
  }
}

updateVendorLogos();