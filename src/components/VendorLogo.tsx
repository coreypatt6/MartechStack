import React from 'react';
import { Vendor } from '../types';

interface VendorLogoProps {
  vendor: Vendor;
  className?: string;
}

// Predefined brand colors for vendors
const getBrandColor = (vendorName: string): string => {
  const colors: Record<string, string> = {
    'Adjust': '#4F46E5',
    'Adobe Experience Manager': '#FF0000',
    'Adobe Workfront': '#FF0000', 
    'Adswerve': '#0066CC',
    'Ahrefs Webmaster Tools': '#FF7A00',
    'Alchemer': '#28A745',
    'Appsflyer': '#6366F1',
    'Ayzenberg': '#FF6B35',
    'Bit.ly': '#EE6123',
    'BrowserStack': '#F39C12',
    'Code Climate Inc': '#059669',
    'Contentful': '#2478CC',
    'CreatorIQ': '#8B5CF6',
    'Databricks': '#E74C3C',
    'DeltaDNA': '#DC2626',
    'Directly': '#3B82F6',
    'Guru': '#7C3AED',
    'Helpshift': '#10B981',
    'Infosum': '#F59E0B',
    'LevelUP Analytics': '#EF4444',
    'Linktree': '#43E55E',
    'Litmus': '#2ECC71',
    'Liveramp': '#9B59B6',
    'Lotus Themes': '#A855F7',
    'Meltwater': '#3498DB',
    'Movable Ink': '#059669',
    'Muck Rack': '#1F2937',
    'OneTrust - Cookie Compliance': '#27AE60',
    'PRManager (ex PRGloo)': '#7C3AED',
    'Quiq': '#0891B2',
    'RightPoint': '#DC2626',
    'Salesforce Marketing Cloud': '#00A1E0',
    'Salesforce Marketing Cloud Intelligence (Datorama)': '#00A1E0',
    'Salesforce Service Cloud': '#00A1E0',
    'Screen Engine | MindGame': '#6366F1',
    'Sensor Tower | Pathmatics': '#F97316',
    'Sprinklr': '#E67E22',
    'Sprout Social': '#59CB59',
    'Statuspage': '#F97316',
    'Stream Hatchet': '#8B5CF6',
    'Treasure Data': '#059669',
    'Tubular': '#DC2626',
    'Zendesk Workforce Management (formerly Tymeshift)': '#03363D',
    'Zendesk': '#03363D'
  };
  
  return colors[vendorName] || '#6B7280';
};

const getVendorInitials = (name: string): string => {
  // Custom abbreviations for better readability
  const customInitials: Record<string, string> = {
    'Adobe Experience Manager': 'AEM',
    'Adobe Workfront': 'AWF',
    'Ahrefs Webmaster Tools': 'AHR',
    'Code Climate Inc': 'CC',
    'Salesforce Marketing Cloud': 'SFMC',
    'Salesforce Marketing Cloud Intelligence (Datorama)': 'SFMD',
    'Salesforce Service Cloud': 'SFSC',
    'Screen Engine | MindGame': 'SCR',
    'Sensor Tower | Pathmatics': 'STP',
    'Sprout Social': 'SS',
    'Zendesk Workforce Management (formerly Tymeshift)': 'ZWM',
    'OneTrust - Cookie Compliance': 'OT',
    'PRManager (ex PRGloo)': 'PRM',
    'LevelUP Analytics': 'LVL'
  };

  if (customInitials[name]) {
    return customInitials[name];
  }

  // Generate initials from first letters of each word
  return name
    .split(/[\s\-|&()]+/)
    .filter(word => word.length > 0)
    .slice(0, 3) // Take first 3 words max
    .map(word => word[0].toUpperCase())
    .join('');
};

// Map vendors to local SVG files - only include working SVGs we've verified
const getLocalLogoPath = (vendorName: string): string | null => {
  const logoMap: Record<string, string> = {
    'Sprout Social': '/logos/sprout-social.svg',
    'Adobe Experience Manager': '/logos/adobe.svg',
    'Adobe Workfront': '/logos/adobe.svg',
    'Bit.ly': '/logos/bitly.svg',
    'BrowserStack': '/logos/browserstack.svg',
    'Code Climate Inc': '/logos/code-climate.svg',
    'Guru': '/logos/guru.svg',
    'Salesforce Marketing Cloud': '/logos/salesforce.svg',
    'Salesforce Marketing Cloud Intelligence (Datorama)': '/logos/salesforce.svg',
    'Salesforce Service Cloud': '/logos/salesforce.svg',
    'Zendesk': '/logos/zendesk-transparent.png',
    'Zendesk Workforce Management (formerly Tymeshift)': '/logos/zendesk-transparent.png'
  };
  
  return logoMap[vendorName] || null;
};

export const VendorLogo: React.FC<VendorLogoProps> = ({ vendor, className = '' }) => {
  const [imageError, setImageError] = React.useState(false);
  const brandColor = getBrandColor(vendor.name);
  const initials = getVendorInitials(vendor.name);
  const localLogoPath = getLocalLogoPath(vendor.name);

  // If we have a local logo and no image error, try to use it
  if (localLogoPath && !imageError) {
    return (
      <img
        src={localLogoPath}
        alt={vendor.name}
        className={`object-contain ${className}`}
        style={{
          width: '32px',
          height: '32px',
          maxWidth: '32px',
          maxHeight: '32px'
        }}
        title={vendor.name}
        onError={() => setImageError(true)}
      />
    );
  }

  // Fall back to CSS badge for all others or on error
  return (
    <div 
      className={`flex items-center justify-center text-white font-bold text-xs rounded ${className}`}
      style={{ 
        backgroundColor: brandColor,
        minWidth: '32px',
        minHeight: '32px',
        width: '32px',
        height: '32px'
      }}
      title={vendor.name}
    >
      {initials}
    </div>
  );
};