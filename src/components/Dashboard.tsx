import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Image } from 'lucide-react';
import { CategoryCard } from './CategoryCard';
import { CategoryModal } from './CategoryModal';
import { LogoManager } from './LogoManager';
import { AutoLogoUpdater } from './AutoLogoUpdater';
import { categories as baseCategories } from '../data/mockData';
import { Category } from '../types';
import { useVendors } from '../hooks/useVendors';

export const Dashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoManager, setShowLogoManager] = useState(false);
  const [showAutoUpdater, setShowAutoUpdater] = useState(false);
  const { vendors, isSyncing, lastSyncTime, updateVendor } = useVendors();

  // Update categories with current vendors
  const categories = baseCategories.map(category => ({
    ...category,
    vendors: vendors.filter(vendor => vendor.categories.includes(category.id))
  }));

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleVendorsUpdate = (updatedVendors: unknown[]) => {
    // Update each vendor individually
    updatedVendors.forEach(vendor => {
      updateVendor(vendor.id, vendor);
    });
  };

  // Calculate total stats for the header
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.deploymentStatus === 'Active').length;
  const totalCost = vendors.reduce((sum, vendor) => sum + vendor.annualCost, 0);

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="relative mb-6">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              MarTech Stack Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10 font-light">
            Comprehensive visualization of our marketing technology ecosystem, 
            vendor relationships, and investment analytics.
            {lastSyncTime && (
              <span className="block text-sm text-gray-400 mt-2 flex items-center justify-center gap-2">
                <Cloud className="w-4 h-4" />
                Cross-device sync: {lastSyncTime.toLocaleString()} | {totalVendors} vendors
              </span>
            )}
          </p>
          
          {/* Logo Management Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setShowAutoUpdater(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🤖 Auto-Update All Logos
              </button>
              <button
                onClick={() => setShowLogoManager(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Image className="w-5 h-5" />
                Manual Logo Manager
              </button>
            </div>
            <p className="text-center text-gray-400 text-sm mt-3">
              🤖 Auto-update uses AI to find corporate logos | 🎨 Manual manager for custom control
            </p>
          </motion.div>
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-900 rounded-xl p-6 border border-white/10"
            >
              <div className="text-3xl font-bold text-white">{totalVendors}</div>
              <div className="text-gray-400 text-sm">Total Vendors</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900 rounded-xl p-6 border border-white/10"
            >
              <div className="text-3xl font-bold text-white">{activeVendors}</div>
              <div className="text-gray-400 text-sm">Active Vendors</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-900 rounded-xl p-6 border border-white/10"
            >
              <div className="text-3xl font-bold text-white">
                ${totalCost.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Annual Investment</div>
            </motion.div>
          </div>
          
          {/* Sync Status Indicator */}
          {isSyncing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 text-blue-400"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
              <span className="text-sm">Syncing to GitHub...</span>
            </motion.div>
          )}
        </motion.div>

        {/* Category Cards Grid */}
        <motion.div
          className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className="break-inside-avoid mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <CategoryCard
                category={category}
                onClick={handleCategoryClick}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {categories.every(cat => cat.vendors.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center py-16"
          >
            <div className="text-gray-400 text-lg mb-4">
              No vendors found in your MarTech stack.
            </div>
            <p className="text-gray-500">
              Visit the Admin Panel to add your first vendors.
            </p>
          </motion.div>
        )}
      </div>

      <CategoryModal
        category={selectedCategory}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Auto Logo Updater Modal */}
      {showAutoUpdater && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🤖 Automatic Logo Updater</h2>
                <button
                  onClick={() => setShowAutoUpdater(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <AutoLogoUpdater
                vendors={vendors}
                onVendorsUpdate={handleVendorsUpdate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Manual Logo Manager Modal */}
      {showLogoManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🎨 Manual Logo Manager</h2>
                <button
                  onClick={() => setShowLogoManager(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <LogoManager
                vendors={vendors}
                onVendorsUpdate={handleVendorsUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};