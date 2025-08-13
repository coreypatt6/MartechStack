#!/usr/bin/env node

/**
 * Add cache-busting parameters to logo URLs to force browser refresh
 */

import fs from 'fs/promises';

async function addCacheBusting() {
  console.log('🔄 Adding cache-busting to logo URLs...');
  
  try {
    const mockDataPath = './src/data/mockData.ts';
    let content = await fs.readFile(mockDataPath, 'utf-8');
    
    // Add cache-busting parameter to all /logos/ URLs
    content = content.replace(/\/logos\/([^'"?]+)\.png/g, '/logos/$1.png?v=1');
    
    await fs.writeFile(mockDataPath, content, 'utf-8');
    
    console.log('✅ Cache-busting parameters added to all logo URLs');
    
  } catch (error) {
    console.error('❌ Error adding cache-busting:', error.message);
  }
}

addCacheBusting();