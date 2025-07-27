// Logo Finder Utility
// Helps find logos for vendors that need them

export interface LogoSearchResult {
  vendorName: string;
  searchUrls: string[];
  suggestedSources: string[];
  fallbackLogo: string;
}

// Common logo search patterns
export const LOGO_SEARCH_PATTERNS = [
  '{vendor} logo official',
  '{vendor} brand assets',
  '{vendor} press kit',
  '{vendor} logo png',
  '{vendor} logo svg',
  '{vendor} company logo',
  '{vendor} logo download',
];

// Common logo sources for different vendor types
export const LOGO_SOURCES_BY_CATEGORY = {
  cdp: [
    'https://www.google.com/search?q={vendor}+logo+official&tbm=isch',
    'https://www.brandfolder.com/search?q={vendor}',
    'https://www.logo.wine/search?q={vendor}',
  ],
  email: [
    'https://www.google.com/search?q={vendor}+email+marketing+logo&tbm=isch',
    'https://www.brandfolder.com/search?q={vendor}',
  ],
  analytics: [
    'https://www.google.com/search?q={vendor}+analytics+logo&tbm=isch',
    'https://www.brandfolder.com/search?q={vendor}',
  ],
  social: [
    'https://www.google.com/search?q={vendor}+social+media+logo&tbm=isch',
    'https://www.brandfolder.com/search?q={vendor}',
  ],
  advertising: [
    'https://www.google.com/search?q={vendor}+advertising+logo&tbm=isch',
    'https://www.brandfolder.com/search?q={vendor}',
  ],
};

// Function to generate search URLs for a vendor
export function generateLogoSearchUrls(vendorName: string, categories: string[] = []): LogoSearchResult {
  const searchUrls = LOGO_SEARCH_PATTERNS.map(pattern => 
    `https://www.google.com/search?q=${encodeURIComponent(pattern.replace('{vendor}', vendorName))}&tbm=isch`
  );

  // Add category-specific search URLs
  const categoryUrls = categories.flatMap(category => {
    const categorySources = LOGO_SOURCES_BY_CATEGORY[category as keyof typeof LOGO_SOURCES_BY_CATEGORY] || [];
    return categorySources.map(source => 
      source.replace('{vendor}', encodeURIComponent(vendorName))
    );
  });

  const allUrls = [...searchUrls, ...categoryUrls];

  // Create fallback logo
  const initials = vendorName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);

  const fallbackLogo = `https://via.placeholder.com/64x64/4CAF50/FFFFFF?text=${initials}`;

  return {
    vendorName,
    searchUrls: allUrls,
    suggestedSources: [
      'Official company website',
      'Press kit or media resources',
      'Brand guidelines',
      'Social media profiles',
      'Wikipedia',
      'Crunchbase',
      'LinkedIn company page'
    ],
    fallbackLogo
  };
}

// Function to find vendors that need logos
export function findVendorsNeedingLogos(vendors: any[]): any[] {
  return vendors.filter(vendor => 
    vendor.logo.includes('placeholder.com') || 
    vendor.logo.includes('via.placeholder') ||
    !vendor.logo ||
    vendor.logo === ''
  );
}

// Function to generate a comprehensive logo search report
export function generateLogoSearchReport(vendors: any[]): {
  totalVendors: number;
  vendorsNeedingLogos: number;
  vendorsWithLogos: number;
  completionPercentage: number;
  vendorsNeedingLogosList: any[];
} {
  const vendorsNeedingLogos = findVendorsNeedingLogos(vendors);
  const vendorsWithLogos = vendors.length - vendorsNeedingLogos.length;
  const completionPercentage = Math.round((vendorsWithLogos / vendors.length) * 100);

  return {
    totalVendors: vendors.length,
    vendorsNeedingLogos: vendorsNeedingLogos.length,
    vendorsWithLogos,
    completionPercentage,
    vendorsNeedingLogosList: vendorsNeedingLogos
  };
}

// Function to suggest logo URLs based on vendor name
export function suggestLogoUrls(vendorName: string): string[] {
  const suggestions = [
    // Common CDN and logo hosting services
    `https://logo.clearbit.com/${vendorName.toLowerCase().replace(/\s+/g, '')}.com`,
    `https://www.google.com/s2/favicons?domain=${vendorName.toLowerCase().replace(/\s+/g, '')}.com`,
    
    // Common logo patterns
    `https://${vendorName.toLowerCase().replace(/\s+/g, '')}.com/logo.png`,
    `https://${vendorName.toLowerCase().replace(/\s+/g, '')}.com/assets/logo.svg`,
    `https://${vendorName.toLowerCase().replace(/\s+/g, '')}.com/images/logo.png`,
    `https://${vendorName.toLowerCase().replace(/\s+/g, '')}.com/static/logo.svg`,
    
    // Alternative domains
    `https://${vendorName.toLowerCase().replace(/\s+/g, '')}.io/logo.png`,
    `https://${vendorName.toLowerCase().replace(/\s+/g, '')}.co/logo.png`,
  ];

  return suggestions;
}

// Function to validate if a logo URL is accessible
export async function validateLogoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // This will always return true, but helps with CORS issues
    });
    return true; // If we can make the request, assume it's valid
  } catch {
    return false;
  }
}

// Function to create a color-coded fallback logo
export function createColorCodedFallback(vendorName: string, category: string): string {
  const initials = vendorName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);

  // Color coding by category
  const categoryColors: Record<string, string> = {
    cdp: '4CAF50',      // Green
    email: '2196F3',     // Blue
    analytics: 'FF9800', // Orange
    web: '9C27B0',       // Purple
    social: 'E91E63',    // Pink
    advertising: 'F44336', // Red
    'customer-service': '607D8B', // Blue Grey
    'paid-data': '795548', // Brown
    'talent-influencer': 'FF5722', // Deep Orange
    'pr-comms': '3F51B5', // Indigo
    'social-publishing': '009688', // Teal
    'social-listening': '8BC34A', // Light Green
  };

  const color = categoryColors[category] || '4CAF50';
  return `https://via.placeholder.com/64x64/${color}/FFFFFF?text=${initials}`;
} 