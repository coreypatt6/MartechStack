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
    description: 'Deliver and optimize marketing messages - such as brand newsletters or contextually relevant, real-time and personalized communications - in support of engagement across the player journey',
    capabilities: [
      'Ability to send out email messages to many contacts in one step',
      'Ability to develop and adjust email template designs',
      'Ability to ingest, store, and segment lists of contacts that can be contacted via an email message',
      'Opt-in and opt-out management',
      'A/B testing',
      'SMS/MMS & RCS',
      'QR codes'
    ],
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'web',
    name: 'Web',
    icon: 'Globe',
    gradient: 'from-indigo-500 to-indigo-800',
    description: 'Web analytics & optimization + collecting, consolidating, synchronizing and applying end-user choices about personal data',
    capabilities: [
      'Retargeting',
      'A/B testing',
      'Consent collection',
      'Multidimensional preference matrices/single source of truth',
      'Records of consent'
    ],
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'social-publishing',
    name: 'Social Publishing',
    icon: 'Share2',
    gradient: 'from-pink-500 to-pink-800',
    description: 'Monitoring, publishing, and engaging across social media platforms',
    capabilities: [
      'Content scheduling and publishing to social media platforms',
      'Content calendar management',
      'Analytics and reporting',
      'Community management',
      'Social monitoring and analytics',
      'Team collaboration and approval workflows'
    ],
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'social-listening',
    name: 'Social Listening',
    icon: 'Ear',
    gradient: 'from-yellow-500 to-yellow-800',
    description: 'Collecting, measuring, analyzing and interpreting the results of interactions and associations among people, topics, and ideas from social media sources',
    capabilities: [
      'Volume of Post and Engagement (comments, likes, shares)',
      'Sentiment across multiple languages and social channels & websites',
      'Tracking of \'Video-On-Demand\' & Streaming',
      'Image analysis',
      'Video analytics'
    ],
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'talent-influencer',
    name: 'Talent & Influencer',
    icon: 'Users',
    gradient: 'from-red-500 to-red-800',
    description: 'Assists in managing influencer marketing programs - creating campaign, reporting, and evaluating influencer performance',
    capabilities: [
      'Influencer discovery & engagement',
      'Influencer onboarding',
      'Campaign management & measurement',
      'Audiences Discovery'
    ],
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'pr-comms',
    name: 'PR & Comms',
    icon: 'Megaphone',
    gradient: 'from-orange-500 to-orange-800',
    description: 'Managing influencer marketing programs, with some providers offering strategic services to help with migration',
    capabilities: [
      'Media and journalist database for PR outreach',
      'Tracking earned media coverage across digital, print, broadcast, and podcasts',
      'Monitoring brand reputation and key topics in real-time',
      'Building and maintaining journalist relationships with contact insights',
      'Automated reporting on media mentions and PR performance'
    ],
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    icon: 'Headphones',
    gradient: 'from-teal-500 to-teal-800',
    description: 'Manage customer service and support interactions',
    capabilities: [
      'Live chat',
      'Customer analytics',
      'Self-service portal',
      'Ticketing system',
      'Knowledge management system',
      'Localization',
      'Site search'
    ],
    vendors: [] // Will be populated dynamically from real vendor data
  },
  {
    id: 'analytics',
    name: 'Marketing Analytics',
    icon: 'BarChart3',
    gradient: 'from-cyan-500 to-cyan-800',
    description: 'Leverage player, behavioral, and analytics data to generate marketing insights that drive content development and measure campaign effectiveness',
    capabilities: [
      'Data preparation',
      'Reporting',
      'Visualization',
      'Campaign Efficiency',
      'Campaign Effectiveness',
      'Data Democratization',
      'Campaign Flighting'
    ],
    vendors: [] // Will be populated dynamically from real vendor data
  }
];