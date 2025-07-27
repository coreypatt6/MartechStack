// Bulk Logo Updater
// Automatically update all vendor logos using the corporate logo fetcher

import { batchFetchCorporateLogos, generateHighQualityFallback, LogoFetchResult } from './corporateLogoFetcher';
import { Vendor, VendorLogoUpdate } from '../types/vendor';

export interface BulkUpdateResult {
  totalProcessed: number;
  successfulUpdates: number;
  failedUpdates: number;
  skippedVendors: number;
  results: VendorLogoUpdate[];
}

export interface BulkUpdateOptions {
  skipExistingLogos: boolean;
  minimumConfidence: number;
  useFallbackForFailed: boolean;
  batchSize: number;
  delayBetweenBatches: number;
}

// Default options for bulk updates
export const DEFAULT_BULK_OPTIONS: BulkUpdateOptions = {
  skipExistingLogos: true,
  minimumConfidence: 60,
  useFallbackForFailed: true,
  batchSize: 10,
  delayBetweenBatches: 1000
};

// Function to check if a vendor needs a logo update
function needsLogoUpdate(vendor: Vendor, skipExisting: boolean): boolean {
  if (!skipExisting) return true;
  
  return !vendor.logo || 
         vendor.logo.includes('placeholder.com') || 
         vendor.logo.includes('via.placeholder') ||
         vendor.logo === '';
}

