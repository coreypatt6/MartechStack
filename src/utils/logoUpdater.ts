// Logo Updater Utility
// This script helps update vendor logos systematically

export interface LogoUpdate {
  vendorId: string;
  vendorName: string;
  currentLogo: string;
  newLogo: string;
  source: string;
}

// Common logo sources for major vendors - Using reliable Clearbit API
export const LOGO_SOURCES: Record<string, string> = {
  // CDP Vendors
  'Salesforce CDP': 'https://logo.clearbit.com/salesforce.com',
  'Adobe Experience Platform': 'https://logo.clearbit.com/adobe.com',
  'Segment': 'https://logo.clearbit.com/segment.com',
  'Tealium': 'https://logo.clearbit.com/tealium.com',
  'Treasure Data': 'https://logo.clearbit.com/treasuredata.com',
  
  // Email Vendors
  'Mailchimp': 'https://logo.clearbit.com/mailchimp.com',
  'SendGrid': 'https://logo.clearbit.com/sendgrid.com',
  'Klaviyo': 'https://logo.clearbit.com/klaviyo.com',
  'Twilio': 'https://logo.clearbit.com/twilio.com',
  'Braze': 'https://logo.clearbit.com/braze.com',
  'Salesforce Marketing Cloud': 'https://logo.clearbit.com/salesforce.com',
  
  // Analytics Vendors
  'Google Analytics': 'https://logo.clearbit.com/google.com',
  'Adobe Analytics': 'https://logo.clearbit.com/adobe.com',
  'Tableau': 'https://logo.clearbit.com/tableau.com',
  'Looker': 'https://logo.clearbit.com/looker.com',
  'Mixpanel': 'https://logo.clearbit.com/mixpanel.com',
  'Appsflyer': 'https://logo.clearbit.com/appsflyer.com',
  'Adjust': 'https://logo.clearbit.com/adjust.com',
  
  // Social Media
  'Hootsuite': 'https://logo.clearbit.com/hootsuite.com',
  'Buffer': 'https://logo.clearbit.com/buffer.com',
  'Sprout Social': 'https://logo.clearbit.com/sproutsocial.com',
  'Sprinklr': 'https://logo.clearbit.com/sprinklr.com',
  
  // Customer Service
  'Zendesk': 'https://logo.clearbit.com/zendesk.com',
  'Intercom': 'https://logo.clearbit.com/intercom.com',
  'Freshdesk': 'https://logo.clearbit.com/freshdesk.com',
  
  // Advertising
  'Google Ads': 'https://logo.clearbit.com/google.com',
  
  // Exact vendor names from failing list - matching case-sensitive names
  'Adswerve': 'https://logo.clearbit.com/adswerve.com',
  'Ahrefs Webmaster Tools': 'https://logo.clearbit.com/ahrefs.com',
  'Alchemer': 'https://logo.clearbit.com/alchemer.com',
  'AspireIQ': 'https://logo.clearbit.com/aspireiq.com',
  'Ayzenberg': 'https://logo.clearbit.com/ayzenberg.com',
  'Bit.ly': 'https://logo.clearbit.com/bitly.com',
  'BrowserStack': 'https://logo.clearbit.com/browserstack.com',
  'Code Climate Inc': 'https://logo.clearbit.com/codeclimate.com',
  'Contentful': 'https://logo.clearbit.com/contentful.com',
  'CreatorIQ': 'https://logo.clearbit.com/creatoriq.com',
  'Databricks': 'https://logo.clearbit.com/databricks.com',
  'DeltaDNA': 'https://logo.clearbit.com/deltadna.com',
  'Directly': 'https://logo.clearbit.com/directly.com',
  'Helpshift': 'https://logo.clearbit.com/helpshift.com',
  'Infosum': 'https://logo.clearbit.com/infosum.com',
  'LevelUP Analytics': 'https://logo.clearbit.com/levelupanalytics.com',
  'Linktree': 'https://logo.clearbit.com/linktr.ee',
  'LiveRamp': 'https://logo.clearbit.com/liveramp.com',
  'Lotus Themes': 'https://logo.clearbit.com/lotusthemes.com',
  'Meltwater': 'https://logo.clearbit.com/meltwater.com',
  'Movable Ink': 'https://logo.clearbit.com/movableink.com',
  'Muck Rack': 'https://logo.clearbit.com/muckrack.com',
  'OneTrust - Cookie Compliance': 'https://logo.clearbit.com/onetrust.com',
  'Optimizely': 'https://logo.clearbit.com/optimizely.com',
  'Quiq': 'https://logo.clearbit.com/quiq.com',
  'RightPoint': 'https://logo.clearbit.com/rightpoint.com',
  'Sensor Tower | Pathmatics': 'https://logo.clearbit.com/sensortower.com',
  'Statuspage': 'https://logo.clearbit.com/statuspage.io',
  'Stream Hatchet': 'https://logo.clearbit.com/streamhatchet.com',
  'The Trade Desk': 'https://logo.clearbit.com/thetradedesk.com',
  'Tymeshift': 'https://logo.clearbit.com/zendesk.com?size=128', // Acquired by Zendesk in 2023
  'Guru': 'https://logo.clearbit.com/getguru.com?size=128',
  'PRManager': 'https://ui-avatars.com/api/?name=PR&background=4F46E5&color=FFFFFF&size=128&bold=true&format=png',
  'PRManager (ex PRGloo)': 'https://ui-avatars.com/api/?name=PR&background=4F46E5&color=FFFFFF&size=128&bold=true&format=png',
  'Screen Engine': 'https://logo.clearbit.com/screenengineasi.com?size=128',
  'Screen Engine | MindGame': 'https://logo.clearbit.com/screenengineasi.com?size=128',
  'Tubular': 'https://logo.clearbit.com/tubularlabs.com',
  
  // Influencer Marketing (using Clearbit for consistency)
  'Grin': 'https://logo.clearbit.com/grin.co',
  
  // PR & Communications (using Clearbit for consistency)
  'Cision': 'https://logo.clearbit.com/cision.com',
  // Additional tools (using Clearbit for consistency)
  'Hotjar': 'https://logo.clearbit.com/hotjar.com'
};

