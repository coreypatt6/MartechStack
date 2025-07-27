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

// Enhanced logo databases and APIs with official corporate sources
const LOGO_DATABASES = [
  {
    name: 'Clearbit Logo API',
    baseUrl: 'https://logo.clearbit.com/',
    getUrl: (company: string) => `https://logo.clearbit.com/${getDomainFromCompany(company)}`,
    priority: 1,
    hasTransparency: true,
    quality: 'high'
  },
  {
    name: 'LogoDev API',
    baseUrl: 'https://img.logo.dev/',
    getUrl: (company: string) => `https://img.logo.dev/${getDomainFromCompany(company)}?token=pk_X1pD8rKoRpKmhJheIwkZrQ&format=png&width=400`,
    priority: 2,
    hasTransparency: true,
    quality: 'high'
  },
  {
    name: 'Google Favicons High-Res',
    baseUrl: 'https://www.google.com/s2/favicons',
    getUrl: (company: string) => `https://www.google.com/s2/favicons?domain=${getDomainFromCompany(company)}&sz=256`,
    priority: 3,
    hasTransparency: true,
    quality: 'medium'
  },
  {
    name: 'Company Website Favicon',
    baseUrl: 'https://',
    getUrl: (company: string) => `https://${getDomainFromCompany(company)}/favicon.ico`,
    priority: 4,
    hasTransparency: false,
    quality: 'low'
  },
  {
    name: 'Brandfetch API',
    baseUrl: 'https://api.brandfetch.io/v2/brands/',
    getUrl: (company: string) => `https://api.brandfetch.io/v2/brands/${getDomainFromCompany(company)}`,
    priority: 5,
    hasTransparency: true,
    quality: 'high'
  }
];

// Known MarTech companies and their logo URLs
const KNOWN_MARTECH_LOGOS: Record<string, string> = {
  // Major Platforms - Official corporate logos with transparent backgrounds
  'salesforce': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
  'hubspot': 'https://www.hubspot.com/hubfs/assets/hubspot.com/style-guide/brand-guidelines/guidelines_sprocket-1.png',
  'google analytics': 'https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg',
  'adobe': 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg',
  'mailchimp': 'https://eep.io/images/yzp4yyPofdYiCanTdGXQC0sNFb8=/2400x0/filters:no_upscale()/eep/images/landing_pages/brand/mailchimp-freddie-wink.png',
  'microsoft': 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31',
  'google': 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png',
  'meta': 'https://about.meta.com/brand/resources/meta/logo/',
  'facebook': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
  'instagram': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
  'twitter': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg',
  'linkedin': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
  
  // Analytics & Attribution - Official corporate logos
  'adjust': 'https://adjust.com/wp-content/uploads/2023/01/adjust-logo-primary.svg',
  'appsflyer': 'https://www.appsflyer.com/wp-content/uploads/2021/05/AF_Logo_Primary_Blue.svg',
  'mixpanel': 'https://mixpanel.com/wp-content/themes/mixpanel/assets/images/mixpanel-logo.svg',
  'amplitude': 'https://amplitude.com/wp-content/uploads/2021/03/amplitude-logo.svg',
  'segment': 'https://segment.com/docs/images/segment-logo.svg',
  'google tag manager': 'https://www.gstatic.com/analytics-suite/header/suite/v2/ic_tag_manager.svg',
  'google ads': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Ads_logo.svg',
  'facebook ads': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
  'linkedin ads': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
  
  // Email & Marketing - Official corporate logos
  'sendgrid': 'https://sendgrid.com/wp-content/themes/sgdotcom/assets/img/sendgrid-logo.svg',
  'klaviyo': 'https://www.klaviyo.com/wp-content/uploads/2021/07/klaviyo-logo.svg',
  'constant contact': 'https://www.constantcontact.com/images/logo-cc.svg',
  'campaign monitor': 'https://www.campaignmonitor.com/assets/images/cm-logo.svg',
  'twilio': 'https://www.twilio.com/content/dam/twilio-com/global/en/blog/legacy/2018/red-logo.png',
  'postmark': 'https://postmarkapp.com/images/postmark-logo.svg',
  
  // Social Media Management - Official corporate logos
  'sprinklr': 'https://www.sprinklr.com/wp-content/uploads/2021/06/sprinklr-logo.svg',
  'hootsuite': 'https://hootsuite.com/uploads/images/brand/hootsuite-logo.svg',
  'buffer': 'https://buffer.com/static/icons/buffer-logo.svg',
  'sprout social': 'https://sproutsocial.com/insights/wp-content/themes/sprout/assets/images/sprout-social-logo.svg',
  'later': 'https://later.com/wp-content/uploads/2021/01/later-logo.svg',
  'socialbakers': 'https://www.socialbakers.com/images/socialbakers-logo.svg',
  
  // Customer Support - Official corporate logos
  'zendesk': 'https://d1eipm3vz40hy0.cloudfront.net/images/AMER/zendesk-logo.svg',
  'intercom': 'https://www.intercom.com/brand/logo/intercom-logo-mark.svg',
  'freshworks': 'https://www.freshworks.com/static-assets/images/common/company/logos/logo-fworks-black.svg',
  'helpscout': 'https://www.helpscout.com/images/brand/help-scout-logo.svg',
  'drift': 'https://www.drift.com/wp-content/uploads/2021/01/drift-logo.svg',
  
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
  
  // E-commerce - Official corporate logos
  'shopify': 'https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg',
  'magento': 'https://magento.com/sites/default/files/2021-01/magento-logo.svg',
  'woocommerce': 'https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce.svg',
  'bigcommerce': 'https://www.bigcommerce.com/assets/images/bc-logo.svg',
  'stripe': 'https://stripe.com/img/v3/home/social.png'
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