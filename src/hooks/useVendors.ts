import { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { mockVendors } from '../data/mockData';

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

let vendorStorage: Vendor[] = initializeStorage();

// Save to localStorage whenever vendors change
const saveToStorage = (vendors: Vendor[]) => {
  try {
    localStorage.setItem('martech-vendors', JSON.stringify(vendors));
  } catch (error) {
    console.error('Error saving vendors to storage:', error);
  }
};

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>(vendorStorage);

  // Sync state with storage when it changes
  useEffect(() => {
    setVendors(vendorStorage);
  }, []);

  const addVendor = (vendor: Vendor) => {
    const newVendors = [...vendorStorage, vendor];
    vendorStorage = newVendors;
    saveToStorage(newVendors);
    setVendors(newVendors);
    console.log('Vendor added:', vendor.name, 'Logo URL:', vendor.logo, 'Total vendors:', newVendors.length);
  };

  const updateVendor = (id: string, updatedVendor: Vendor) => {
    const newVendors = vendorStorage.map(v => v.id === id ? updatedVendor : v);
    vendorStorage = newVendors;
    saveToStorage(newVendors);
    setVendors(newVendors);
    console.log('Vendor updated:', updatedVendor.name, 'Logo URL:', updatedVendor.logo, 'Total vendors:', newVendors.length);
  };

  const deleteVendor = (id: string) => {
    const newVendors = vendorStorage.filter(v => v.id !== id);
    vendorStorage = newVendors;
    saveToStorage(newVendors);
    setVendors(newVendors);
    console.log('Vendor deleted, Total vendors:', newVendors.length);
  };

  return {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor
  };
};