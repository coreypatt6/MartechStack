import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Save, Upload, ArrowLeft, Plus, Trash2, Edit, FileSpreadsheet, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Vendor } from '../types';
import { useVendors } from '../hooks/useVendors';
import { BulkUpload } from './BulkUpload';

interface VendorFormData {
  name: string;
  logo?: FileList;
  deploymentStatus: 'Active' | 'Pending' | 'Inactive';
  capabilities: string;
  label: string[];
  annualCost: number;
  renewalDate: string;
  categories: string[];
}

const categoryOptions = [
  { value: 'cdp', label: 'Customer Data Platform' },
  { value: 'paid-data', label: 'Paid & Data Collaboration' },
  { value: 'email', label: 'Email & SMS' },
  { value: 'web', label: 'Web' },
  { value: 'social-publishing', label: 'Social Publishing' },
  { value: 'social-listening', label: 'Social Listening' },
  { value: 'talent-influencer', label: 'Talent & Influencer' },
  { value: 'pr-comms', label: 'PR & Comms' },
  { value: 'customer-service', label: 'Customer Service' },
  { value: 'analytics', label: 'Marketing Analytics' },
];

const labelOptions = [
  { value: '2K', label: '2K' },
  { value: 'Rockstar', label: 'Rockstar' },
  { value: 'Zynga', label: 'Zynga' },
  { value: 'Ghost Story', label: 'Ghost Story' },
];

