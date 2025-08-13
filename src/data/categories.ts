import { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'cdp',
    name: 'Customer Data Platform',
    icon: 'Database',
    gradient: 'from-purple-500 to-purple-800',
    description: 'Ingest, unify, segment, and activate player data',
    capabilities: [
      'Segmentation',
      'Multi-channel activation',
      'Profile unification',
      '3rd-party Integrations',
      'Data model management',
      'Journey orchestration',
      'Consent & preference management',
      'Agentic AI'
    ],
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'paid-data',
    name: 'Paid & Data Collaboration',
    icon: 'TrendingUp',
    gradient: 'from-blue-500 to-blue-800',
    description: 'Activate digital advertising campaigns across paid channels. Secure and privacy-compliant sharing and combining of data to unlock mutual insights, enable joint marketing or measurement, and drive better business outcomes—without exposing raw data.',
    capabilities: [
      'Onboard & activate 1P data',
      'Campaign & ad targeting capabilities via 3P audience data',
      'Identity resolution',
      'Data Clean Rooms (DCRs)',
      'Commercial datasets',
      'Audience enrichment & segmentation',
      'Advanced analytics'
    ],
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'email',
    name: 'Email & SMS',
    icon: 'Mail',
    gradient: 'from-green-500 to-green-800',
    description: 'Multi-channel messaging platforms for email and SMS marketing automation.',
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'web',
    name: 'Web',
    icon: 'Globe',
    gradient: 'from-indigo-500 to-indigo-800',
    description: 'Web analytics, optimization, and user experience enhancement tools.',
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'social-publishing',
    name: 'Social Publishing',
    icon: 'Share2',
    gradient: 'from-pink-500 to-pink-800',
    description: 'Social media content creation, scheduling, and publishing automation.',
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'social-listening',
    name: 'Social Listening',
    icon: 'Ear',
    gradient: 'from-yellow-500 to-yellow-800',
    description: 'Brand monitoring, sentiment analysis, and social media intelligence.',
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'talent-influencer',
    name: 'Talent & Influencer',
    icon: 'Users',
    gradient: 'from-red-500 to-red-800',
    description: 'Influencer discovery, management, and campaign performance tracking.',
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'pr-comms',
    name: 'PR & Comms',
    icon: 'Megaphone',
    gradient: 'from-orange-500 to-orange-800',
    description: 'Public relations management and communication workflow optimization.',
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    icon: 'Headphones',
    gradient: 'from-teal-500 to-teal-800',
    description: 'Customer support platforms and service experience management.',
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'analytics',
    name: 'Marketing Analytics',
    icon: 'BarChart3',
    gradient: 'from-cyan-500 to-cyan-800',
    description: 'Advanced analytics, reporting, and marketing performance measurement.',
    vendors: [] // Will be populated dynamically from real vendor data
  }
];