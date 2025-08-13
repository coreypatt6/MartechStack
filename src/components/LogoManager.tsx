import React, { useState, useEffect } from 'react';
import { 
  updateVendorLogos, 
  generateLogoUpdateReport, 
  generateLogoSearchUrls,
  createFallbackLogo,
  LOGO_SOURCES 
} from '../utils/logoUpdater';
import { 
  batchFetchCorporateLogos, 
  generateHighQualityFallback,
  LogoFetchResult 
} from '../utils/corporateLogoFetcher';
import { 
  removeLogoBackground, 
  batchProcessLogos,
  checkImageTransparency 
} from '../utils/browserLogoProcessor';
import { Vendor, LogoUpdateReport } from '../types/vendor';

interface LogoManagerProps {
  vendors: any[];
  onVendorsUpdate: (vendors: any[]) => void;
}

export const LogoManager: React.FC<LogoManagerProps> = ({ vendors, onVendorsUpdate }) => {
  const [report, setReport] = useState<LogoUpdateReport | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchUrls, setSearchUrls] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetchingLogos, setIsFetchingLogos] = useState(false);
  const [fetchProgress, setFetchProgress] = useState({ completed: 0, total: 0, current: '' });
  const [fetchResults, setFetchResults] = useState<LogoFetchResult[]>([]);
  const [isProcessingTransparency, setIsProcessingTransparency] = useState(false);
  const [transparencyProgress, setTransparencyProgress] = useState({ completed: 0, total: 0, current: '' });

  useEffect(() => {
    if (vendors.length > 0) {
      const logoReport = generateLogoUpdateReport(vendors);
      setReport(logoReport);
    }
  }, [vendors]);

  const handleBulkUpdate = () => {
    setIsUpdating(true);
    const updatedVendors = updateVendorLogos(vendors as any[]);
    onVendorsUpdate(updatedVendors);
    setIsUpdating(false);
  };

  const handleCorporateLogoFetch = async () => {
    setIsFetchingLogos(true);
    setFetchResults([]);
    
    try {
      const vendorsNeedingLogos = vendors.filter(vendor => 
        !vendor.logo || 
        vendor.logo.includes('placeholder.com') || 
        vendor.logo.includes('via.placeholder')
      );
      
      const results = await batchFetchCorporateLogos(
        vendorsNeedingLogos.map(v => ({ id: v.id, name: v.name, categories: v.categories })),
        {
          useWebScraping: true,
          preferHighQuality: true,
          timeoutMs: 10000,
          maxRetries: 2
        },
        (completed, total, current) => {
          setFetchProgress({ completed, total, current });
        }
      );
      
      setFetchResults(results.map(r => r.result));
      
      // Apply successful logo fetches
      const updatedVendors = vendors.map(vendor => {
        const result = results.find(r => r.vendorId === vendor.id);
        if (result && result.result.logoUrl && result.result.confidence > 50) {
          return {
            ...vendor,
            logo: result.result.logoUrl,
            logoSource: result.result.source,
            logoConfidence: result.result.confidence
          };
        }
        return vendor;
      });
      
      onVendorsUpdate(updatedVendors);
      
    } catch (error) {
      console.error('Error fetching corporate logos:', error);
    } finally {
      setIsFetchingLogos(false);
    }
  };

  const handleVendorSelect = (vendor: any) => {
    setSelectedVendor(vendor);
    const urls = generateLogoSearchUrls(vendor.name);
    setSearchUrls(urls);
  };

  const handleManualLogoUpdate = (vendorId: string, newLogoUrl: string) => {
    const updatedVendors = vendors.map(vendor => 
      vendor.id === vendorId 
        ? { ...vendor, logo: newLogoUrl, logoUpdated: true, logoSource: 'manual' }
        : vendor
    );
    onVendorsUpdate(updatedVendors);
  };

  const handleComprehensiveLogoUpdate = async () => {
    setIsFetchingLogos(true);
    setIsUpdating(true);
    setIsProcessingTransparency(true);
    setFetchResults([]);
    setFetchProgress({ completed: 0, total: 0, current: '' });
    setTransparencyProgress({ completed: 0, total: 0, current: '' });
    
    try {
      console.log('🚀 Starting comprehensive logo management process...');
      
      // Step 1: Update with known logos first
      console.log('📋 Step 1: Updating with known logos...');
      console.log('🔍 Input vendors:', vendors.length, 'vendors');
      let updatedVendors = updateVendorLogos(vendors as any[]);
      console.log('✅ Step 1 complete - Updated vendors:', updatedVendors.length);
      
      // Apply Step 1 results immediately
      console.log('🔄 Applying Step 1 results...');
      onVendorsUpdate(updatedVendors as any[]);
      
      // Step 2: Fetch corporate logos for vendors still needing logos
      console.log('🌐 Step 2: Fetching corporate logos...');
      const vendorsNeedingLogos = updatedVendors.filter(vendor => 
        !vendor.logo || 
        vendor.logo.includes('placeholder.com') || 
        vendor.logo.includes('via.placeholder')
      );
      
      if (vendorsNeedingLogos.length > 0) {
        const results = await batchFetchCorporateLogos(
          vendorsNeedingLogos.map(v => ({ id: v.id, name: v.name, categories: v.categories })),
          {
            useWebScraping: true,
            preferHighQuality: true,
            timeoutMs: 10000,
            maxRetries: 2
          },
          (completed, total, current) => {
            setFetchProgress({ completed, total, current });
          }
        );
        
        setFetchResults(results.map(r => r.result));
        
        // Apply successful logo fetches
        console.log('🔄 Applying Step 2 results...');
        updatedVendors = updatedVendors.map(vendor => {
          const result = results.find(r => r.vendorId === vendor.id);
          if (result && result.result.logoUrl && result.result.confidence > 50) {
            console.log(`✅ Found logo for ${vendor.name}: ${result.result.logoUrl.substring(0, 50)}...`);
            return {
              ...vendor,
              logo: result.result.logoUrl,
              logoSource: result.result.source,
              logoConfidence: result.result.confidence
            };
          }
          return vendor;
        });
        
        // Apply Step 2 results immediately
        console.log('🔄 Applying Step 2 results to UI...');
        onVendorsUpdate(updatedVendors as any[]);
      }
      
      setIsFetchingLogos(false);
      setIsUpdating(false);
      
      // Step 3: Process transparent backgrounds with improved algorithm
      console.log('🎨 Step 3: Processing transparent backgrounds with improved quality...');
      const logoUrls = updatedVendors.map(v => v.logo).filter(Boolean);
      
      if (logoUrls.length > 0) {
        const transparencyResults = await batchProcessLogos(
          logoUrls,
          {
            removeWhiteBackground: true,
            outputFormat: 'png',
            maxSize: { width: 128, height: 128 },
            quality: 95
          },
          (completed, total, current) => {
            setTransparencyProgress({ completed, total, current });
          }
        );
        
        // Apply processed logos
        console.log('🔄 Applying Step 3 transparency results...');
        updatedVendors = updatedVendors.map(vendor => {
          const result = transparencyResults.find(r => r.url === vendor.logo);
          if (result && result.result.success && result.result.processedImageBase64) {
            console.log(`✅ Applied transparent background for ${vendor.name}`);
            return {
              ...vendor,
              logo: result.result.processedImageBase64,
              hasTransparentBackground: true,
              logoSource: (vendor.logoSource || 'Original') + ' (Transparent)'
            };
          }
          return vendor;
        });
      }
      
      // Final update with all changes
      console.log('🔄 Applying final comprehensive updates to all vendors...');
      onVendorsUpdate(updatedVendors as any[]);
      
      // Wait a moment to ensure changes are processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Comprehensive logo management complete! Changes should be persistent.');
      
    } catch (error) {
      console.error('Error in comprehensive logo update:', error);
    } finally {
      setIsFetchingLogos(false);
      setIsUpdating(false);
      setIsProcessingTransparency(false);
    }
  };


  if (!report) return <div>Loading...</div>;

  return (
            <div className="p-6 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-white">Logo Manager</h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{report.total}</div>
          <div className="text-sm text-blue-800">Total Vendors</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{report.updated}</div>
          <div className="text-sm text-green-800">Updated Logos</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{report.needsUpdate}</div>
          <div className="text-sm text-yellow-800">Need Logos</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round((report.updated / report.total) * 100)}%
          </div>
          <div className="text-sm text-purple-800">Completion</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleComprehensiveLogoUpdate}
            disabled={isFetchingLogos || isUpdating || isProcessingTransparency}
            className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 hover:from-purple-700 hover:via-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 text-lg"
          >
            {(isFetchingLogos || isUpdating || isProcessingTransparency) ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing Vendor Logos...
              </>
            ) : (
              <>
                🚀 Update All Vendor Logos
              </>
            )}
          </button>
        </div>
        
        {isFetchingLogos && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-800 font-medium">Fetching logos...</span>
              <span className="text-blue-600">
                {fetchProgress.completed}/{fetchProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(fetchProgress.completed / fetchProgress.total) * 100}%` }}
              />
            </div>
            <p className="text-blue-700 text-sm">Currently processing: {fetchProgress.current}</p>
          </div>
        )}
        
        {isProcessingTransparency && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-800 font-medium">Processing transparent backgrounds...</span>
              <span className="text-green-600">{transparencyProgress.completed}/{transparencyProgress.total}</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(transparencyProgress.completed / transparencyProgress.total) * 100 || 0}%` }}
              />
            </div>
            <div className="text-green-700 text-sm">
              {transparencyProgress.current && `Processing: ${transparencyProgress.current}`}
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-300">
          🚀 <strong>Update All Vendor Logos</strong> performs a comprehensive 3-step process:<br/>
          📋 <strong>Step 1:</strong> Updates vendors with known high-quality logos from our database<br/>
          🌐 <strong>Step 2:</strong> Auto-fetches official corporate logos using reliable APIs<br/>
          🎨 <strong>Step 3:</strong> Creates transparent backgrounds with improved edge smoothing
        </p>
      </div>
      
      {/* Fetch Results */}
      {fetchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Corporate Logo Fetch Results
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {fetchResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.logoUrl
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.logoUrl && (
                      <img
                        src={result.logoUrl}
                        alt={result.vendorName}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-800">{result.vendorName}</div>
                      <div className="text-sm text-gray-600">
                        {result.logoUrl ? (
                          <>
                            ✅ Found via {result.source} (confidence: {result.confidence}%)
                          </>
                        ) : (
                          <>
                            ❌ {result.error || 'No logo found'}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {result.alternativeUrls.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {result.alternativeUrls.length} alternatives
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendors Needing Logos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Vendors Needing Logos ({report.vendorsNeedingLogos.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.vendorsNeedingLogos.map((vendorName: string, index: number) => {
            const vendor = vendors.find(v => v.name === vendorName);
            return (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <img 
                    src={vendor?.logo} 
                    alt={vendorName}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = createFallbackLogo(vendorName);
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{vendorName}</h4>
                    <p className="text-sm text-gray-600">{vendor?.categories?.join(', ')}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => handleVendorSelect(vendor)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                  >
                    Search for Logo
                  </button>
                  <button
                    onClick={() => {
                      const highQualityFallback = generateHighQualityFallback(
                        vendor.name, 
                        vendor.categories[0] || 'default'
                      );
                      handleManualLogoUpdate(vendor.id, highQualityFallback);
                    }}
                    className="w-full bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm"
                  >
                    Create HD Fallback
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logo Search Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Find Logo for {selectedVendor.name}</h3>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">Search for the official logo:</p>
                <div className="space-y-2">
                  {searchUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-blue-700"
                    >
                      🔍 Search: {selectedVendor.name} logo ({index + 1})
                    </a>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">Or use a predefined logo if available:</p>
                <div className="space-y-2">
                  {Object.entries(LOGO_SOURCES)
                    .filter(([name]) => name.toLowerCase().includes(selectedVendor.name.toLowerCase()))
                    .map(([name, logoUrl]) => (
                      <button
                        key={name}
                        onClick={() => {
                          handleManualLogoUpdate(selectedVendor.id, logoUrl);
                          setSelectedVendor(null);
                        }}
                        className="w-full text-left bg-green-50 hover:bg-green-100 p-3 rounded-lg text-green-700"
                      >
                        ✅ Use: {name}
                      </button>
                    ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">Manual logo URL:</p>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    className="flex-1 border rounded-lg px-3 py-2"
                    id="manual-logo-url"
                  />
                  <button
                    onClick={() => {
                      const url = (document.getElementById('manual-logo-url') as HTMLInputElement).value;
                      if (url) {
                        handleManualLogoUpdate(selectedVendor.id, url);
                        setSelectedVendor(null);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 