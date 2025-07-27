// Auto Logo Updater Component
// One-click solution to update all vendor logos automatically

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  bulkUpdateAllVendorLogos, 
  applyBulkUpdateResults, 
  generateBulkUpdateReport,
  BulkUpdateResult,
  DEFAULT_BULK_OPTIONS 
} from '../utils/bulkLogoUpdater';
import { Vendor, LogoUpdateProgress } from '../types/vendor';

interface AutoLogoUpdaterProps {
  vendors: Vendor[];
  onVendorsUpdate: (vendors: Vendor[]) => void;
}

export const AutoLogoUpdater: React.FC<AutoLogoUpdaterProps> = ({ vendors, onVendorsUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState<LogoUpdateProgress>({ 
    completed: 0, 
    total: 0, 
    current: '', 
    phase: 'analyzing'
  });
  const [updateResult, setUpdateResult] = useState<BulkUpdateResult | null>(null);
  const [showReport, setShowReport] = useState(false);

  const phaseLabels = {
    analyzing: '📊 Analyzing vendors...',
    fetching: '🌐 Fetching corporate logos...',
    updating: '⚡ Updating vendor data...',
    complete: '✅ Update complete!'
  };

  const handleAutoUpdate = async () => {
    setIsUpdating(true);
    setUpdateResult(null);
    setProgress({ completed: 0, total: 0, current: 'Starting...', phase: 'analyzing' });

    try {
      console.log('🚀 Starting automatic logo update for all vendors');
      
      const result = await bulkUpdateAllVendorLogos(
        vendors,
        {
          ...DEFAULT_BULK_OPTIONS,
          skipExistingLogos: false, // Update all logos, even existing ones
          minimumConfidence: 50,
          useFallbackForFailed: true,
          batchSize: 5, // Smaller batches to be more responsive
          delayBetweenBatches: 800
        },
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );

      console.log('📊 Update result:', result);
      
      // Apply the results to update vendors
      const updatedVendors = applyBulkUpdateResults(vendors, result);
      onVendorsUpdate(updatedVendors);
      
      setUpdateResult(result);
      console.log('✅ All vendors updated successfully!');
      
    } catch (error) {
      console.error('❌ Error during auto logo update:', error);
      alert('Error updating logos. Please check the console for details.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getProgressPercentage = () => {
    if (progress.total === 0) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  };

  const getPhaseColor = () => {
    switch (progress.phase) {
      case 'analyzing': return 'blue';
      case 'fetching': return 'purple';
      case 'updating': return 'green';
      case 'complete': return 'emerald';
      default: return 'gray';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🤖 Automatic Logo Updater
        </h2>
        <p className="text-gray-600">
          Automatically fetch and update logos for all vendors using web scraping and corporate databases
        </p>
      </div>

      {/* Update Button */}
      {!isUpdating && !updateResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={handleAutoUpdate}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🚀 Update All Vendor Logos
          </button>
          <p className="text-sm text-gray-500 mt-3">
            This will automatically find and update logos for all {vendors.length} vendors
          </p>
        </motion.div>
      )}

      {/* Progress Display */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Phase Indicator */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${getPhaseColor()}-100 text-${getPhaseColor()}-700 font-medium`}>
                {phaseLabels[progress.phase]}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {progress.current || 'Processing...'}
                </span>
                <span className="text-gray-800 font-medium">
                  {progress.completed}/{progress.total} ({getProgressPercentage()}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className={`bg-gradient-to-r from-${getPhaseColor()}-500 to-${getPhaseColor()}-600 h-3 rounded-full transition-all duration-500`}
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Current Activity */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm">
                  {progress.phase === 'fetching' && 'Searching corporate websites and logo databases...'}
                  {progress.phase === 'analyzing' && 'Analyzing which vendors need logo updates...'}
                  {progress.phase === 'updating' && 'Applying logo updates to vendor database...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Display */}
      <AnimatePresence>
        {updateResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Success Summary */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-bold text-green-800">Update Complete!</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {updateResult.totalProcessed}
                  </div>
                  <div className="text-sm text-green-700">Total Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {updateResult.successfulUpdates}
                  </div>
                  <div className="text-sm text-blue-700">Updated Logos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {updateResult.skippedVendors}
                  </div>
                  <div className="text-sm text-gray-700">Skipped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((updateResult.successfulUpdates / updateResult.totalProcessed) * 100)}%
                  </div>
                  <div className="text-sm text-purple-700">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">✅ Successful Updates</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {updateResult.results
                    .filter(r => r.status === 'success' && r.newLogo !== r.previousLogo)
                    .slice(0, 5)
                    .map((result, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        {result.vendorName} - {result.source}
                      </div>
                    ))}
                  {updateResult.results.filter(r => r.status === 'success').length > 5 && (
                    <div className="text-sm text-gray-500">
                      +{updateResult.results.filter(r => r.status === 'success').length - 5} more...
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">ℹ️ Sources Used</h4>
                <div className="space-y-1">
                  {Object.entries(
                    updateResult.results
                      .filter(r => r.status === 'success')
                      .reduce((acc, r) => {
                        acc[r.source] = (acc[r.source] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 4)
                    .map(([source, count]) => (
                      <div key={source} className="text-sm text-gray-600 flex justify-between">
                        <span>{source}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setShowReport(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                📊 View Detailed Report
              </button>
              <button
                onClick={() => {
                  setUpdateResult(null);
                  setProgress({ completed: 0, total: 0, current: '', phase: 'analyzing' });
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                🔄 Run Another Update
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Report Modal */}
      {showReport && updateResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Detailed Update Report</h3>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {generateBulkUpdateReport(updateResult)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};