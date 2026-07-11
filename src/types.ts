export interface BrandStrategy {
  brandName: string;
  tagline: string;
  colorPalette: string[]; // 5 hex codes
  typography: string[]; // Primary, secondary
  voice: string;
  logoConcept: string;
  packagingConcept: string;
  websiteHeroConcept: string;
  adBannerConcept: string;
  instagramPostConcept: string;
  businessCardConcept: string;
}

export interface GeneratedAsset {
  id: string;
  type: string; // 'Logo', 'Packaging', etc.
  title: string;
  imageUrl: string;
  prompt: string;
}

export interface BrandProject {
  id: string;
  idea: string;
  category: string;
  audience: string;
  style: string;
  colors: string;
  referenceImage?: { data: string, mimeType: string } | null;
  strategy: BrandStrategy | null;
  assets: GeneratedAsset[];
  status: 'idea' | 'generating_strategy' | 'generating_assets' | 'complete';
  createdAt: number;
}