export const AdminPanel: React.FC = () => {
  const { vendors, addVendor, updateVendor, deleteVendor, manualSync, isSyncing, lastSyncTime } = useVendors();
  const [currentView, setCurrentView] = useState<'form' | 'bulk'>('form');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUpdatingLogos, setIsUpdatingLogos] = useState(false);
  const [logoUpdateProgress, setLogoUpdateProgress] = useState(0);
  const [sortBy, setSortBy] = useState<'name' | 'recent'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

  const fetchVendorLogo = (vendorName: string): string => {
    const knownLogos: { [key: string]: string } = {
      // Major Platforms
      'salesforce': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
      'hubspot': 'https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png',
      'google analytics': 'https://developers.google.com/analytics/images/terms/logo_lockup_analytics_icon_vertical_black_2x.png',
      'mailchimp': 'https://eep.io/images/yzp4yyPofdYiCanTdGXQC0sNFb8=/2400x0/filters:no_upscale()/eep/images/landing_pages/brand/mailchimp-freddie-wink.png',
      
      // Analytics & Attribution
      'adjust': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'appsflyer': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'sensor tower': 'https://sensortower.com/images/st-logo.svg',
      'pathmatics': 'https://sensortower.com/images/st-logo.svg',
      'sensor tower | pathmatics': 'https://sensortower.com/images/st-logo.svg',
      'levelup analytics': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'deltadna': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'databricks': 'https://databricks.com/wp-content/uploads/2021/10/db-nav-logo.svg',
      
      // Adobe Products
      'adobe experience manager': 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg',
      'adobe workfront': 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg',
      
      // SEO & Web Tools
      'ahrefs': 'https://cdn.ahrefs.com/favicon-32x32.png',
      'ahrefs webmaster tools': 'https://cdn.ahrefs.com/favicon-32x32.png',
      'bit.ly': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'linktree': 'https://linktr.ee/s/img/favicon.ico',
      
      // Survey & Research
      'alchemer': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'screen engine': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'mindgame': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'screen engine | mindgame': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      
      // Development & Testing
      'browserstack': 'https://www.browserstack.com/images/layout/browserstack-logo-600x315.png',
      'code climate': 'https://codeclimate.com/favicon.ico',
      'code climate inc': 'https://codeclimate.com/favicon.ico',
      
      // Content Management
      'contentful': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      
      // Influencer & Creator Tools
      'creatoriq': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'tubular': 'https://tubularlabs.com/wp-content/uploads/2021/01/tubular-logo.svg',
      'stream hatchet': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      
      // Customer Support & Knowledge
      'zendesk': 'https://d1eipm3vz40hy0.cloudfront.net/images/AMER/zendesk-logo.svg',
      'helpshift': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'guru': 'https://www.getguru.com/favicon.ico',
      'directly': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'quiq': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      
      // Email & Marketing Tools
      'litmus': 'https://www.litmus.com/wp-content/uploads/2021/01/litmus-logo.svg',
      'movable ink': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'validity': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      
      // Social Media Management
      'sprinklr': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'sprout social': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'meltwater': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      
      // PR & Communications
      'muck rack': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'prmanager': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'prgloo': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'prmanager (ex prgloo)': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      
      // Data & Privacy
      'onetrust': 'https://www.onetrust.com/wp-content/uploads/2021/01/onetrust-logo.svg',
      'onetrust - cookie compliance': 'https://www.onetrust.com/wp-content/uploads/2021/01/onetrust-logo.svg',
      'infosum': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      
      // Services & Agencies
      'adswerve': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'ayzenberg': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'rightpoint': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      
      // Operational Tools
      'statuspage': 'https://dka575ofm4ao0.cloudfront.net/pages-transactional_logos/retina/8849/statuspage-logo-blue.png',
      'tymeshift': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
      'unbabel': 'https://unbabel.com/wp-content/uploads/2021/01/unbabel-logo.svg',
      
      // Design & Themes
      'lotus themes': 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo'
    };

    const normalizedName = vendorName.toLowerCase().trim();
    
    console.log('Fetching logo for vendor:', vendorName, 'Normalized:', normalizedName);
    
    // Check for exact matches first
    if (knownLogos[normalizedName]) {
      console.log('Found exact match for:', normalizedName);
      return knownLogos[normalizedName];
    }

    // Check for partial matches (vendor name contains known service or vice versa)
    for (const [key, logo] of Object.entries(knownLogos)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        console.log('Found partial match for:', normalizedName, 'with key:', key);
        return logo;
      }
    }

    console.log('No match found for:', normalizedName, 'using fallback logo');
    

    // Return default placeholder for unknown vendors
    return 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo';
  };

  const updateAllVendorLogos = async () => {
    const placeholderUrl = 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo';
    const vendorsToUpdate = vendors.filter(vendor => 
      vendor.logo === placeholderUrl || 
      vendor.logo === 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo' ||
      vendor.logo.includes('pexels.com')
    );
    
    console.log('Total vendors:', vendors.length);
    console.log('Vendors with placeholder logos:', vendorsToUpdate.length);
    console.log('Vendors to update:', vendorsToUpdate.map(v => v.name));
    console.log('All vendor logos:', vendors.map(v => ({ name: v.name, logo: v.logo })));
    
    if (vendorsToUpdate.length === 0) {
      console.log('No vendors found with placeholder logos. Checking all vendors...');
      // Let's update all vendors to ensure they get proper logos
      const allVendors = [...vendors];
      console.log('Updating all vendors:', allVendors.length);
      
      setIsUpdatingLogos(true);
      setLogoUpdateProgress(0);

      try {
        let updated = 0;
        
        for (let i = 0; i < allVendors.length; i++) {
          const vendor = allVendors[i];
          console.log(`Processing vendor ${i + 1}/${allVendors.length}:`, vendor.name);
          
          const newLogo = fetchVendorLogo(vendor.name);
          console.log('New logo URL for', vendor.name, ':', newLogo);
          
          if (newLogo !== vendor.logo) {
            const updatedVendor = { ...vendor, logo: newLogo };
            updateVendor(vendor.id, updatedVendor);
            updated++;
            console.log('Updated logo for:', vendor.name);
          } else {
            console.log('Logo unchanged for:', vendor.name);
          }
          
          setLogoUpdateProgress(((i + 1) / allVendors.length) * 100);
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('Logo update complete. Updated vendors:', updated);
        alert(`Successfully updated logos for ${updated} out of ${allVendors.length} vendors!`);
      } catch (error) {
        console.error('Error updating logos:', error);
        alert('Error updating logos. Please try again.');
      } finally {
        setIsUpdatingLogos(false);
        setLogoUpdateProgress(0);
      }
      return;
    }

    setIsUpdatingLogos(true);
    setLogoUpdateProgress(0);

    try {
      let updated = 0;
      
      for (let i = 0; i < vendorsToUpdate.length; i++) {
        const vendor = vendorsToUpdate[i];
        console.log(`Processing vendor ${i + 1}/${vendorsToUpdate.length}:`, vendor.name);
        
        const newLogo = fetchVendorLogo(vendor.name);
        console.log('New logo URL for', vendor.name, ':', newLogo);
        
        if (newLogo !== vendor.logo) {
          const updatedVendor = { ...vendor, logo: newLogo };
          updateVendor(vendor.id, updatedVendor);
          updated++;
          console.log('Updated logo for:', vendor.name);
        }
        
        setLogoUpdateProgress((updated / vendorsToUpdate.length) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('Logo update complete. Updated vendors:', updated);
      alert(`Successfully updated logos for ${updated} out of ${vendorsToUpdate.length} vendors!`);
    } catch (error) {
      console.error('Error updating logos:', error);
      alert('Error updating logos. Please try again.');
    } finally {
      setIsUpdatingLogos(false);
      setLogoUpdateProgress(0);
    }
  };

  const sortedVendors = [...vendors].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'recent':
        // Sort by ID which contains timestamp for recently added vendors
        comparison = a.id.localeCompare(b.id);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (newSortBy: 'name' | 'recent') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<VendorFormData>();

  const selectedCategories = watch('categories') || [];
  const selectedLabels = watch('label') || [];
  const logoFiles = watch('logo');

  // Handle logo preview
  React.useEffect(() => {
    if (logoFiles && logoFiles.length > 0 && logoFiles[0]) {
      const file = logoFiles[0];
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      
      // Cleanup function to revoke the object URL
      return () => {
        URL.revokeObjectURL(previewUrl);
      };
    } else if (!isEditing) {
      setLogoPreview(null);
    }
  }, [logoFiles, isEditing]);
  const onSubmit = async (data: VendorFormData) => {
    try {
      console.log('Form data received:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle logo upload
      let logoUrl = 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo';
      
      if (data.logo && data.logo.length > 0 && data.logo[0]) {
        const file = data.logo[0];
        try {
          // Convert file to Base64 for persistent storage
          logoUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result;
              if (typeof result === 'string') {
                resolve(result);
              } else {
                reject(new Error('Failed to read file as data URL'));
              }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });
          console.log('Logo uploaded:', file.name, 'Base64 length:', logoUrl.length);
        } catch (error) {
          console.error('Error processing logo:', error);
        }
      }
      
      // If editing and no new logo uploaded, keep existing logo
      if (editingId && (!data.logo || data.logo.length === 0)) {
        const existingVendor = vendors.find(v => v.id === editingId);
        if (existingVendor) {
          logoUrl = existingVendor.logo;
          console.log('Keeping existing logo for', existingVendor.name, ':', logoUrl);
        }
      }
      
      const newVendor: Vendor = {
        id: editingId || `v${Date.now()}`,
        name: data.name,
        logo: logoUrl,
        deploymentStatus: data.deploymentStatus,
        capabilities: data.capabilities,
        label: Array.isArray(data.label) ? data.label : [],
        annualCost: typeof data.annualCost === 'string' ? parseInt(data.annualCost) : data.annualCost,
        renewalDate: data.renewalDate,
        categories: Array.isArray(data.categories) ? data.categories : [],
      };

      console.log('Vendor object to save:', newVendor);
      console.log('Logo URL being saved:', newVendor.logo);

      if (editingId) {
        updateVendor(editingId, newVendor);
        console.log('Updated vendor:', newVendor);
        alert('Vendor updated successfully!');
      } else {
        addVendor(newVendor);
        console.log('Added new vendor:', newVendor);
        alert('Vendor added successfully!');
      }

      reset();
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Error saving vendor. Please try again.');
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingId(vendor.id);
    setIsEditing(true);
    setLogoPreview(vendor.logo); // Show current logo when editing
    console.log('Editing vendor:', vendor.name, 'Logo URL:', vendor.logo);
    reset({
      name: vendor.name,
      deploymentStatus: vendor.deploymentStatus,
      capabilities: vendor.capabilities,
      label: Array.isArray(vendor.label) ? vendor.label : [vendor.label].filter(Boolean),
      annualCost: vendor.annualCost,
      renewalDate: vendor.renewalDate,
      categories: vendor.categories,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      deleteVendor(id);
      alert('Vendor deleted successfully!');
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? '' : new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (currentView === 'bulk') {
    return (
      <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <BulkUpload onBack={() => setCurrentView('form')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 border border-white/10"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Manage vendors, costs, and deployment status across your MarTech stack.
          </p>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setCurrentView('form')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentView === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Single Vendor
            </button>
            <button
              onClick={() => setCurrentView('bulk')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Bulk Upload
            </button>
            <button
              onClick={updateAllVendorLogos}
              disabled={isUpdatingLogos}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
            >
              {isUpdatingLogos ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Update Logos
            </button>
          </div>
          
          {/* GitHub Sync Status */}
          <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isSyncing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" />
                ) : (
                  <Cloud className="w-5 h-5 text-blue-400" />
                )}
                <div>
                  <div className="text-white font-medium">GitHub Cloud Sync - Cross-Device Vendor Storage</div>
                  <div className="text-gray-400 text-sm">
                    {lastSyncTime 
                      ? `Last synced: ${lastSyncTime.toLocaleString()} | ${vendors.length} vendors`
                      : 'Ready to sync vendors across all devices'
                    }
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('🔍 GITHUB SYNC DIAGNOSTIC REPORT:');
                    console.log('=====================================');
                    console.log('🔧 Environment check:');
                    console.log('   VITE_GITHUB_TOKEN exists:', !!import.meta.env.VITE_GITHUB_TOKEN);
                    console.log('   Token value preview:', import.meta.env.VITE_GITHUB_TOKEN ? 
                      import.meta.env.VITE_GITHUB_TOKEN.substring(0, 10) + '...' : 'NOT_SET');
                    console.log('   All VITE_ vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
                    console.log('📊 Current device vendors:', vendors.length);
                    console.log('⏰ Last successful sync:', lastSyncTime?.toLocaleString() || 'Never synced');
                    console.log('🔄 Sync status:', isSyncing ? 'In progress' : 'Ready');
                    console.log('🌐 Repository:', 'https://github.com/coreypatt6/MartechStack');
                    console.log('📁 Sync file path:', 'data/vendors.json');
                    console.log('📝 Vendor names:', vendors.map(v => v.name).join(', '));
                    console.log('🔧 Server restart needed?', 'If token was just added, restart: npm run dev');
                    console.log('=====================================');
                    
                    const tokenStatus = import.meta.env.VITE_GITHUB_TOKEN ? 
                      `✅ Available (${import.meta.env.VITE_GITHUB_TOKEN.substring(0, 10)}...)` : 
                      '❌ Missing - Add to .env.local and restart server';
                    const syncStatus = lastSyncTime ? `✅ Last: ${lastSyncTime.toLocaleString()}` : '❌ Never synced';
                    
                    alert(`SYNC DIAGNOSTIC:\n\n📊 Vendors: ${vendors.length}\n🔐 Token: ${tokenStatus}\n⏰ Sync: ${syncStatus}\n\n${!import.meta.env.VITE_GITHUB_TOKEN ? '⚠️ RESTART SERVER after adding token!' : ''}\n\nCheck console for detailed report.`);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                >
                  🔍 Sync Diagnostic
                </button>
                <button
                  onClick={async () => {
                    console.log('🧪 Testing Cross-Device Sync - Adding test vendor...');
                    console.log('🔐 Token status: Available ✅');
                    console.log('📡 This will test the full sync pipeline...');
                    const testVendor = {
                      id: `test_${Date.now()}`,
                      name: `Cross-Device Test ${new Date().toLocaleTimeString()}`,
                      logo: 'https://via.placeholder.com/64x64/4CAF50/FFFFFF?text=TEST',
                      deploymentStatus: 'Active' as const,
                      capabilities: 'Testing cross-device GitHub cloud sync functionality',
                      label: ['2K'] as const,
                      annualCost: 1000,
                      renewalDate: '2024-12-31',
                      categories: ['analytics']
                    };
                    console.log('➕ Adding test vendor:', testVendor.name);
                    addVendor(testVendor);
                    console.log('⏳ Watch for sync confirmation messages...');
                    alert('Cross-device test vendor added! Watch console for "✅ GitHub sync completed successfully" message.');
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                >
                  🧪 Test Cross-Device
                </button>
                <button
                  onClick={async () => {
                    console.log('🔄 Manual sync initiated - syncing current project vendors to GitHub...');
                    console.log('📊 Current vendors in this project:', vendors.length);
                    console.log('📝 Vendor list:', vendors.map(v => v.name).join(', '));
                    console.log('☁️ Pushing to GitHub repository...');
                    
                    try {
                      await manualSync();
                      alert(`✅ Success! Synced ${vendors.length} vendors to GitHub.\n\nThese vendors are now available on all devices.\n\nRefresh other computers to see the updated vendor list.`);
                    } catch (error) {
                      console.error('❌ Sync failed:', error);
                      alert(`❌ Sync failed: ${error.message}\n\nCheck console for details.`);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                >
                  📤 Sync Current Vendors
                </button>
                <button
                  onClick={manualSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {isSyncing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                  {isSyncing ? 'Syncing...' : 'Force Sync All Devices'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Logo Update Progress */}
          {isUpdatingLogos && (
            <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Updating vendor logos...</span>
                <span className="text-purple-400">{logoUpdateProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${logoUpdateProgress}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Vendor Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gray-900 rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
              </h2>
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    setLogoPreview(null);
                    reset();
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Vendor Name *
                </label>
                <input
                  {...register('name', { required: 'Vendor name is required' })}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                  placeholder="Enter vendor name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Logo Upload
                </label>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-white/30 transition-colors duration-200">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      {...register('logo')}
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
                    >
                      Click to upload logo
                    </label>
                    <p className="text-gray-400 text-sm mt-1">PNG, JPG, SVG up to 2MB</p>
                  </div>
                  
                  {/* Logo Preview Panel */}
                  {logoPreview && (
                    <div className="bg-gray-800 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white font-medium text-sm">Logo Preview</span>
                      </div>
                      <div className="flex items-center justify-center bg-white/5 rounded-lg p-4 min-h-[80px]">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-w-16 max-h-16 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo';
                          }}
                        />
                      </div>
                      <p className="text-gray-400 text-xs mt-2 text-center">
                        This is how your logo will appear
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Deployment Status
                  </label>
                  <select
                    {...register('deploymentStatus', { required: 'Status is required' })}
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors duration-200"
                  >
                    <option value="">Select status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.deploymentStatus && (
                    <p className="text-red-400 text-sm mt-1">{errors.deploymentStatus.message}</p>
                  )}
                </div>

                <div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Labels
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-800 p-3 rounded-lg border border-white/10">
                      {labelOptions.map((option) => (
                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            {...register('label')}
                            type="checkbox"
                            value={option.value}
                            className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
                          />
                          <span className="text-gray-300 text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.label && (
                      <p className="text-red-400 text-sm mt-1">{errors.label.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Capabilities
                </label>
                <textarea
                  {...register('capabilities', { required: 'Capabilities are required' })}
                  rows={3}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors duration-200 resize-none"
                  placeholder="Describe vendor capabilities..."
                />
                {errors.capabilities && (
                  <p className="text-red-400 text-sm mt-1">{errors.capabilities.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Contract Cost
                  </label>
                  <input
                    {...register('annualCost', { 
                      required: 'Contract cost is required',
                      min: { value: 0, message: 'Cost must be positive' }
                    })}
                   type="text"
                   inputMode="decimal"
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    placeholder="$0.00"
                  />
                  {errors.annualCost && (
                    <p className="text-red-400 text-sm mt-1">{errors.annualCost.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Renewal Date
                  </label>
                  <input
                    {...register('renewalDate', { required: 'Renewal date is required' })}
                    type="date"
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors duration-200"
                  />
                  {errors.renewalDate && (
                    <p className="text-red-400 text-sm mt-1">{errors.renewalDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Category
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-gray-800 p-3 rounded-lg border border-white/10">
                  {categoryOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        {...register('categories')}
                        type="checkbox"
                        value={option.value}
                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
                      />
                      <span className="text-gray-300 text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.categories && (
                  <p className="text-red-400 text-sm mt-1">{errors.categories.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditing ? 'Update Vendor' : 'Add Vendor'}
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Vendor List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-900 rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Current Vendors</h2>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Sort by:</span>
                <div className="flex gap-1">
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'recent', label: 'Recent' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleSort(key as 'name' | 'recent')}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1 ${
                        sortBy === key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {label}
                      {sortBy === key && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {vendors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No vendors added yet.</p>
                </div>
              ) : (
              sortedVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-gray-800 rounded-lg p-3 border border-white/10 hover:border-white/20 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={vendor.logo}
                        alt={vendor.name}
                        className="w-8 h-8 object-contain flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!failedLogos.has(vendor.id)) {
                            setFailedLogos(prev => new Set(prev).add(vendor.id));
                            target.src = 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo';
                          }
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium text-sm truncate">{vendor.name}</h4>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                            vendor.deploymentStatus === 'Active' 
                              ? 'bg-green-500/20 text-green-400'
                              : vendor.deploymentStatus === 'Pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {vendor.deploymentStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="font-medium">${vendor.annualCost.toLocaleString()}</span>
                          <span>•</span>
                          <span className="truncate">{vendor.capabilities}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors duration-200"
                        aria-label={`Edit ${vendor.name}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors duration-200"
                        aria-label={`Delete ${vendor.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};