import { Category, Vendor } from '../types';

export const mockVendors: Vendor[] = [
  // Customer Data Platform (CDP)
  {
    id: 'v1',
    name: 'Salesforce CDP',
    logo: 'https://logo.clearbit.com/salesforce.com',
    deploymentStatus: 'Active',
    capabilities: 'Customer data unification, real-time segmentation, journey orchestration',
    label: ['Rockstar'],
    annualCost: 250000,
    renewalDate: '2024-12-31',
    categories: ['cdp']
  },
  {
    id: 'v2',
    name: 'Adobe Experience Platform',
    logo: 'https://logo.clearbit.com/adobe.com',
    deploymentStatus: 'Active',
    capabilities: 'Real-time customer profiles, AI-driven insights, cross-channel activation',
    label: ['2K'],
    annualCost: 300000,
    renewalDate: '2024-08-15',
    categories: ['cdp']
  },
  {
    id: 'v3',
    name: 'Segment',
    logo: 'https://logo.clearbit.com/segment.com',
    deploymentStatus: 'Active',
    capabilities: 'Data collection, customer data infrastructure, audience management',
    label: ['Zynga'],
    annualCost: 180000,
    renewalDate: '2024-10-30',
    categories: ['cdp']
  },
  {
    id: 'v4',
    name: 'Tealium',
    logo: 'https://logo.clearbit.com/tealium.com',
    deploymentStatus: 'Pending',
    capabilities: 'Tag management, customer data orchestration, privacy compliance',
    label: ['Ghost Story'],
    annualCost: 120000,
    renewalDate: '2024-06-20',
    categories: ['cdp']
  },

  // Email & SMS Marketing
  {
    id: 'v5',
    name: 'Mailchimp',
    logo: 'https://logo.clearbit.com/mailchimp.com',
    deploymentStatus: 'Active',
    capabilities: 'Email marketing, automation, A/B testing, audience segmentation',
    label: ['2K'],
    annualCost: 45000,
    renewalDate: '2024-09-15',
    categories: ['email']
  },
  {
    id: 'v6',
    name: 'SendGrid',
    logo: 'https://logo.clearbit.com/sendgrid.com',
    deploymentStatus: 'Active',
    capabilities: 'Transactional email, marketing campaigns, email deliverability',
    label: ['Rockstar'],
    annualCost: 60000,
    renewalDate: '2024-11-30',
    categories: ['email']
  },
  {
    id: 'v7',
    name: 'Klaviyo',
    logo: 'https://logo.clearbit.com/klaviyo.com',
    deploymentStatus: 'Active',
    capabilities: 'E-commerce email marketing, SMS campaigns, customer analytics',
    label: ['Zynga'],
    annualCost: 75000,
    renewalDate: '2024-07-10',
    categories: ['email']
  },
  {
    id: 'v8',
    name: 'Twilio',
    logo: 'https://logo.clearbit.com/twilio.com',
    deploymentStatus: 'Active',
    capabilities: 'SMS marketing, voice campaigns, programmable communications',
    label: ['2K', 'Rockstar'],
    annualCost: 90000,
    renewalDate: '2024-05-25',
    categories: ['email']
  },
  {
    id: 'v9',
    name: 'Braze',
    logo: 'https://logo.clearbit.com/braze.com',
    deploymentStatus: 'Pending',
    capabilities: 'Multi-channel messaging, customer engagement, lifecycle marketing',
    label: ['Ghost Story'],
    annualCost: 150000,
    renewalDate: '2024-12-05',
    categories: ['email']
  },

  // Web Analytics & Optimization
  {
    id: 'v10',
    name: 'Google Analytics',
    logo: 'https://developers.google.com/analytics/images/terms/logo_lockup_analytics_icon_vertical_black_2x.png',
    deploymentStatus: 'Active',
    capabilities: 'Web analytics, conversion tracking, audience insights, attribution',
    label: ['2K', 'Rockstar', 'Zynga'],
    annualCost: 150000,
    renewalDate: '2024-03-31',
    categories: ['web', 'analytics']
  },
  {
    id: 'v11',
    name: 'Adobe Analytics',
    logo: 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg',
    deploymentStatus: 'Active',
    capabilities: 'Advanced analytics, real-time reporting, predictive analytics',
    label: ['Rockstar'],
    annualCost: 200000,
    renewalDate: '2024-08-15',
    categories: ['web', 'analytics']
  },
  {
    id: 'v12',
    name: 'Optimizely',
    logo: 'https://via.placeholder.com/64x64/0073E6/FFFFFF?text=OPT',
    deploymentStatus: 'Active',
    capabilities: 'A/B testing, experimentation, personalization, feature flags',
    label: ['Zynga'],
    annualCost: 120000,
    renewalDate: '2024-09-30',
    categories: ['web']
  },
  {
    id: 'v13',
    name: 'Hotjar',
    logo: 'https://via.placeholder.com/64x64/FD3A69/FFFFFF?text=HOT',
    deploymentStatus: 'Active',
    capabilities: 'User behavior analytics, heatmaps, session recordings, surveys',
    label: ['2K'],
    annualCost: 35000,
    renewalDate: '2024-06-15',
    categories: ['web']
  },

  // Social Media Publishing
  {
    id: 'v14',
    name: 'Hootsuite',
    logo: 'https://via.placeholder.com/64x64/1DA1F2/FFFFFF?text=HOO',
    deploymentStatus: 'Active',
    capabilities: 'Social media management, scheduling, analytics, team collaboration',
    label: ['Rockstar'],
    annualCost: 25000,
    renewalDate: '2024-11-30',
    categories: ['social-publishing']
  },
  {
    id: 'v15',
    name: 'Buffer',
    logo: 'https://via.placeholder.com/64x64/168EEA/FFFFFF?text=BUF',
    deploymentStatus: 'Active',
    capabilities: 'Social media scheduling, content planning, performance analytics',
    label: ['2K'],
    annualCost: 18000,
    renewalDate: '2024-04-20',
    categories: ['social-publishing']
  },
  {
    id: 'v16',
    name: 'Sprout Social',
    logo: 'https://via.placeholder.com/64x64/59CB59/FFFFFF?text=SPR',
    deploymentStatus: 'Pending',
    capabilities: 'Social media management, customer care, social listening',
    label: ['Zynga'],
    annualCost: 40000,
    renewalDate: '2024-07-10',
    categories: ['social-publishing', 'social-listening']
  },

  // Social Media Listening
  {
    id: 'v17',
    name: 'Brandwatch',
    logo: 'https://via.placeholder.com/64x64/FF6B35/FFFFFF?text=BW',
    deploymentStatus: 'Active',
    capabilities: 'Social listening, brand monitoring, sentiment analysis, trend tracking',
    label: ['Rockstar'],
    annualCost: 85000,
    renewalDate: '2024-10-15',
    categories: ['social-listening']
  },
  {
    id: 'v18',
    name: 'Mention',
    logo: 'https://via.placeholder.com/64x64/00D4AA/FFFFFF?text=MEN',
    deploymentStatus: 'Active',
    capabilities: 'Real-time monitoring, competitor analysis, influencer identification',
    label: ['2K'],
    annualCost: 30000,
    renewalDate: '2024-05-30',
    categories: ['social-listening']
  },

  // Customer Service
  {
    id: 'v19',
    name: 'Zendesk',
    logo: 'https://d1eipm3vz40hy0.cloudfront.net/images/AMER/zendesk-logo.svg',
    deploymentStatus: 'Active',
    capabilities: 'Customer support, ticketing, knowledge base, live chat',
    label: ['Zynga'],
    annualCost: 60000,
    renewalDate: '2024-08-31',
    categories: ['customer-service']
  },
  {
    id: 'v20',
    name: 'Intercom',
    logo: 'https://via.placeholder.com/64x64/1F8DED/FFFFFF?text=INT',
    deploymentStatus: 'Active',
    capabilities: 'Customer messaging, chatbots, help desk, product tours',
    label: ['2K'],
    annualCost: 45000,
    renewalDate: '2024-12-20',
    categories: ['customer-service']
  },
  {
    id: 'v21',
    name: 'Freshdesk',
    logo: 'https://via.placeholder.com/64x64/06C755/FFFFFF?text=FD',
    deploymentStatus: 'Pending',
    capabilities: 'Multi-channel support, automation, reporting, SLA management',
    label: ['Ghost Story'],
    annualCost: 35000,
    renewalDate: '2024-09-10',
    categories: ['customer-service']
  },

  // Marketing Analytics
  {
    id: 'v22',
    name: 'Tableau',
    logo: 'https://via.placeholder.com/64x64/E97627/FFFFFF?text=TAB',
    deploymentStatus: 'Active',
    capabilities: 'Data visualization, business intelligence, advanced analytics',
    label: ['Rockstar'],
    annualCost: 180000,
    renewalDate: '2024-06-30',
    categories: ['analytics']
  },
  {
    id: 'v23',
    name: 'Looker',
    logo: 'https://via.placeholder.com/64x64/4285F4/FFFFFF?text=LOO',
    deploymentStatus: 'Active',
    capabilities: 'Modern BI platform, data modeling, embedded analytics',
    label: ['Zynga'],
    annualCost: 150000,
    renewalDate: '2024-11-15',
    categories: ['analytics']
  },
  {
    id: 'v24',
    name: 'Mixpanel',
    logo: 'https://via.placeholder.com/64x64/7856FF/FFFFFF?text=MIX',
    deploymentStatus: 'Active',
    capabilities: 'Product analytics, user behavior tracking, cohort analysis',
    label: ['2K'],
    annualCost: 95000,
    renewalDate: '2024-04-25',
    categories: ['analytics']
  },

  // Paid & Data Collaboration
  {
    id: 'v25',
    name: 'Google Ads',
    logo: 'https://via.placeholder.com/64x64/4285F4/FFFFFF?text=GAD',
    deploymentStatus: 'Active',
    capabilities: 'Search advertising, display campaigns, video ads, shopping ads',
    label: ['2K', 'Rockstar'],
    annualCost: 500000,
    renewalDate: '2024-12-31',
    categories: ['paid-data']
  },
  {
    id: 'v26',
    name: 'Facebook Ads',
    logo: 'https://via.placeholder.com/64x64/1877F2/FFFFFF?text=FB',
    deploymentStatus: 'Active',
    capabilities: 'Social media advertising, audience targeting, creative optimization',
    label: ['Zynga'],
    annualCost: 400000,
    renewalDate: '2024-10-15',
    categories: ['paid-data']
  },
  {
    id: 'v27',
    name: 'The Trade Desk',
    logo: 'https://via.placeholder.com/64x64/00A651/FFFFFF?text=TTD',
    deploymentStatus: 'Active',
    capabilities: 'Programmatic advertising, data-driven targeting, cross-device campaigns',
    label: ['Rockstar'],
    annualCost: 350000,
    renewalDate: '2024-07-20',
    categories: ['paid-data']
  },

  // Talent & Influencer Management
  {
    id: 'v28',
    name: 'AspireIQ',
    logo: 'https://via.placeholder.com/64x64/FF6B9D/FFFFFF?text=ASP',
    deploymentStatus: 'Active',
    capabilities: 'Influencer discovery, campaign management, performance tracking',
    label: ['2K'],
    annualCost: 75000,
    renewalDate: '2024-08-10',
    categories: ['talent-influencer']
  },
  {
    id: 'v29',
    name: 'Grin',
    logo: 'https://via.placeholder.com/64x64/6C5CE7/FFFFFF?text=GRN',
    deploymentStatus: 'Pending',
    capabilities: 'Creator relationship management, content amplification, ROI measurement',
    label: ['Zynga'],
    annualCost: 60000,
    renewalDate: '2024-09-25',
    categories: ['talent-influencer']
  },

  // PR & Communications
  {
    id: 'v30',
    name: 'Cision',
    logo: 'https://via.placeholder.com/64x64/E74C3C/FFFFFF?text=CIS',
    deploymentStatus: 'Active',
    capabilities: 'Media monitoring, press release distribution, journalist database',
    label: ['Rockstar'],
    annualCost: 95000,
    renewalDate: '2024-11-05',
    categories: ['pr-comms']
  }
];

