import { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { GitHubSync } from '../utils/githubSync';
import { processAllLogosForTransparency, processSingleLogoForTransparency } from '../utils/logoTransparencyProcessor';

// Initialize storage (no mock data fallback)
const initializeStorage = () => {
  const stored = localStorage.getItem('martech-vendors');
  if (stored) {
    try {
      const vendors = JSON.parse(stored);
      
      // Check if we have too many vendors (indicates old data)
      if (vendors.length > 50) {
        console.log('🗑️ Clearing outdated vendor data from localStorage (found', vendors.length, 'vendors, expected ≤50)');
        localStorage.removeItem('martech-vendors');
        return [];
      }
      
      // Check for processed blob URLs (indicates transparency processing was applied)
      const hasProcessedLogos = vendors.some((vendor: Vendor) => 
        vendor.logo && vendor.logo.startsWith('blob:')
      );
      
      if (hasProcessedLogos) {
        console.log('🗑️ Clearing vendors with processed blob logos to restore original SVGs');
        localStorage.removeItem('martech-vendors');
        return [];
      }
      
      // Check for broken/old logo URLs and force refresh (but keep dummyimage URLs)
      const hasBrokenLogos = vendors.some((vendor: Vendor) => 
        vendor.logo && (
          vendor.logo.includes('adswerve.com') ||
          vendor.logo.includes('alchemer.com') ||
          vendor.logo.includes('ayzenberg.com') ||
          vendor.logo.includes('deltadna.com') ||
          vendor.logo.includes('directly.com') ||
          vendor.logo.includes('helpshift.com') ||
          vendor.logo.includes('infosum.com') ||
          vendor.logo.includes('levelupanalytics.com') ||
          vendor.logo.includes('lotusthemes.com') ||
          vendor.logo.includes('movableink.com') ||
          vendor.logo.includes('muckrack.com') ||
          vendor.logo.includes('prmanager.com') ||
          vendor.logo.includes('quiq.com') ||
          vendor.logo.includes('rightpoint.com') ||
          vendor.logo.includes('screenengine.com') ||
          vendor.logo.includes('statuspage.io') ||
          vendor.logo.includes('streamhatchet.com') ||
          vendor.logo.includes('treasuredata.com') ||
          vendor.logo.includes('tubularlabs.com') ||
          vendor.logo.includes('via.placeholder.com')
        ) && !vendor.logo.includes('dummyimage.com')
      );
      
      if (hasBrokenLogos) {
        console.log('🗑️ Clearing localStorage with old broken logo URLs - forcing fresh data load');
        localStorage.removeItem('martech-vendors');
        return [];
      }
      
      // Clean up any blob URLs that are no longer valid
      return vendors.map((vendor: Vendor) => ({
        ...vendor,
        logo: vendor.logo && vendor.logo.startsWith('blob:') 
          ? 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo' 
          : vendor.logo,
        label: Array.isArray(vendor.label) 
          ? vendor.label 
          : typeof vendor.label === 'string' 
            ? [vendor.label] 
            : []
      }));
    } catch (error) {
      console.error('Error parsing stored vendors:', error);
    }
  }
  return [];
};

// GitHub sync instance
const githubSync = new GitHubSync();

let vendorStorage: Vendor[] = initializeStorage();

// Save to localStorage whenever vendors change
const saveToStorage = (vendors: Vendor[]) => {
  try {
    localStorage.setItem('martech-vendors', JSON.stringify(vendors));
  } catch (error) {
    console.error('Error saving vendors to storage:', error);
  }
};

// Save to GitHub whenever vendors change
const saveToGitHub = async (vendors: Vendor[]) => {
  try {
    console.log('☁️ Attempting GitHub cloud sync...');
    await githubSync.saveVendors(vendors);
    console.log('✅ GitHub sync completed successfully - vendors saved to cloud!');
  } catch (error) {
    console.error('❌ GitHub sync failed:', error.message);
    if (error.message.includes('token')) {
      console.log('🔑 GitHub sync requires authentication:');
      console.log('   • Create Personal Access Token at: https://github.com/settings/tokens');
      console.log('   • Add to .env.local: VITE_GITHUB_TOKEN=your_token');
      console.log('   • Restart server: npm run dev');
    }
    console.log('💾 Vendors saved to local storage only');
  }
};

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>(vendorStorage);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isProcessingLogos, setIsProcessingLogos] = useState(false);

  // Sync state with storage when it changes
  useEffect(() => {
    setVendors(vendorStorage);
  }, []);

  // Load vendors from GitHub on first load and process logos for transparency
  useEffect(() => {
    const loadFromGitHub = async () => {
      try {
        console.log('🚀 Initializing GitHub cloud sync...');
        console.log('🔍 Checking for existing vendor data in GitHub repository...');
        setIsSyncing(true);
        const githubVendors = await githubSync.loadVendors();
        if (githubVendors && githubVendors.length > 0) {
          console.log('📥 Successfully loaded', githubVendors.length, 'vendors from GitHub repository');
          console.log('🔄 Replacing local storage with GitHub data for consistency');
          vendorStorage = githubVendors;
          saveToStorage(githubVendors);
          setVendors(githubVendors);
          setLastSyncTime(new Date());
          console.log('✅ Cross-device sync complete - vendors now synchronized');
          
          // Skip automatic logo transparency processing to preserve SVG quality
          // await processLogosForTransparency(githubVendors);
        } else {
          console.log('📝 No vendor data found in GitHub repository');
          console.log('💾 Checking local storage data...');
          
          if (vendorStorage.length === 0) {
            console.log('📁 Loading vendor data from static file...');
            try {
              // Load from static vendors.json file as fallback with cache busting
              const response = await fetch(`/data/vendors.json?v=${Date.now()}`);
              if (response.ok) {
                const staticData = await response.json();
                const staticVendors = staticData.vendors || [];
                console.log('✅ Successfully loaded', staticVendors.length, 'vendors from static file');
                vendorStorage = staticVendors;
                saveToStorage(staticVendors);
                setVendors(staticVendors);
                // Skip transparency processing for clean SVG display
                // await processLogosForTransparency(staticVendors);
              }
            } catch (staticError) {
              console.log('⚠️ Could not load from static file:', staticError.message);
            }
          } else {
            console.log('🔧 Using existing local storage data:', vendorStorage.length, 'vendors');
            // Skip transparency processing for clean SVG display
            // await processLogosForTransparency(vendorStorage);
          }
        }
      } catch (error) {
        console.log('⚠️ Could not load from GitHub repository:', error.message);
        console.log('💾 Checking local storage and static fallback...');
        
        if (vendorStorage.length === 0) {
          console.log('📁 Loading vendor data from static file as fallback...');
          try {
            // Load from static vendors.json file as final fallback with cache busting
            const response = await fetch(`/data/vendors.json?v=${Date.now()}`);
            if (response.ok) {
              const staticData = await response.json();
              const staticVendors = staticData.vendors || [];
              console.log('✅ Successfully loaded', staticVendors.length, 'vendors from static file');
              vendorStorage = staticVendors;
              saveToStorage(staticVendors);
              setVendors(staticVendors);
              // Skip transparency processing for clean SVG display
              // await processLogosForTransparency(staticVendors);
            }
          } catch (staticError) {
            console.log('❌ All data sources failed:', staticError.message);
          }
        } else {
          console.log('🔧 Using local storage data:', vendorStorage.length, 'vendors');
          // Skip transparency processing for clean SVG display
          // await processLogosForTransparency(vendorStorage);
        }
      } finally {
        setIsSyncing(false);
      }
    };

    loadFromGitHub();
  }, []);

  // Function to automatically process logos for transparency
  const processLogosForTransparency = async (vendorsToProcess: Vendor[]) => {
    console.log('🎨 Starting automatic logo transparency processing...');
    setIsProcessingLogos(true);
    
    try {
      const result = await processAllLogosForTransparency(vendorsToProcess);
      
      if (result.processedCount > 0) {
        console.log(`✅ Successfully processed ${result.processedCount} logos for transparency`);
        
        // Update vendors with transparent logos
        vendorStorage = result.updatedVendors;
        saveToStorage(result.updatedVendors);
        setVendors(result.updatedVendors);
        
        // Sync to GitHub
        await syncToGitHub(result.updatedVendors);
      } else {
        console.log('📋 No logos needed transparency processing');
      }
      
      if (result.errors.length > 0) {
        console.warn('⚠️ Some logos had processing errors:', result.errors);
      }
    } catch (error) {
      console.error('❌ Error during automatic logo transparency processing:', error);
    } finally {
      setIsProcessingLogos(false);
    }
  };

  const syncToGitHub = async (newVendors: Vendor[]) => {
    setIsSyncing(true);
    try {
      console.log('☁️ Syncing', newVendors.length, 'vendors to GitHub repository...');
      await saveToGitHub(newVendors);
      setLastSyncTime(new Date());
      console.log('✅ GitHub sync completed successfully - data now available on all devices!');
    } catch (error) {
      console.error('❌ GitHub sync failed:', error);
      // Don't throw the error - let the operation continue
    } finally {
      setIsSyncing(false);
    }
  };

  const addVendor = async (vendor: Vendor) => {
    // Skip logo transparency processing to preserve quality
    const processedVendor = vendor;
    
    const newVendors = [...vendorStorage, processedVendor];
    vendorStorage = newVendors;
    saveToStorage(newVendors);
    setVendors(newVendors);
    // Sync to GitHub but don't block the operation if it fails
    syncToGitHub(newVendors).catch(() => {
      // Sync failed but vendor was still added locally
    });
    console.log('➕ Vendor added:', processedVendor.name, '| Total vendors:', newVendors.length);
  };

  const updateVendor = async (id: string, updatedVendor: Vendor) => {
    // Skip logo transparency processing to preserve quality
    const processedVendor = updatedVendor;
    
    const newVendors = vendorStorage.map(v => v.id === id ? processedVendor : v);
    vendorStorage = newVendors;
    saveToStorage(newVendors);
    setVendors(newVendors);
    // Sync to GitHub but don't block the operation if it fails
    syncToGitHub(newVendors).catch(() => {
      // Sync failed but vendor was still updated locally
    });
    console.log('✏️ Vendor updated:', processedVendor.name, '| Total vendors:', newVendors.length);
  };

  const deleteVendor = (id: string) => {
    const newVendors = vendorStorage.filter(v => v.id !== id);
    vendorStorage = newVendors;
    saveToStorage(newVendors);
    setVendors(newVendors);
    // Sync to GitHub but don't block the operation if it fails
    syncToGitHub(newVendors).catch(() => {
      // Sync failed but vendor was still deleted locally
    });
    console.log('Vendor deleted, Total vendors:', newVendors.length);
  };

  const bulkAddVendors = (newVendors: Vendor[]) => {
    const updatedVendors = [...vendorStorage, ...newVendors];
    vendorStorage = updatedVendors;
    saveToStorage(updatedVendors);
    setVendors(updatedVendors);
    console.log('Bulk vendors added:', newVendors.length, 'Total vendors:', updatedVendors.length);
  };

  const clearAllVendors = () => {
    vendorStorage = [];
    saveToStorage([]);
    setVendors([]);
    // Sync to GitHub but don't block the operation if it fails
    syncToGitHub([]).catch(() => {
      // Sync failed but vendors were still cleared locally
    });
    console.log('All vendors cleared');
  };


  const manualSync = async () => {
    console.log('🔄 Manual sync initiated - forcing sync of current vendor data');
    console.log('📊 Current vendors to sync:', vendors.length);
    console.log('📝 Vendors being synced:', vendors.map(v => ({ name: v.name, id: v.id, status: v.deploymentStatus })));
    try {
      await syncToGitHub(vendors);
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error; // Re-throw for manual sync since user explicitly requested it
    }
  };

  return {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    bulkAddVendors,
    clearAllVendors,
    manualSync,
    isSyncing,
    lastSyncTime,
    isProcessingLogos,
    processLogosForTransparency
  };
};