// Legacy entries that will be removed (keeping object structure intact)
const LEGACY_ENTRIES = {
  // Knowledge Management
  'Guru': 'https://guru.com/wp-content/uploads/2020/03/guru-logo.svg',
  
  // Link Management
  'Linktree': 'https://linktr.ee/wp-content/uploads/2020/03/linktree-logo.svg',
  
  // Privacy & Compliance
  'OneTrust - Cookie Compliance': 'https://onetrust.com/wp-content/uploads/2020/03/onetrust-logo.svg',
  
  // PR Management
  'PRManager (ex PRGloo)': 'https://prmanager.com/wp-content/uploads/2020/03/prmanager-logo.svg',
  
  // Survey & Feedback
  'Alchemer': 'https://www.alchemer.com/wp-content/uploads/2020/03/alchemer-logo.svg',
  
  // Gaming Analytics
  'Screen Engine | MindGame': 'https://screenengine.com/wp-content/uploads/2020/03/screenengine-logo.svg',
  'Sensor Tower | Pathmatics': 'https://sensortower.com/wp-content/uploads/2020/03/sensortower-logo.svg',
  
  // Status & Monitoring
  'Statuspage': 'https://www.statuspage.io/wp-content/uploads/2020/03/statuspage-logo.svg',
  
  // Workforce Management
  'Tymeshift': 'https://tymeshift.com/wp-content/uploads/2020/03/tymeshift-logo.svg',
  
  // Consultancy & Services
  'Adswerve': 'https://adswerve.com/wp-content/uploads/2020/03/adswerve-logo.svg',
  'Ayzenberg': 'https://ayzenberg.com/wp-content/uploads/2020/03/ayzenberg-logo.svg',
  'RightPoint': 'https://rightpoint.com/wp-content/uploads/2020/03/rightpoint-logo.svg',
  'LevelUP Analytics': 'https://levelupanalytics.com/wp-content/uploads/2020/03/levelup-logo.svg',
  
  // Content & Design
  'Lotus Themes': 'https://lotusthemes.com/wp-content/uploads/2020/03/lotus-themes-logo.svg',
  'Movable Ink': 'https://movableink.com/wp-content/uploads/2020/03/movable-ink-logo.svg',
  
  // Marketing Intelligence
  'Salesforce Marketing Cloud Intelligence (Datorama)': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
};

