export interface Vendor {
  id: string;
  name: string;
  logo: string;
  deploymentStatus: 'Active' | 'Pending' | 'Inactive';
  capabilities: string;
  label: ('2K' | 'Rockstar' | 'Zynga' | 'Ghost Story')[];
  annualCost: number;
  renewalDate: string;
  categories: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  description: string;
  capabilities?: string[];
  vendors: Vendor[];
}

export interface CategoryData {
  id: string;
  name: string;
  gradient: string;
  description: string;
  vendors: Vendor[];
  capabilities: string[];
  integrations: string[];
  totalCost: number;
  teamContacts: string[];
}