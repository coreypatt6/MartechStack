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
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Comprehensive visualization of our marketing technology ecosystem, 
            vendor relationships, and investment analytics.
          </p>
        </motion.div>

        <motion.div
          className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className="break-inside-avoid mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <CategoryCard
                category={category}
                onClick={handleCategoryClick}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <CategoryModal
        category={selectedCategory}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};