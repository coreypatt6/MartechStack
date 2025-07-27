// Enhanced Vendor types for logo management

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  deploymentStatus: 'Active' | 'Pending' | 'Inactive';
  capabilities: string;
  label: string[];
  annualCost: number;
  renewalDate: string;
  categories: string[];
  logoSource?: string;
  logoConfidence?: number;
  logoUpdatedAt?: string;
  logoUpdated?: boolean;
}

export interface VendorLogoUpdate {
  vendorId: string;
  vendorName: string;
  status: 'success' | 'failed' | 'skipped';
  previousLogo: string;
  newLogo: string;
  source: string;
  confidence: number;
  error?: string;
}

export interface LogoUpdateProgress {
  completed: number;
  total: number;
  current: string;
  batch?: number;
  phase: 'analyzing' | 'fetching' | 'updating' | 'complete';
}

export interface LogoUpdateReport {
  total: number;
  updated: number;
  needsUpdate: number;
  vendorsNeedingLogos: string[];
}