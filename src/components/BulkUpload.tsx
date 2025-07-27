import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, Eye, Save, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Vendor } from '../types';
import { useVendors } from '../hooks/useVendors';

interface ParsedVendor {
  name: string;
  deploymentStatus: 'Active' | 'Pending' | 'Inactive';
  capabilities: string;
  label: string[];
  annualCost: number;
  renewalDate: string;
  categories: string[];
  errors: string[];
  isValid: boolean;
}

interface UploadStats {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  imported: number;
}

const categoryOptions = [
  'cdp', 'paid-data', 'email', 'web', 'social-publishing', 
  'social-listening', 'talent-influencer', 'pr-comms', 
  'customer-service', 'analytics'
];

const labelOptions = ['2K', 'Rockstar', 'Zynga', 'Ghost Story'];

// Category mapping from display names to internal IDs
const categoryMapping: { [key: string]: string } = {
  'Customer Data Platform': 'cdp',
  'Paid & Data Collaboration': 'paid-data',
  'Email & SMS': 'email',
  'Web': 'web',
  'Social Publishing': 'social-publishing',
  'Social Listening': 'social-listening',
  'Talent & Influencer': 'talent-influencer',
  'PR & Comms': 'pr-comms',
  'Customer Service': 'customer-service',
  'Marketing Analytics': 'analytics',
  // Also accept internal IDs directly
  'cdp': 'cdp',
  'paid-data': 'paid-data',
  'email': 'email',
  'web': 'web',
  'social-publishing': 'social-publishing',
  'social-listening': 'social-listening',
  'talent-influencer': 'talent-influencer',
  'pr-comms': 'pr-comms',
  'customer-service': 'customer-service',
  'analytics': 'analytics'
};

const validCategoryDisplayNames = [
  'Customer Data Platform', 'Paid & Data Collaboration', 'Email & SMS', 'Web',
  'Social Publishing', 'Social Listening', 'Talent & Influencer', 'PR & Comms',
  'Customer Service', 'Marketing Analytics'
];

