// Logo Updater Utility
// This script helps update vendor logos systematically

export interface LogoUpdate {
  vendorId: string;
  vendorName: string;
  currentLogo: string;
  newLogo: string;
  source: string;
}

// Common logo sources for major vendors
export const LOGO_SOURCES: Record<string, string> = {
  // CDP Vendors
  'Salesforce CDP': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
  'Adobe Experience Platform': 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg',
  'Segment': 'https://segment.com/static/segment-logo.svg',
  'Tealium': 'https://tealium.com/wp-content/uploads/2021/03/tealium-logo.svg',
  'Treasure Data': 'https://www.treasuredata.com/wp-content/uploads/2021/03/td-logo.svg',
  
  // Email Vendors
  'Mailchimp': 'https://eep.io/images/yzp4yyPofdYiCanTdGXQC0sNFb8=/2400x0/filters:no_upscale()/eep/images/landing_pages/brand/mailchimp-freddie-wink.png',
  'SendGrid': 'https://sendgrid.com/wp-content/uploads/2016/05/logo-300x100.png',
  'Klaviyo': 'https://www.klaviyo.com/wp-content/uploads/2020/07/klaviyo-logo.svg',
  'Twilio': 'https://www.twilio.com/content/dam/twilio-com/global/en/blog/wp-content/uploads/2016/10/Twilio_logo_red.png',
  'Braze': 'https://www.braze.com/assets/images/braze-logo.svg',
  'Salesforce Marketing Cloud': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
  
  // Analytics Vendors
  'Google Analytics': 'https://developers.google.com/analytics/images/terms/logo_lockup_analytics_icon_vertical_black_2x.png',
  'Adobe Analytics': 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg',
  'Tableau': 'https://www.tableau.com/sites/default/files/2020-07/Tableau_Logo.png',
  'Looker': 'https://looker.com/assets/images/looker-logo.svg',
  'Mixpanel': 'https://mixpanel.com/assets/images/mixpanel-logo.svg',
  'Appsflyer': 'https://www.appsflyer.com/wp-content/uploads/2020/03/appsflyer-logo.svg',
  'Adjust': 'https://www.adjust.com/wp-content/uploads/2020/03/adjust-logo.svg',
  
  // Social Media
  'Hootsuite': 'https://hootsuite.com/wp-content/uploads/2020/03/hootsuite-logo.svg',
  'Buffer': 'https://buffer.com/library/content/images/buffer-logo.svg',
  'Sprout Social': 'https://sproutsocial.com/wp-content/uploads/2020/03/sprout-social-logo.svg',
  'Sprinklr': 'https://www.sprinklr.com/wp-content/uploads/2020/03/sprinklr-logo.svg',
  
  // Customer Service
  'Zendesk': 'https://d1eipm3vz40hy0.cloudfront.net/images/AMER/zendesk-logo.svg',
  'Intercom': 'https://www.intercom.com/assets/images/intercom-logo.svg',
  'Freshdesk': 'https://freshdesk.com/wp-content/uploads/2020/03/freshdesk-logo.svg',
  
  // Advertising
  'Google Ads': 'https://ads.google.com/static/images/google-ads-logo.svg',
  'Facebook Ads': 'https://www.facebook.com/images/fb_icon_325x325.png',
  'The Trade Desk': 'https://www.thetradedesk.com/wp-content/uploads/2020/03/ttd-logo.svg',
  
  // Influencer Marketing
  'AspireIQ': 'https://www.aspireiq.com/wp-content/uploads/2020/03/aspireiq-logo.svg',
  'Grin': 'https://grin.co/wp-content/uploads/2020/03/grin-logo.svg',
  'CreatorIQ': 'https://www.creatoriq.com/wp-content/uploads/2020/03/creatoriq-logo.svg',
  
  // PR & Communications
  'Cision': 'https://www.cision.com/wp-content/uploads/2020/03/cision-logo.svg',
  'Meltwater': 'https://www.meltwater.com/wp-content/uploads/2020/03/meltwater-logo.svg',
  'Muck Rack': 'https://muckrack.com/wp-content/uploads/2020/03/muck-rack-logo.svg',
  
  // Web & Development
  'Optimizely': 'https://www.optimizely.com/wp-content/uploads/2020/03/optimizely-logo.svg',
  'Hotjar': 'https://www.hotjar.com/wp-content/uploads/2020/03/hotjar-logo.svg',
  'Ahrefs Webmaster Tools': 'https://ahrefs.com/wp-content/uploads/2020/03/ahrefs-logo.svg',
  'Bit.ly': 'https://bitly.com/wp-content/uploads/2020/03/bitly-logo.svg',
  'BrowserStack': 'https://www.browserstack.com/wp-content/uploads/2020/03/browserstack-logo.svg',
  'Contentful': 'https://www.contentful.com/wp-content/uploads/2020/03/contentful-logo.svg',
  
  // Data & Analytics
  'Databricks': 'https://databricks.com/wp-content/uploads/2020/03/databricks-logo.svg',
  'Liveramp': 'https://liveramp.com/wp-content/uploads/2020/03/liveramp-logo.svg',
  'Infosum': 'https://www.infosum.com/wp-content/uploads/2020/03/infosum-logo.svg',
  
  // Testing & Quality
  'Litmus': 'https://www.litmus.com/wp-content/uploads/2020/03/litmus-logo.svg',
  'Code Climate Inc': 'https://codeclimate.com/wp-content/uploads/2020/03/codeclimate-logo.svg',
  
  // Gaming & Entertainment
  'DeltaDNA': 'https://deltadna.com/wp-content/uploads/2020/03/deltadna-logo.svg',
  'Stream Hatchet': 'https://streamhatchet.com/wp-content/uploads/2020/03/streamhatchet-logo.svg',
  'Tubular': 'https://tubularlabs.com/wp-content/uploads/2020/03/tubular-logo.svg',
  
  // Customer Support
  'Directly': 'https://directly.com/wp-content/uploads/2020/03/directly-logo.svg',
  'Helpshift': 'https://helpshift.com/wp-content/uploads/2020/03/helpshift-logo.svg',
  'Quiq': 'https://quiq.com/wp-content/uploads/2020/03/quiq-logo.svg',
  'Salesforce Service Cloud': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
  
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
export function updateVendorLogos(vendors: unknown[]): unknown[] {
  return vendors.map(vendor => {
    const newLogo = LOGO_SOURCES[vendor.name];
    
    if (newLogo && newLogo !== vendor.logo) {
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