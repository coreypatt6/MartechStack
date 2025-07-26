import { Category, Vendor } from '../types';

export const mockVendors: Vendor[] = [
  {
    id: 'v1',
    name: 'Salesforce',
    logo: 'https://via.placeholder.com/64x64/00A1E0/FFFFFF?text=SF',
    deploymentStatus: 'Active',
    capabilities: 'Email marketing, automation, A/B testing',
    label: ['Rockstar'],
    annualCost: 120000,
    renewalDate: '2024-12-31',
    categories: ['email', 'analytics']
  },
  {
    id: 'v2',
    name: 'HubSpot',
    logo: 'https://via.placeholder.com/64x64/FF7A59/FFFFFF?text=HS',
    deploymentStatus: 'Active',
    capabilities: 'Marketing automation, CRM, content management',
    label: ['2K'],
    annualCost: 80000,
    renewalDate: '2024-06-30',
    categories: ['web', 'analytics']
  },
  {
    id: 'v3',
    name: 'Google Analytics',
    logo: 'https://via.placeholder.com/64x64/F4B400/FFFFFF?text=GA',
    deploymentStatus: 'Active',
    capabilities: 'Web analytics, conversion tracking, audience insights',
    label: ['Zynga'],
    annualCost: 150000,
    renewalDate: '2024-03-31',
    categories: ['web', 'analytics']
  },
  {
    id: 'v4',
    name: 'Mailchimp',
    logo: 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
    deploymentStatus: 'Pending',
    capabilities: 'Email marketing, automation, A/B testing',
    label: ['2K'],
    annualCost: 45000,
    renewalDate: '2024-09-15',
    categories: ['email']
  },
  {
    id: 'v5',
    name: 'Hootsuite',
    logo: 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
    deploymentStatus: 'Active',
    capabilities: 'Social media management, scheduling, analytics',
    label: ['Rockstar'],
    annualCost: 25000,
    renewalDate: '2024-11-30',
    categories: ['social-publishing', 'social-listening']
  },
  {
    id: 'v6',
    name: 'Zendesk',
    logo: 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=Logo',
    deploymentStatus: 'Active',
    capabilities: 'Customer support, ticketing, knowledge base',
    label: ['Zynga'],
    annualCost: 60000,
    renewalDate: '2024-08-31',
    categories: ['customer-service']
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