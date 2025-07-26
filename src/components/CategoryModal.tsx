import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Users, Zap } from 'lucide-react';
import { Category } from '../types';

interface CategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ category, isOpen, onClose }) => {
  if (!category) return null;

  const totalCost = category.vendors.reduce((sum, vendor) => sum + vendor.annualCost, 0);
  const activeVendors = category.vendors.filter(v => v.deploymentStatus === 'Active');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-r ${category.gradient} p-6`}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <p className="text-white/80 mt-2">{category.description}</p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-medium">Total Annual Cost</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    ${totalCost.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-medium">Active Vendors</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">
                    {activeVendors.length}
                  </p>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-medium">Total Vendors</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">
                    {category.vendors.length}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Vendors</h3>
                  <div className="grid gap-4">
                    {category.vendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="bg-gray-800 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src={vendor.logo}
                              alt={vendor.name}
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!failedLogos.has(vendor.id)) {
                                  setFailedLogos(prev => new Set(prev).add(vendor.id));
                                  target.src = 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo';
                                }
                              }}
                            />
                            <div>
                              <h4 className="text-white font-medium">{vendor.name}</h4>
                              <p className="text-gray-400 text-sm">{vendor.capabilities}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  vendor.deploymentStatus === 'Active' 
                                    ? 'bg-green-500/20 text-green-400'
                                    : vendor.deploymentStatus === 'Pending'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {vendor.deploymentStatus}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {vendor.label.map((lbl, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                                      {lbl}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">
                              ${vendor.annualCost.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                              <Calendar className="w-4 h-4" />
                             <span>Renewal Date:</span>
                              <span>{vendor.renewalDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Key Capabilities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Data Integration & Management',
                      'Real-time Analytics',
                      'Automated Workflows',
                      'Multi-channel Support',
                      'Performance Optimization',
                      'Compliance & Security'
                    ].map((capability, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span>{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};