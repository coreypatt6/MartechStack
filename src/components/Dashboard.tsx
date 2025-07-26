import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CategoryCard } from './CategoryCard';
import { CategoryModal } from './CategoryModal';
import { categories as baseCategories } from '../data/mockData';
import { Category } from '../types';
import { useVendors } from '../hooks/useVendors';

export const Dashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { vendors } = useVendors();

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
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
            Marketing Technology Solutions
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Comprehensive visualization of our marketing technology ecosystem, 
            vendor relationships, and investment analytics.
          </p>
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10"
            >
              <div className="text-2xl font-bold text-blue-400">{totalVendors}</div>
              <div className="text-gray-400 text-sm">Total Vendors</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10"
            >
              <div className="text-2xl font-bold text-green-400">{activeVendors}</div>
              <div className="text-gray-400 text-sm">Active Vendors</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10"
            >
              <div className="text-2xl font-bold text-purple-400">
                ${totalCost.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Annual Investment</div>
            </motion.div>
          </div>
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
    </div>
  );
};