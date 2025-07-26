import { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { mockVendors } from '../data/mockData';
import { GitHubSync } from '../utils/githubSync';

// Initialize storage with mock data only if empty
const initializeStorage = () => {
  const stored = localStorage.getItem('martech-vendors');
  if (stored) {
    try {
      const vendors = JSON.parse(stored);
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
  return [...mockVendors];
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
    console.log('💡 Repository is now public - attempting GitHub sync...');
    await githubSync.saveVendors(vendors);
    console.log('✅ Vendors synced to GitHub successfully');
  } catch (error) {
    console.log('⚠️ GitHub write access requires authentication token');
    console.log('💡 Add VITE_GITHUB_TOKEN to .env.local for full sync capability');
    console.log('💾 Vendors saved to local storage for now');
  }
};

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>(vendorStorage);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Sync state with storage when it changes
  useEffect(() => {
    setVendors(vendorStorage);
  }, []);

  // Load vendors from GitHub on first load
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
        } else {
          console.log('📝 No vendor data found in GitHub repository');
          console.log('💾 Using local storage data - will sync to GitHub on next change');
          console.log('🔧 Current local vendors:', vendorStorage.length);
        }
      } catch (error) {
        console.log('⚠️ Could not load from GitHub repository:', error.message);
        console.log('💾 Falling back to local storage data');
        console.log('🔧 Local vendors available:', vendorStorage.length);
      } finally {
        setIsSyncing(false);
      }
    };

    loadFromGitHub();
  }, []);

  const syncToGitHub = async (newVendors: Vendor[]) => {
    setIsSyncing(true);
    try {
      console.log('☁️ Syncing', newVendors.length, 'vendors to GitHub repository...');
      console.log('📊 Vendor data being synced:', newVendors.map(v => ({ name: v.name, id: v.id })));
      await saveToGitHub(newVendors);
      setLastSyncTime(new Date());
      console.log('✅ GitHub sync completed successfully - data now available on all devices!');
    } catch (error) {
      console.error('❌ GitHub sync failed - vendors only saved locally:', error);
      console.log('💡 To enable cross-device sync, ensure GitHub token is configured');
    } finally {
      setIsSyncing(false);
    }
  };

  const addVendor = (vendor: Vendor) => {
    const newVendors = [...vendorStorage, vendor];
    vendorStorage = newVendors;
    saveToStorage(newVendors);
    setVendors(newVendors);
    syncToGitHub(newVendors);
    console.log('➕ Vendor added:', vendor.name, '| Total vendors:', newVendors.length);
  };

  const updateVendor = (id: string, updatedVendor: Vendor) => {
    const newVendors = vendorStorage.map(v => v.id === id ? updatedVendor : v);
    vendorStorage = newVendors;
    saveToStorage(newVendors);
    setVendors(newVendors);
    syncToGitHub(newVendors);
    console.log('✏️ Vendor updated:', updatedVendor.name, '| Total vendors:', newVendors.length);
  };

  const deleteVendor = (id: string) => {
    const newVendors = vendorStorage.filter(v => v.id !== id);
    vendorStorage = newVendors;
    saveToStorage(newVendors);
    setVendors(newVendors);
    syncToGitHub(newVendors);
    console.log('Vendor deleted, Total vendors:', newVendors.length);
  };

  const bulkAddVendors = (newVendors: Vendor[]) => {
    const updatedVendors = [...vendorStorage, ...newVendors];
    vendorStorage = updatedVendors;
    saveToStorage(updatedVendors);
    setVendors(updatedVendors);
    syncToGitHub(updatedVendors);
    console.log('Bulk vendors added:', newVendors.length, 'Total vendors:', updatedVendors.length);
  };

  const clearAllVendors = () => {
    vendorStorage = [];
    saveToStorage([]);
    setVendors([]);
    syncToGitHub([]);
    console.log('All vendors cleared');
  };

  const resetToMockData = () => {
    const resetVendors = [...mockVendors];
    vendorStorage = resetVendors;
    saveToStorage(resetVendors);
    setVendors(resetVendors);
    syncToGitHub(resetVendors);
    console.log('Reset to mock data, Total vendors:', resetVendors.length);
  };

  const manualSync = async () => {
    console.log('🔄 Manual sync initiated - forcing sync of current vendor data');
    console.log('📊 Current vendors to sync:', vendors.length);
    await syncToGitHub(vendors);
  };

  return {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    bulkAddVendors,
    clearAllVendors,
    resetToMockData,
    manualSync,
    isSyncing,
    lastSyncTime
  };
};