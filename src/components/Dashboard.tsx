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
          className="text-center mb-16"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" />
            <h1 className="relative text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              MarTech Stack Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10 font-light">
            Comprehensive visualization of our marketing technology ecosystem, 
            vendor relationships, and investment analytics.
          </p>
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 group"
            >
              <div className="text-3xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{totalVendors}</div>
              <div className="text-blue-200/70 text-sm font-medium">Total Vendors</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 group"
            >
              <div className="text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">{activeVendors}</div>
              <div className="text-green-200/70 text-sm font-medium">Active Vendors</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 group"
            >
              <div className="text-3xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                ${totalCost.toLocaleString()}
              </div>
              <div className="text-purple-200/70 text-sm font-medium">Annual Investment</div>
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