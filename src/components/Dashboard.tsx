import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';
import { CategoryCard } from './CategoryCard';
import { CategoryModal } from './CategoryModal';
import { CDPTimeline } from './CDPTimeline';
import { categories as baseCategories } from '../data/mockData';
import { Category } from '../types';
import { useVendors } from '../hooks/useVendors';

export const Dashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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


  // Calculate total stats for the header
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.deploymentStatus === 'Active').length;
  const totalCost = vendors.reduce((sum, vendor) => sum + vendor.annualCost, 0);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto container-padding">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center section-padding"
        >
          <div className="relative mb-8">
            <h1 className="text-balance text-pretty mb-6 text-white">
              MIT Tech Stack
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12 text-balance">
            A capability-first ecosystem informed by people, processes, and the evolution of data needed to achieve desired business outcomes.
            {lastSyncTime && (
              <span className="block text-sm text-gray-400 mt-4 flex items-center justify-center gap-2">
                <Cloud className="w-4 h-4" />
                Cross-device sync: {lastSyncTime.toLocaleString()} | {totalVendors} vendors
              </span>
            )}
          </p>
          
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card hover-lift p-8 text-center"
            >
              <div className="text-4xl font-bold text-white mb-2">{totalVendors}</div>
              <div className="text-gray-300 font-medium">Total Vendors</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card hover-lift p-8 text-center"
            >
              <div className="text-4xl font-bold text-white mb-2">{activeVendors}</div>
              <div className="text-gray-300 font-medium">Active Vendors</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card hover-lift p-8 text-center"
            >
              <div className="text-4xl font-bold text-white mb-2">
                ${Math.round(totalCost).toLocaleString()}
              </div>
              <div className="text-gray-300 font-medium">Annual Investment</div>
            </motion.div>
          </div>
          
          {/* Sync Status Indicator */}
          {isSyncing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-center justify-center gap-2 text-blue-400"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
              <span className="text-sm font-medium">Syncing to GitHub...</span>
            </motion.div>
          )}
        </motion.div>

        {/* Category Cards Grid - Pinterest Style Masonry Layout */}
        <motion.div
          className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8"
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
            <div className="text-gray-300 text-lg mb-4 font-medium">
              No vendors found in your MarTech stack.
            </div>
            <p className="text-gray-400">
              Visit the Admin Panel to add your first vendors.
            </p>
          </motion.div>
        )}
      </div>

      {/* CDP Evolution Timeline */}
      <div className="bg-gray-900">
        <CDPTimeline />
      </div>

      <CategoryModal
        category={selectedCategory}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

    </div>
  );
};