// Function to process vendors in batches
async function processBatch(
  vendors: Vendor[],
  options: BulkUpdateOptions,
  onProgress?: (progress: { completed: number; total: number; current: string; batch: number }) => void
): Promise<Array<{ vendorId: string; result: LogoFetchResult }>> {
  const results: Array<{ vendorId: string; result: LogoFetchResult }> = [];
  
  for (let i = 0; i < vendors.length; i += options.batchSize) {
    const batch = vendors.slice(i, i + options.batchSize);
    const batchNumber = Math.floor(i / options.batchSize) + 1;
    
    console.log(`Processing batch ${batchNumber} (${batch.length} vendors)`);
    
    const batchResults = await batchFetchCorporateLogos(
      batch.map(v => ({ id: v.id, name: v.name, categories: v.categories })),
      {
        useWebScraping: true,
        preferHighQuality: true,
        timeoutMs: 8000,
        maxRetries: 2
      },
      (completed, total, current) => {
        if (onProgress) {
          onProgress({
            completed: i + completed,
            total: vendors.length,
            current,
            batch: batchNumber
          });
        }
      }
    );
    
    results.push(...batchResults);
    
    // Delay between batches to be respectful to servers
    if (i + options.batchSize < vendors.length) {
      console.log(`Waiting ${options.delayBetweenBatches}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, options.delayBetweenBatches));
    }
  }
  
  return results;
}

// Main function to bulk update all vendor logos
export async function bulkUpdateAllVendorLogos(
  vendors: Vendor[],
  options: Partial<BulkUpdateOptions> = {},
  onProgress?: (progress: { 
    completed: number; 
    total: number; 
    current: string; 
    batch?: number;
    phase: 'analyzing' | 'fetching' | 'updating' | 'complete';
  }) => void
): Promise<BulkUpdateResult> {
  const finalOptions = { ...DEFAULT_BULK_OPTIONS, ...options };
  
  console.log('🚀 Starting bulk logo update for', vendors.length, 'vendors');
  console.log('Options:', finalOptions);
  
  // Phase 1: Analyze which vendors need updates
  if (onProgress) onProgress({ completed: 0, total: vendors.length, current: 'Analyzing vendors...', phase: 'analyzing' });
  
  const vendorsNeedingUpdate = vendors.filter(vendor => 
    needsLogoUpdate(vendor, finalOptions.skipExistingLogos)
  );
  
  console.log(`📊 Analysis: ${vendorsNeedingUpdate.length}/${vendors.length} vendors need logo updates`);
  
  if (vendorsNeedingUpdate.length === 0) {
    return {
      totalProcessed: vendors.length,
      successfulUpdates: 0,
      failedUpdates: 0,
      skippedVendors: vendors.length,
      results: vendors.map(vendor => ({
        vendorId: vendor.id,
        vendorName: vendor.name,
        status: 'skipped' as const,
        previousLogo: vendor.logo,
        newLogo: vendor.logo,
        source: 'skipped',
        confidence: 100
      }))
    };
  }
  
  // Phase 2: Fetch logos
  if (onProgress) onProgress({ completed: 0, total: vendorsNeedingUpdate.length, current: 'Starting logo fetch...', phase: 'fetching' });
  
  const fetchResults = await processBatch(vendorsNeedingUpdate, finalOptions, (progress) => {
    if (onProgress) {
      onProgress({
        ...progress,
        total: vendorsNeedingUpdate.length,
        phase: 'fetching'
      });
    }
  });
  
  // Phase 3: Process results and update vendors
  if (onProgress) onProgress({ completed: 0, total: vendorsNeedingUpdate.length, current: 'Processing results...', phase: 'updating' });
  
  const updateResults: BulkUpdateResult['results'] = [];
  let successfulUpdates = 0;
  let failedUpdates = 0;
  
  for (const vendor of vendors) {
    const fetchResult = fetchResults.find(r => r.vendorId === vendor.id);
    
    if (!fetchResult) {
      // Vendor was skipped
      updateResults.push({
        vendorId: vendor.id,
        vendorName: vendor.name,
        status: 'skipped',
        previousLogo: vendor.logo,
        newLogo: vendor.logo,
        source: 'skipped',
        confidence: 100
      });
      continue;
    }
    
    const result = fetchResult.result;
    
    if (result.logoUrl && result.confidence >= finalOptions.minimumConfidence) {
      // Successful logo fetch
      updateResults.push({
        vendorId: vendor.id,
        vendorName: vendor.name,
        status: 'success',
        previousLogo: vendor.logo,
        newLogo: result.logoUrl,
        source: result.source,
        confidence: result.confidence
      });
      successfulUpdates++;
    } else if (finalOptions.useFallbackForFailed) {
      // Use high-quality fallback
      const fallbackLogo = generateHighQualityFallback(
        vendor.name,
        vendor.categories[0] || 'default'
      );
      
      updateResults.push({
        vendorId: vendor.id,
        vendorName: vendor.name,
        status: 'success',
        previousLogo: vendor.logo,
        newLogo: fallbackLogo,
        source: 'High-Quality Fallback',
        confidence: 50
      });
      successfulUpdates++;
    } else {
      // Failed to fetch logo
      updateResults.push({
        vendorId: vendor.id,
        vendorName: vendor.name,
        status: 'failed',
        previousLogo: vendor.logo,
        newLogo: vendor.logo,
        source: result.source,
        confidence: result.confidence,
        error: result.error
      });
      failedUpdates++;
    }
  }
  
  if (onProgress) onProgress({ completed: vendors.length, total: vendors.length, current: 'Complete!', phase: 'complete' });
  
  const finalResult: BulkUpdateResult = {
    totalProcessed: vendors.length,
    successfulUpdates,
    failedUpdates,
    skippedVendors: vendors.length - vendorsNeedingUpdate.length,
    results: updateResults
  };
  
  console.log('✅ Bulk update complete!', finalResult);
  
  return finalResult;
}

// Function to apply bulk update results to vendor array
export function applyBulkUpdateResults(vendors: Vendor[], bulkResult: BulkUpdateResult): Vendor[] {
  return vendors.map(vendor => {
    const updateResult = bulkResult.results.find(r => r.vendorId === vendor.id);
    
    if (updateResult && updateResult.status === 'success' && updateResult.newLogo !== updateResult.previousLogo) {
      return {
        ...vendor,
        logo: updateResult.newLogo,
        logoSource: updateResult.source,
        logoConfidence: updateResult.confidence,
        logoUpdatedAt: new Date().toISOString()
      };
    }
    
    return vendor;
  });
}

// Function to generate a detailed report
export function generateBulkUpdateReport(bulkResult: BulkUpdateResult): string {
  const { totalProcessed, successfulUpdates, failedUpdates, skippedVendors, results } = bulkResult;
  
  const successfulResults = results.filter(r => r.status === 'success');
  const failedResults = results.filter(r => r.status === 'failed');
  
  const report = `
# Bulk Logo Update Report

## Summary
- **Total Vendors Processed**: ${totalProcessed}
- **Successful Updates**: ${successfulUpdates} (${Math.round((successfulUpdates / totalProcessed) * 100)}%)
- **Failed Updates**: ${failedUpdates}
- **Skipped Vendors**: ${skippedVendors}

## Success Rate by Source
${getSuccessRateBySource(successfulResults)}

## Successful Updates
${successfulResults.map(r => 
  `- **${r.vendorName}**: Found via ${r.source} (${r.confidence}% confidence)`
).join('\n')}

## Failed Updates
${failedResults.map(r => 
  `- **${r.vendorName}**: ${r.error || 'No logo found'}`
).join('\n')}

---
Report generated: ${new Date().toLocaleString()}
  `.trim();
  
  return report;
}

function getSuccessRateBySource(successfulResults: BulkUpdateResult['results']): string {
  const sourceCounts: Record<string, number> = {};
  
  successfulResults.forEach(result => {
    sourceCounts[result.source] = (sourceCounts[result.source] || 0) + 1;
  });
  
  return Object.entries(sourceCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([source, count]) => `- **${source}**: ${count} logos`)
    .join('\n');
}

// Export utility functions
export { needsLogoUpdate, processBatch };