export const BulkUpload: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { vendors, addVendor } = useVendors();
  const [uploadStep, setUploadStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const [parsedData, setParsedData] = useState<ParsedVendor[]>([]);
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    total: 0, valid: 0, invalid: 0, duplicates: 0, imported: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFetchingProgress, setLogoFetchingProgress] = useState(0);
  const [isUpdatingLogos, setIsUpdatingLogos] = useState(false);

  const generateTemplate = () => {
    const templateData = [
      {
        'Vendor Name': 'Example Vendor',
        'Deployment Status': 'Active',
        'Capabilities': 'Email marketing, automation, A/B testing',
        'Labels': '2K,Rockstar (Optional - defaults to 2K,Rockstar if empty)',
        'Contract Cost': 50000,
        'Renewal Date': '2024-12-31',
        'Category': 'Email & SMS,Marketing Analytics'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendor Template');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Vendor Name
      { wch: 15 }, // Deployment Status
      { wch: 40 }, // Capabilities
      { wch: 15 }, // Labels
      { wch: 12 }, // Contract Cost
      { wch: 12 }, // Renewal Date
      { wch: 25 }  // Category
    ];

    XLSX.writeFile(wb, 'vendor-upload-template.xlsx');
  };

  const validateVendorData = (row: any, rowIndex: number): ParsedVendor => {
    const errors: string[] = [];
    
    // Validate required fields
    if (!row['Vendor Name']?.toString().trim()) {
      errors.push('Vendor Name is required');
    }
    
    if (!row['Deployment Status']) {
      errors.push('Deployment Status is required');
    } else if (!['Active', 'Pending', 'Inactive'].includes(row['Deployment Status'])) {
      errors.push('Deployment Status must be Active, Pending, or Inactive');
    }
    
    if (!row['Capabilities']?.toString().trim()) {
      errors.push('Capabilities are required');
    }
    
    // Handle Contract Cost - default to 0 if blank
    let contractCost = 0;
    if (row['Contract Cost']) {
      contractCost = Number(row['Contract Cost']);
      if (isNaN(contractCost)) {
        errors.push('Contract Cost must be a valid number');
      } else if (contractCost < 0) {
        errors.push('Contract Cost must be positive');
      }
    }
    
    if (contractCost < 0) {
      errors.push('Contract Cost must be positive');
    }
    
    if (!row['Renewal Date']) {
      errors.push('Renewal Date is required');
    } else {
      try {
        // Handle Excel date formats - Excel stores dates as numbers
        let dateValue = row['Renewal Date'];
        let parsedDate: Date;
        
        if (typeof dateValue === 'number') {
          // Excel date serial number (days since 1900-01-01)
          parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
        } else if (typeof dateValue === 'string') {
          parsedDate = new Date(dateValue);
        } else {
          throw new Error('Invalid date format');
        }
        
        if (isNaN(parsedDate.getTime())) {
          errors.push('Invalid Renewal Date format');
        }
      } catch (error) {
        errors.push('Invalid Renewal Date format');
      }
    }

    // Parse and validate labels
    let labels: string[] = [];
    if (row['Labels']) {
      labels = row['Labels'].toString().split(',').map((l: string) => l.trim()).filter(Boolean);
      const invalidLabels = labels.filter(label => !labelOptions.includes(label));
      if (invalidLabels.length > 0) {
        errors.push(`Invalid labels: ${invalidLabels.join(', ')}. Valid options: ${labelOptions.join(', ')}`);
      }
    } else {
      // Default to 2K and Rockstar if no labels provided
      labels = ['2K', 'Rockstar'];
    }

    // Parse and validate categories
    let categories: string[] = [];
    if (row['Category']) {
      const rawCategories = row['Category'].toString().split(',').map((c: string) => c.trim()).filter(Boolean);
      const invalidCategories: string[] = [];
      
      // Map display names to internal IDs
      categories = rawCategories.map(cat => {
        const mappedCategory = categoryMapping[cat];
        if (mappedCategory) {
          return mappedCategory;
        } else {
          invalidCategories.push(cat);
          return cat; // Keep original for error reporting
        }
      });
      
      if (invalidCategories.length > 0) {
        errors.push(`Invalid category values: ${invalidCategories.join(', ')}. Valid options: ${validCategoryDisplayNames.join(', ')}`);
      }
      
      // Filter out invalid categories for the final result
      categories = categories.filter(cat => categoryOptions.includes(cat));
    } else {
      errors.push('Category is required');
    }

    // Check for duplicates
    const vendorName = row['Vendor Name']?.toString().trim();
    const isDuplicate = vendors.some(v => v.name.toLowerCase() === vendorName?.toLowerCase());
    if (isDuplicate) {
      errors.push('Vendor with this name already exists');
    }

    // Parse renewal date for the return object
    let renewalDate = '';
    if (row['Renewal Date']) {
      try {
        let dateValue = row['Renewal Date'];
        let parsedDate: Date;
        
        if (typeof dateValue === 'number') {
          // Excel date serial number
          parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
        } else {
          parsedDate = new Date(dateValue);
        }
        
        if (!isNaN(parsedDate.getTime())) {
          renewalDate = parsedDate.toISOString().split('T')[0];
        }
      } catch (error) {
        // Keep empty if parsing fails
      }
    }
    return {
      name: vendorName || '',
      deploymentStatus: row['Deployment Status'] as 'Active' | 'Pending' | 'Inactive',
      capabilities: row['Capabilities']?.toString().trim() || '',
      label: labels,
      annualCost: contractCost,
      renewalDate: renewalDate,
      categories: categories,
      errors,
      isValid: errors.length === 0
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('Please upload a valid Excel file (.xlsx or .xls)');
      }

      setUploadProgress(25);

      // Read file
      const data = await file.arrayBuffer();
      setUploadProgress(50);

      // Parse Excel
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setUploadProgress(75);

      if (jsonData.length === 0) {
        throw new Error('Excel file is empty or has no valid data');
      }

      // Validate and parse data
      const parsed = jsonData.map((row, index) => validateVendorData(row, index));
      
      const stats: UploadStats = {
        total: parsed.length,
        valid: parsed.filter(p => p.isValid).length,
        invalid: parsed.filter(p => !p.isValid).length,
        duplicates: parsed.filter(p => p.errors.some(e => e.includes('already exists'))).length,
        imported: 0
      };

      setParsedData(parsed);
      setUploadStats(stats);
      setUploadProgress(100);
      setUploadStep('preview');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const validVendors = parsedData.filter(v => v.isValid);
      let imported = 0;

      for (const vendorData of validVendors) {
        const newVendor: Vendor = {
          id: `bulk_${Date.now()}_${imported}`,
          name: vendorData.name,
          logo: 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
          deploymentStatus: vendorData.deploymentStatus,
          capabilities: vendorData.capabilities,
          label: vendorData.label,
          annualCost: vendorData.annualCost,
          renewalDate: vendorData.renewalDate,
          categories: vendorData.categories
        };

        addVendor(newVendor);
        
        imported++;
        setUploadProgress((imported / validVendors.length) * 100);
      }

      setUploadStats(prev => ({ ...prev, imported }));
      setUploadStep('complete');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import vendors');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setUploadStep('upload');
    setParsedData([]);
    setUploadStats({ total: 0, valid: 0, invalid: 0, duplicates: 0, imported: 0 });
    setUploadProgress(0);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 border border-white/10"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Bulk Vendor Upload</h2>
          <p className="text-gray-400">Upload multiple vendors from an Excel file</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {uploadStep === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Template Download */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Download Template</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Start by downloading our Excel template with the correct column headers and format.
              </p>
              <button
                onClick={generateTemplate}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>

            {/* File Upload */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-semibold text-white">Upload Excel File</h3>
              </div>
              
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/30 transition-colors duration-200">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="bulk-upload"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="bulk-upload"
                  className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium text-lg"
                >
                  Click to upload Excel file
                </label>
                <p className="text-gray-400 mt-2">
                  Supports .xlsx and .xls files up to 10MB
                </p>
              </div>

              {isProcessing && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Processing file...</span>
                    <span className="text-blue-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-400">{error}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {uploadStep === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white">{uploadStats.total}</div>
                <div className="text-gray-400 text-sm">Total Records</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-green-400">{uploadStats.valid}</div>
                <div className="text-gray-400 text-sm">Valid Records</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-red-400">{uploadStats.invalid}</div>
                <div className="text-gray-400 text-sm">Invalid Records</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-yellow-400">{uploadStats.duplicates}</div>
                <div className="text-gray-400 text-sm">Duplicates</div>
              </div>
            </div>

            {/* Data Preview */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Data Preview</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetUpload}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={uploadStats.valid === 0 || isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                  >
                    <Save className="w-4 h-4" />
                    Import {uploadStats.valid} Valid Records
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {parsedData.map((vendor, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        vendor.isValid
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {vendor.isValid ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          )}
                          <div>
                            <div className="text-white font-medium">{vendor.name || 'Unnamed Vendor'}</div>
                            <div className="text-gray-400 text-sm">
                              {vendor.deploymentStatus} • ${vendor.annualCost?.toLocaleString() || 0}
                            </div>
                          </div>
                        </div>
                        {!vendor.isValid && (
                          <div className="text-red-400 text-sm max-w-md">
                            {vendor.errors.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isProcessing && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Importing vendors...</span>
                    <span className="text-green-400">{uploadProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {uploadStep === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 rounded-2xl p-8 border border-white/10 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Import Successful!</h3>
              <p className="text-gray-400 mb-6">
                Successfully imported {uploadStats.imported} vendors out of {uploadStats.total} records.
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-lg font-bold text-white">{uploadStats.total}</div>
                  <div className="text-gray-400 text-sm">Total Processed</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-400">{uploadStats.imported}</div>
                  <div className="text-gray-400 text-sm">Successfully Imported</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-lg font-bold text-red-400">{uploadStats.invalid}</div>
                  <div className="text-gray-400 text-sm">Invalid Records</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-lg font-bold text-yellow-400">{uploadStats.duplicates}</div>
                  <div className="text-gray-400 text-sm">Duplicates Skipped</div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={resetUpload}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Upload More Vendors
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  Back to Admin Panel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};