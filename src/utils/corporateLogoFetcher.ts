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

// Known logo databases and APIs
const LOGO_DATABASES = [
  {
    name: 'Clearbit',
    baseUrl: 'https://logo.clearbit.com/',
    getUrl: (company: string) => `https://logo.clearbit.com/${getDomainFromCompany(company)}`,
    priority: 1
  },
  {
    name: 'Brandfetch',
    baseUrl: 'https://api.brandfetch.io/v2/brands/',
    getUrl: (company: string) => `https://api.brandfetch.io/v2/brands/${getDomainFromCompany(company)}`,
    priority: 2
  },
  {
    name: 'LogoAPI',
    baseUrl: 'https://api.logo.dev/',
    getUrl: (company: string) => `https://api.logo.dev/search?q=${encodeURIComponent(company)}`,
    priority: 3
  }
];

// Known MarTech companies and their logo URLs
const KNOWN_MARTECH_LOGOS: Record<string, string> = {
  // Major Platforms - All with transparent backgrounds
  'salesforce': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
  'hubspot': 'https://www.hubspot.com/hubfs/assets/hubspot.com/style-guide/brand-guidelines/guidelines_sprocket-1.png',
  'google analytics': 'https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg',
  'adobe': 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg',
  'mailchimp': 'https://eep.io/images/yzp4yyPofdYiCanTdGXQC0sNFb8=/2400x0/filters:no_upscale()/eep/images/landing_pages/brand/mailchimp-freddie-wink.png',
  
  // Analytics & Attribution - Transparent backgrounds
  'adjust': 'https://logo.clearbit.com/adjust.com',
  'appsflyer': 'https://logo.clearbit.com/appsflyer.com',
  'mixpanel': 'https://logo.clearbit.com/mixpanel.com',
  'amplitude': 'https://logo.clearbit.com/amplitude.com',
  'segment': 'https://logo.clearbit.com/segment.com',
  
  // Email & Marketing - Transparent backgrounds
  'sendgrid': 'https://sendgrid.com/wp-content/themes/sgdotcom/pages/resource/brand/2016/SendGrid-Logomark.svg',
  'klaviyo': 'https://logo.clearbit.com/klaviyo.com',
  'constant contact': 'https://logo.clearbit.com/constantcontact.com',
  'campaign monitor': 'https://logo.clearbit.com/campaignmonitor.com',
  
  // Social Media Management - Transparent backgrounds
  'sprinklr': 'https://logo.clearbit.com/sprinklr.com',
  'hootsuite': 'https://logo.clearbit.com/hootsuite.com',
  'buffer': 'https://logo.clearbit.com/buffer.com',
  'sprout social': 'https://logo.clearbit.com/sproutsocial.com',
  
  // Customer Support - Transparent backgrounds
  'zendesk': 'https://logo.clearbit.com/zendesk.com',
  'intercom': 'https://logo.clearbit.com/intercom.com',
  'freshworks': 'https://logo.clearbit.com/freshworks.com',
  
  // Analytics Platforms - Transparent backgrounds
  'google tag manager': 'https://www.gstatic.com/analytics-suite/header/suite/v2/ic_tag_manager.svg',
  'hotjar': 'https://logo.clearbit.com/hotjar.com',
  'crazy egg': 'https://logo.clearbit.com/crazyegg.com',
  
  // Ad Platforms - Transparent backgrounds
  'facebook ads': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
  'google ads': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Ads_logo.svg',
  'linkedin ads': 'https://logo.clearbit.com/linkedin.com',
  'twitter ads': 'https://logo.clearbit.com/twitter.com',
  
  // Content Management - Transparent backgrounds
  'wordpress': 'https://logo.clearbit.com/wordpress.com',
  'contentful': 'https://logo.clearbit.com/contentful.com',
  'drupal': 'https://logo.clearbit.com/drupal.org',
  
  // E-commerce - Transparent backgrounds
  'shopify': 'https://logo.clearbit.com/shopify.com',
  'magento': 'https://logo.clearbit.com/magento.com',
  'woocommerce': 'https://logo.clearbit.com/woocommerce.com'
};

// Function to extract domain from company name
function getDomainFromCompany(companyName: string): string {
  // Clean up company name and try to guess domain
  const cleaned = companyName.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/inc$|llc$|corp$|ltd$|limited$/, '');
  
  return `${cleaned}.com`;
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
  
  // First, check if we have a known logo
  if (KNOWN_MARTECH_LOGOS[normalizedName]) {
    return {
      vendorName,
      logoUrl: KNOWN_MARTECH_LOGOS[normalizedName],
      source: 'Known MarTech Database',
      confidence: 95,
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