// Function to generate logo search URLs
export function generateLogoSearchUrls(vendorName: string): string[] {
  const searchTerms = [
    `${vendorName} logo official`,
    `${vendorName} brand assets`,
    `${vendorName} press kit`,
    `${vendorName} logo png`,
    `${vendorName} logo svg`,
  ];
  
  return searchTerms.map(term => 
    `https://www.google.com/search?q=${encodeURIComponent(term)}&tbm=isch`
  );
}

// Function to check if logo URL is valid
export async function validateLogoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Function to create fallback logo
export function createFallbackLogo(vendorName: string, color: string = '#4CAF50'): string {
  const initials = vendorName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);
  
  return `https://via.placeholder.com/64x64/${color.replace('#', '')}/FFFFFF?text=${initials}`;
}

// Function to update vendor logos in bulk
// Function to find logo by fuzzy matching
function findLogoByName(vendorName: string): string | null {
  const normalizedVendor = vendorName.toLowerCase().trim();
  
  // First try exact match
  if (LOGO_SOURCES[vendorName]) {
    return LOGO_SOURCES[vendorName];
  }
  
  // Try fuzzy matching - check if vendor name contains any of our known brands
  for (const [knownName, logoUrl] of Object.entries(LOGO_SOURCES)) {
    const knownBrand = knownName.toLowerCase();
    
    // Check if vendor name contains the brand name or vice versa
    if (normalizedVendor.includes(knownBrand) || knownBrand.includes(normalizedVendor.split(' ')[0])) {
      console.log(`🎯 Logo match found: "${vendorName}" → "${knownName}"`);
      return logoUrl;
    }
    
    // Check for common brand variations (first word matching)
    const brandCore = knownBrand.split(' ')[0];
    const vendorCore = normalizedVendor.split(' ')[0];
    if (brandCore === vendorCore && brandCore.length > 3) {
      console.log(`🎯 Brand core match: "${vendorName}" → "${knownName}"`);
      return logoUrl;
    }
  }
  
  return null;
}

export function updateVendorLogos(vendors: unknown[]): unknown[] {
  return vendors.map(vendor => {
    const newLogo = findLogoByName(vendor.name);
    
    if (newLogo && newLogo !== vendor.logo) {
      console.log(`✅ Updating logo for ${vendor.name}: ${newLogo}`);
      return {
        ...vendor,
        logo: newLogo,
        logoUpdated: true,
        logoSource: 'predefined'
      };
    }
    
    return vendor;
  });
}

// Function to generate logo update report
export function generateLogoUpdateReport(vendors: unknown[]): {
  updated: number;
  needsUpdate: number;
  total: number;
  vendorsNeedingLogos: string[];
} {
  const vendorsNeedingLogos = vendors
    .filter(vendor => vendor.logo.includes('placeholder.com') || vendor.logo.includes('via.placeholder'))
    .map(vendor => vendor.name);
  
  const updated = vendors.filter(vendor => vendor.logoUpdated).length;
  const needsUpdate = vendorsNeedingLogos.length;
  const total = vendors.length;
  
  return {
    updated,
    needsUpdate,
    total,
    vendorsNeedingLogos
  };
} 