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
    await githubSync.saveVendors(vendors);
    console.log('Vendors synced to GitHub successfully');
  } catch (error) {
    console.error('Error syncing vendors to GitHub:', error);
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
        setIsSyncing(true);
        const githubVendors = await githubSync.loadVendors();
        if (githubVendors && githubVendors.length > 0) {
          console.log('📥 Loaded', githubVendors.length, 'vendors from GitHub cloud');
          vendorStorage = githubVendors;
          saveToStorage(githubVendors);
          setVendors(githubVendors);
          setLastSyncTime(new Date());
        } else {
          console.log('📝 No vendors found in GitHub, using local data');
        }
      } catch (error) {
        console.log('⚠️ GitHub sync unavailable, using local storage:', error.message);
      } finally {
        setIsSyncing(false);
      }
    };

    loadFromGitHub();
  }, []);

  const syncToGitHub = async (newVendors: Vendor[]) => {
    setIsSyncing(true);
    try {
      console.log('☁️ Syncing', newVendors.length, 'vendors to GitHub...');
      await saveToGitHub(newVendors);
      setLastSyncTime(new Date());
      console.log('✅ GitHub sync completed successfully!');
    } catch (error) {
      console.error('❌ GitHub sync failed:', error);
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