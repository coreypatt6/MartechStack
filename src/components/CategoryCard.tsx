import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Category } from '../types';
import { VendorLogo } from './VendorLogo';

interface CategoryCardProps {
  category: Category;
  onClick: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] as React.ComponentType<{
    className?: string;
  }>;

  // Calculate dynamic grid layout based on vendor count
  const vendorCount = category.vendors.length;
  const getGridLayout = () => {
    if (vendorCount <= 3) return { cols: 3, rows: 1 };
    if (vendorCount <= 6) return { cols: 3, rows: 2 };
    if (vendorCount <= 9) return { cols: 3, rows: 3 };
    if (vendorCount <= 12) return { cols: 4, rows: 3 };
    if (vendorCount <= 16) return { cols: 4, rows: 4 };
    if (vendorCount <= 20) return { cols: 5, rows: 4 };
    if (vendorCount <= 25) return { cols: 5, rows: 5 };
    return { cols: 6, rows: Math.ceil(vendorCount / 6) };
  };

  const gridLayout = getGridLayout();
  const displayVendors = category.vendors; // Show ALL vendors

  // Calculate card height based on content
  const baseHeight = 200; // Increased base height for header and description
  const descriptionLength = category.description.length;
  const descriptionHeight = Math.max(60, Math.ceil(descriptionLength / 80) * 25); // Dynamic height based on description length
  const logoGridHeight = gridLayout.rows * 44 + (gridLayout.rows - 1) * 12; // 44px per row + 12px gap
  const totalHeight = Math.max(320, baseHeight + descriptionHeight + logoGridHeight + 80); // Minimum 320px height with extra padding

  // Create gradient border style
  const gradientBorderStyle = {
    background: `linear-gradient(135deg, ${category.gradient.replace('from-', '').replace(' to-', ', ')})`,
    padding: '2px',
    borderRadius: '16px',
  };

  return (
    <motion.div
      className="card hover-lift cursor-pointer group"
      style={{ height: `${totalHeight}px` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(category)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${category.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(category);
        }
      }}
    >
      <div className="p-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          {IconComponent && <IconComponent className="w-6 h-6 text-gray-300 flex-shrink-0" />}
          <h3 className="text-white font-semibold text-lg leading-tight">{category.name}</h3>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed mb-8 flex-shrink-0">
          {category.description}
        </p>

          {/* Dynamic Vendor Logo Grid */}
          <div className="flex-1 mb-6">
            <div 
              className="grid gap-3 h-full"
              style={{ 
                gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
                gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`
              }}
            >
              {displayVendors.map((vendor) => (
                <div 
                  key={vendor.id}
                  className="flex items-center justify-center"
                >
                  <VendorLogo vendor={vendor} />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between flex-shrink-0 mt-auto">
            <span className="text-gray-300 text-sm font-medium">
              {category.vendors.length} vendor{category.vendors.length !== 1 ? 's' : ''}
            </span>
            <motion.div
              className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300"
              whileHover={{ x: 2 }}
            >
              <LucideIcons.ArrowRight className="w-5 h-5" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };