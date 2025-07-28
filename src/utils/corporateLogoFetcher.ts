// Corporate Logo Fetcher with Web Scraping
// Enhanced logo finder that can scrape corporate websites and logo databases

export interface LogoFetchResult {
  vendorName: string;
  logoUrl: string | null;
  source: string;
  confidence: number; // 0-100, how confident we are this is the right logo
  alternativeUrls: string[];
  error?: string;
}

export interface LogoFetchOptions {
  useWebScraping: boolean;
  preferHighQuality: boolean;
  timeoutMs: number;
  maxRetries: number;
}

// Enhanced logo databases and APIs with reliable sources (Clearbit prioritized)
const LOGO_DATABASES = [
  {
    name: 'Clearbit Logo API',
    baseUrl: 'https://logo.clearbit.com/',
    getUrl: (company: string) => `https://logo.clearbit.com/${getDomainFromCompany(company)}?size=128`,
    priority: 1,
    hasTransparency: true,
    quality: 'high'
  },
  {
    name: 'Google Favicons High-Res',
    baseUrl: 'https://www.google.com/s2/favicons',
    getUrl: (company: string) => `https://www.google.com/s2/favicons?domain=${getDomainFromCompany(company)}&sz=128`,
    priority: 2,
    hasTransparency: false,
    quality: 'medium'
  },
  {
    name: 'Company Website Favicon',
    baseUrl: 'https://',
    getUrl: (company: string) => `https://${getDomainFromCompany(company)}/favicon.ico`,
    priority: 3,
    hasTransparency: false,
    quality: 'low'
  }
];

// Known MarTech companies and their logo URLs - Using reliable Clearbit API
const KNOWN_MARTECH_LOGOS: Record<string, string> = {
  // Major Platforms - High-resolution Clearbit logos
  'salesforce': 'https://logo.clearbit.com/salesforce.com?size=128',
  'salesforce cdp': 'https://logo.clearbit.com/salesforce.com?size=128',
  'salesforce marketing cloud': 'https://logo.clearbit.com/salesforce.com?size=128',
  'salesforce service cloud': 'https://logo.clearbit.com/salesforce.com?size=128',
  'salesforce marketing cloud intelligence': 'https://logo.clearbit.com/salesforce.com?size=128',
  'salesforce marketing cloud intelligence (datorama)': 'https://logo.clearbit.com/salesforce.com?size=128',
  'hubspot': 'https://logo.clearbit.com/hubspot.com?size=128',
  'google analytics': 'https://logo.clearbit.com/google.com?size=128',
  'google ads': 'https://logo.clearbit.com/google.com?size=128',
  'google tag manager': 'https://logo.clearbit.com/google.com?size=128',
  'adobe': 'https://logo.clearbit.com/adobe.com?size=128',
  'adobe experience platform': 'https://logo.clearbit.com/adobe.com?size=128',
  'adobe analytics': 'https://logo.clearbit.com/adobe.com?size=128',
  'mailchimp': 'https://logo.clearbit.com/mailchimp.com?size=128',
  'microsoft': 'https://logo.clearbit.com/microsoft.com?size=128',
  'google': 'https://logo.clearbit.com/google.com?size=128',
  'meta': 'https://logo.clearbit.com/meta.com?size=128',
  'facebook': 'https://logo.clearbit.com/facebook.com?size=128',
  'facebook ads': 'https://logo.clearbit.com/facebook.com?size=128',
  'instagram': 'https://logo.clearbit.com/instagram.com?size=128',
  'twitter': 'https://logo.clearbit.com/twitter.com?size=128',
  'linkedin': 'https://logo.clearbit.com/linkedin.com?size=128',
  'linkedin ads': 'https://logo.clearbit.com/linkedin.com?size=128',
  
  // Analytics & Attribution - Reliable Clearbit logos
  'adjust': 'https://logo.clearbit.com/adjust.com',
  'appsflyer': 'https://logo.clearbit.com/appsflyer.com',
  'mixpanel': 'https://logo.clearbit.com/mixpanel.com',
  'amplitude': 'https://logo.clearbit.com/amplitude.com',
  'segment': 'https://logo.clearbit.com/segment.com',
  'tealium': 'https://logo.clearbit.com/tealium.com',
  'treasure data': 'https://logo.clearbit.com/treasuredata.com',
  
  // Email & Marketing - Reliable Clearbit logos
  'sendgrid': 'https://logo.clearbit.com/sendgrid.com',
  'klaviyo': 'https://logo.clearbit.com/klaviyo.com',
  'constant contact': 'https://logo.clearbit.com/constantcontact.com',
  'campaign monitor': 'https://logo.clearbit.com/campaignmonitor.com',
  'twilio': 'https://logo.clearbit.com/twilio.com',
  'braze': 'https://logo.clearbit.com/braze.com',
  'postmark': 'https://logo.clearbit.com/postmarkapp.com',
  
  // Social Media Management - Reliable Clearbit logos
  'sprinklr': 'https://logo.clearbit.com/sprinklr.com',
  'hootsuite': 'https://logo.clearbit.com/hootsuite.com',
  'buffer': 'https://logo.clearbit.com/buffer.com',
  'sprout social': 'https://logo.clearbit.com/sproutsocial.com',
  'later': 'https://logo.clearbit.com/later.com',
  'socialbakers': 'https://logo.clearbit.com/socialbakers.com',
  'brandwatch': 'https://logo.clearbit.com/brandwatch.com',
  'mention': 'https://logo.clearbit.com/mention.com',
  
  // Customer Support - Reliable Clearbit logos
  'zendesk': 'https://logo.clearbit.com/zendesk.com',
  'intercom': 'https://logo.clearbit.com/intercom.com',
  'freshworks': 'https://logo.clearbit.com/freshworks.com',
  'freshdesk': 'https://logo.clearbit.com/freshdesk.com',
  'helpscout': 'https://logo.clearbit.com/helpscout.com',
  'drift': 'https://logo.clearbit.com/drift.com',
  
  // Additional Analytics Platforms - Reliable Clearbit logos
  'hotjar': 'https://logo.clearbit.com/hotjar.com',
  'crazy egg': 'https://logo.clearbit.com/crazyegg.com',
  'optimizely': 'https://logo.clearbit.com/optimizely.com',
  
  // Content Management - Reliable Clearbit logos
  'wordpress': 'https://logo.clearbit.com/wordpress.com',
  'contentful': 'https://logo.clearbit.com/contentful.com',
  'drupal': 'https://logo.clearbit.com/drupal.org',
  
  // E-commerce - Reliable Clearbit logos
  'shopify': 'https://logo.clearbit.com/shopify.com',
  'magento': 'https://logo.clearbit.com/magento.com',
  'woocommerce': 'https://logo.clearbit.com/woocommerce.com',
  'bigcommerce': 'https://logo.clearbit.com/bigcommerce.com',
  'stripe': 'https://logo.clearbit.com/stripe.com',
  
  // Additional Marketing Tools - Reliable Clearbit logos
  'tableau': 'https://logo.clearbit.com/tableau.com',
  'looker': 'https://logo.clearbit.com/looker.com',
  'the trade desk': 'https://logo.clearbit.com/thetradedesk.com',
  'aspiration': 'https://logo.clearbit.com/aspiration.com',
  'green room': 'https://logo.clearbit.com/greenroom.com',
  'cisco': 'https://logo.clearbit.com/cisco.com',
  'onetrust': 'https://logo.clearbit.com/onetrust.com',
  'onetrust - cookie compliance': 'https://logo.clearbit.com/onetrust.com',
  'prmanager (ex prgloo)': 'https://logo.clearbit.com/prmanager.com',
  'alchemer': 'https://logo.clearbit.com/alchemer.com',
  'screen engine | mindgame': 'https://logo.clearbit.com/screenengine.com',
  'sensor tower | pathmatics': 'https://logo.clearbit.com/sensortower.com',
  'statuspage': 'https://logo.clearbit.com/statuspage.io',
  'tymeshift': 'https://logo.clearbit.com/tymeshift.com',
  'adswerve': 'https://logo.clearbit.com/adswerve.com',
  'ayzenberg': 'https://logo.clearbit.com/ayzenberg.com',
  'rightpoint': 'https://logo.clearbit.com/rightpoint.com',
  'levelup analytics': 'https://logo.clearbit.com/levelupanalytics.com',
  'lotus themes': 'https://logo.clearbit.com/lotusthemes.com',
  'movable ink': 'https://logo.clearbit.com/movableink.com',
  
  // Exact vendor names from your failing list
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
  'Sprinklr': 'https://logo.clearbit.com/sprinklr.com',
  'Statuspage': 'https://logo.clearbit.com/statuspage.io',
  'Stream Hatchet': 'https://logo.clearbit.com/streamhatchet.com',
  'The Trade Desk': 'https://logo.clearbit.com/thetradedesk.com',
  'Treasure Data': 'https://logo.clearbit.com/treasuredata.com',
  'Tymeshift': 'https://logo.clearbit.com/zendesk.com?size=128', // Acquired by Zendesk in 2023
  'Guru': 'https://logo.clearbit.com/getguru.com?size=128',
  'PRManager': 'https://ui-avatars.com/api/?name=PR&background=4F46E5&color=FFFFFF&size=128&bold=true&format=png',
  'PRManager (ex PRGloo)': 'https://ui-avatars.com/api/?name=PR&background=4F46E5&color=FFFFFF&size=128&bold=true&format=png',
  'Screen Engine': 'https://logo.clearbit.com/screenengineasi.com?size=128',
  'Screen Engine | MindGame': 'https://logo.clearbit.com/screenengineasi.com?size=128',
  'Tubular': 'https://logo.clearbit.com/tubularlabs.com',
  
  // Common variations and abbreviations
  'ttd': 'https://logo.clearbit.com/thetradedesk.com',
  'trade desk': 'https://logo.clearbit.com/thetradedesk.com',
  'google universal analytics': 'https://logo.clearbit.com/google.com',
  'ga4': 'https://logo.clearbit.com/google.com',
  'gtm': 'https://logo.clearbit.com/google.com',
  'gads': 'https://logo.clearbit.com/google.com',
  'salesforce pardot': 'https://logo.clearbit.com/salesforce.com',
  'pardot': 'https://logo.clearbit.com/salesforce.com',
  'marketo': 'https://logo.clearbit.com/marketo.com',
  'eloqua': 'https://logo.clearbit.com/oracle.com',
  'oracle eloqua': 'https://logo.clearbit.com/oracle.com',
  'slack': 'https://logo.clearbit.com/slack.com',
  'zoom': 'https://logo.clearbit.com/zoom.us',
  'teams': 'https://logo.clearbit.com/microsoft.com',
  'microsoft teams': 'https://logo.clearbit.com/microsoft.com',
  'asana': 'https://logo.clearbit.com/asana.com',
  'trello': 'https://logo.clearbit.com/trello.com',
  'jira': 'https://logo.clearbit.com/atlassian.com',
  'confluence': 'https://logo.clearbit.com/atlassian.com',
  'notion': 'https://logo.clearbit.com/notion.so',
  'airtable': 'https://logo.clearbit.com/airtable.com',
  'monday': 'https://logo.clearbit.com/monday.com',
  'monday.com': 'https://logo.clearbit.com/monday.com'
};

// Function to extract domain from company name
function getDomainFromCompany(companyName: string): string {
  // Clean up company name and try to guess domain
  const cleaned = companyName.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/inc$|llc$|corp$|ltd$|limited$|cdp$|platform$/, '');
  
  return `${cleaned}.com`;
}

// Function to find logo by fuzzy matching vendor names
function findLogoByFuzzyMatch(vendorName: string): string | null {
  const normalizedVendor = vendorName.toLowerCase().trim();
  
  // First try exact match
  if (KNOWN_MARTECH_LOGOS[normalizedVendor]) {
    return KNOWN_MARTECH_LOGOS[normalizedVendor];
  }
  
  // Try fuzzy matching - check if vendor name contains any of our known brands
  for (const [knownName, logoUrl] of Object.entries(KNOWN_MARTECH_LOGOS)) {
    const knownBrand = knownName.toLowerCase();
    
    // Check if vendor name contains the brand name
    if (normalizedVendor.includes(knownBrand) || knownBrand.includes(normalizedVendor.split(' ')[0])) {
      console.log(`🎯 Fuzzy match found: "${vendorName}" → "${knownName}" → ${logoUrl}`);
      return logoUrl;
    }
    
    // Check for common brand variations
    const brandCore = knownBrand.split(' ')[0]; // Get first word (e.g., "salesforce" from "salesforce cdp")
    if (normalizedVendor.includes(brandCore) && brandCore.length > 3) {
      console.log(`🎯 Brand core match found: "${vendorName}" → "${knownName}" → ${logoUrl}`);
      return logoUrl;
    }
  }
  
  return null;
}

// Function to try multiple domain variations
function getDomainVariations(companyName: string): string[] {
  const base = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  return [
    `${base}.com`,
    `${base}.io`,
    `${base}.co`,
    `${base}.net`,
    `${base}.org`,
    `get${base}.com`,
    `${base}app.com`,
    `use${base}.com`
  ];
}

// Function to scrape a website for logo information
async function scrapeWebsiteForLogo(domain: string): Promise<string[]> {
  const logoUrls: string[] = [];
  
  try {
    // Try common logo paths
    const commonPaths = [
      '/logo.svg',
      '/logo.png',
      '/assets/logo.svg',
      '/assets/logo.png',
      '/images/logo.svg',
      '/images/logo.png',
      '/static/logo.svg',
      '/static/logo.png',
      '/media/logo.svg',
      '/media/logo.png',
      '/wp-content/uploads/logo.svg',
      '/wp-content/uploads/logo.png'
    ];
    
    for (const path of commonPaths) {
      logoUrls.push(`https://${domain}${path}`);
    }
    
    // Add favicon as fallback
    logoUrls.push(`https://${domain}/favicon.ico`);
    logoUrls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    
  } catch (error) {
    console.error(`Error scraping ${domain}:`, error);
  }
  
  return logoUrls;
}

// Function to test if a logo URL is accessible and valid
async function testLogoUrl(url: string): Promise<{ valid: boolean; size?: number }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // Check if it's an image
      if (contentType && contentType.startsWith('image/')) {
        return {
          valid: true,
          size: contentLength ? parseInt(contentLength) : undefined
        };
      }
    }
    
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// Main function to fetch corporate logo
export async function fetchCorporateLogo(
  vendorName: string,
  options: LogoFetchOptions = {
    useWebScraping: true,
    preferHighQuality: true,
    timeoutMs: 10000,
    maxRetries: 3
  }
): Promise<LogoFetchResult> {
  const normalizedName = vendorName.toLowerCase().trim();
  const alternativeUrls: string[] = [];
  
  // First, try fuzzy matching for known logos
  const fuzzyMatchedLogo = findLogoByFuzzyMatch(vendorName);
  if (fuzzyMatchedLogo) {
    return {
      vendorName,
      logoUrl: fuzzyMatchedLogo,
      source: 'Known MarTech Database (Fuzzy Match)',
      confidence: 90,
      alternativeUrls: []
    };
  }
  
  // Try logo databases
  for (const database of LOGO_DATABASES) {
    try {
      const logoUrl = database.getUrl(vendorName);
      const testResult = await testLogoUrl(logoUrl);
      
      if (testResult.valid) {
        return {
          vendorName,
          logoUrl,
          source: database.name,
          confidence: 85,
          alternativeUrls: []
        };
      } else {
        alternativeUrls.push(logoUrl);
      }
    } catch (error) {
      console.error(`Error testing ${database.name}:`, error);
    }
  }
  
  // Try web scraping if enabled
  if (options.useWebScraping) {
    const domains = getDomainVariations(vendorName);
    
    for (const domain of domains) {
      try {
        const logoUrls = await scrapeWebsiteForLogo(domain);
        
        for (const logoUrl of logoUrls) {
          const testResult = await testLogoUrl(logoUrl);
          
          if (testResult.valid) {
            return {
              vendorName,
              logoUrl,
              source: `Website Scraping (${domain})`,
              confidence: 70,
              alternativeUrls: logoUrls.filter(url => url !== logoUrl)
            };
          } else {
            alternativeUrls.push(logoUrl);
          }
        }
      } catch {
        console.error(`Error scraping ${domain}`);
      }
    }
  }
  
  // If no logo found, return null with alternatives
  return {
    vendorName,
    logoUrl: null,
    source: 'None found',
    confidence: 0,
    alternativeUrls,
    error: 'No valid logo URL found after testing all sources'
  };
}

// Function to batch fetch logos for multiple vendors
export async function batchFetchCorporateLogos(
  vendors: Array<{ id: string; name: string; categories: string[] }>,
  options?: LogoFetchOptions,
  onProgress?: (completed: number, total: number, current: string) => void
): Promise<Array<{ vendorId: string; result: LogoFetchResult }>> {
  const results: Array<{ vendorId: string; result: LogoFetchResult }> = [];
  
  for (let i = 0; i < vendors.length; i++) {
    const vendor = vendors[i];
    
    if (onProgress) {
      onProgress(i, vendors.length, vendor.name);
    }
    
    try {
      const result = await fetchCorporateLogo(vendor.name, options);
      results.push({ vendorId: vendor.id, result });
      
      // Small delay to be respectful to servers
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      results.push({
        vendorId: vendor.id,
        result: {
          vendorName: vendor.name,
          logoUrl: null,
          source: 'Error',
          confidence: 0,
          alternativeUrls: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }
  
  if (onProgress) {
    onProgress(vendors.length, vendors.length, 'Complete');
  }
  
  return results;
}

// Function to generate fallback logo with better design
export function generateHighQualityFallback(vendorName: string, category: string): string {
  const initials = vendorName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2); // Use 2 letters for better readability
  
  // Modern color palette by category
  const categoryColors: Record<string, { bg: string; text: string }> = {
    cdp: { bg: '4F46E5', text: 'FFFFFF' },           // Indigo
    email: { bg: '0EA5E9', text: 'FFFFFF' },         // Sky blue
    analytics: { bg: 'F59E0B', text: 'FFFFFF' },     // Amber
    web: { bg: '8B5CF6', text: 'FFFFFF' },           // Violet
    'social-publishing': { bg: 'EC4899', text: 'FFFFFF' }, // Pink
    'social-listening': { bg: '10B981', text: 'FFFFFF' },  // Emerald
    'talent-influencer': { bg: 'F97316', text: 'FFFFFF' }, // Orange
    'pr-comms': { bg: '6366F1', text: 'FFFFFF' },     // Indigo
    'customer-service': { bg: '64748B', text: 'FFFFFF' }, // Slate
    'paid-data': { bg: '7C2D12', text: 'FFFFFF' },    // Brown
    advertising: { bg: 'DC2626', text: 'FFFFFF' },    // Red
    default: { bg: '6B7280', text: 'FFFFFF' }         // Gray
  };
  
  const colors = categoryColors[category] || categoryColors.default;
  
  // Use a service that generates better-looking avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors.bg}&color=${colors.text}&size=128&bold=true&format=png`;
}

// Export utility functions
export { testLogoUrl, getDomainVariations, KNOWN_MARTECH_LOGOS };