export const categories: Category[] = [
  {
    id: 'cdp',
    name: 'Customer Data Platform',
    icon: 'Database',
    gradient: 'from-purple-500 to-purple-800',
    description: 'Unified customer data management and segmentation for personalized marketing campaigns.',
    vendors: mockVendors.filter(v => v.categories.includes('cdp'))
  },
  {
    id: 'paid-data',
    name: 'Paid & Data Collaboration',
    icon: 'TrendingUp',
    gradient: 'from-blue-500 to-blue-800',
    description: 'Performance marketing and data collaboration tools for optimized advertising spend.',
    vendors: mockVendors.filter(v => v.categories.includes('paid-data'))
  },
  {
    id: 'email',
    name: 'Email & SMS',
    icon: 'Mail',
    gradient: 'from-green-500 to-green-800',
    description: 'Multi-channel messaging platforms for email and SMS marketing automation.',
    vendors: mockVendors.filter(v => v.categories.includes('email'))
  },
  {
    id: 'web',
    name: 'Web',
    icon: 'Globe',
    gradient: 'from-indigo-500 to-indigo-800',
    description: 'Web analytics, optimization, and user experience enhancement tools.',
    vendors: mockVendors.filter(v => v.categories.includes('web'))
  },
  {
    id: 'social-publishing',
    name: 'Social Publishing',
    icon: 'Share2',
    gradient: 'from-pink-500 to-pink-800',
    description: 'Social media content creation, scheduling, and publishing automation.',
    vendors: mockVendors.filter(v => v.categories.includes('social-publishing'))
  },
  {
    id: 'social-listening',
    name: 'Social Listening',
    icon: 'Ear',
    gradient: 'from-yellow-500 to-yellow-800',
    description: 'Brand monitoring, sentiment analysis, and social media intelligence.',
    vendors: mockVendors.filter(v => v.categories.includes('social-listening'))
  },
  {
    id: 'talent-influencer',
    name: 'Talent & Influencer',
    icon: 'Users',
    gradient: 'from-red-500 to-red-800',
    description: 'Influencer discovery, management, and campaign performance tracking.',
    vendors: mockVendors.filter(v => v.categories.includes('talent-influencer'))
  },
  {
    id: 'pr-comms',
    name: 'PR & Comms',
    icon: 'Megaphone',
    gradient: 'from-orange-500 to-orange-800',
    description: 'Public relations management and communication workflow optimization.',
    vendors: mockVendors.filter(v => v.categories.includes('pr-comms'))
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    icon: 'Headphones',
    gradient: 'from-teal-500 to-teal-800',
    description: 'Customer support platforms and service experience management.',
    vendors: mockVendors.filter(v => v.categories.includes('customer-service'))
  },
  {
    id: 'analytics',
    name: 'Marketing Analytics',
    icon: 'BarChart3',
    gradient: 'from-cyan-500 to-cyan-800',
    description: 'Advanced analytics, reporting, and marketing performance measurement.',
    vendors: mockVendors.filter(v => v.categories.includes('analytics'))
  }
];