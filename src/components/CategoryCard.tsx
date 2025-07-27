import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onClick: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] as React.ComponentType<{
    className?: string;
  }>;
  const [failedLogos, setFailedLogos] = React.useState<Set<string>>(new Set());

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
  const baseHeight = 160; // Increased base height for header and description
  const logoGridHeight = gridLayout.rows * 44 + (gridLayout.rows - 1) * 12; // 44px per row + 12px gap
  const totalHeight = Math.max(280, baseHeight + logoGridHeight + 60); // Minimum 280px height with extra padding

  // Create gradient border style
  const gradientBorderStyle = {
    background: `linear-gradient(135deg, ${category.gradient.replace('from-', '').replace(' to-', ', ')})`,
    padding: '2px',
    borderRadius: '16px',
  };

  return (
    <motion.div
      style={{ ...gradientBorderStyle, height: `${totalHeight}px` }}
      className="cursor-pointer group"
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
      <div className="relative overflow-hidden rounded-xl bg-gray-900/30 backdrop-blur-sm p-6 h-full flex flex-col">
        {/* Subtle gradient overlay for depth */}
        <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
        
        {/* Content container */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            {IconComponent && <IconComponent className="w-6 h-6 text-white flex-shrink-0" />}
            <h3 className="text-white font-semibold text-lg drop-shadow-sm leading-tight">{category.name}</h3>
          </div>

          {/* Description */}
          <p className="text-white/90 text-sm leading-relaxed drop-shadow-sm mb-6 flex-shrink-0">
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
                  title={vendor.name}
                >
                  <img
                    src={vendor.logo}
                    alt={vendor.name}
                    className="max-w-8 max-h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!failedLogos.has(vendor.id)) {
                        setFailedLogos(prev => new Set(prev).add(vendor.id));
                        target.src = 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo';
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between flex-shrink-0">
            <span className="text-white/70 text-sm drop-shadow-sm font-medium">
              {category.vendors.length} vendor{category.vendors.length !== 1 ? 's' : ''}
            </span>
            <motion.div
              className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300 drop-shadow-sm"
              whileHover={{ x: 2 }}
            >
              <LucideIcons.ArrowRight className="w-5 h-5" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};