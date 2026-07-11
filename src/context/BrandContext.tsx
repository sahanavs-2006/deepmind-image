import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandProject, BrandStrategy, GeneratedAsset } from '../types';

interface BrandContextType {
  projects: BrandProject[];
  currentProject: BrandProject | null;
  setCurrentProject: (project: BrandProject | null) => void;
  createProject: (idea: string, category: string, audience: string, style: string, colors: string, referenceImage?: { data: string, mimeType: string } | null) => BrandProject;
  updateProject: (id: string, updates: Partial<BrandProject>) => void;
  generateStrategy: (project: BrandProject) => Promise<void>;
  generateAssets: (projectId: string, strategy: BrandStrategy) => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<BrandProject[]>(() => {
    try {
      const saved = localStorage.getItem('brandforge_projects');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse projects from localStorage', e);
      return [];
    }
  });
  
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('brandforge_projects', JSON.stringify(projects));
    } catch (e) {
      console.warn('localStorage quota exceeded, removing older projects to save space');
      try {
        const trimmedProjects = projects.slice(0, 1); // Only keep the 1 most recent
        localStorage.setItem('brandforge_projects', JSON.stringify(trimmedProjects));
      } catch (err) {
        try {
           // Strip heavy data as a last resort
           const lightweightProjects = projects.slice(0, 5).map(p => ({ ...p, assets: [], referenceImage: undefined }));
           localStorage.setItem('brandforge_projects', JSON.stringify(lightweightProjects));
        } catch (finalErr) {
           console.warn('Still failed to save lightweight projects');
        }
      }
    }
  }, [projects]);

  const currentProject = projects.find(p => p.id === currentProjectId) || null;

  const createProject = (idea: string, category: string, audience: string, style: string, colors: string, referenceImage?: { data: string, mimeType: string } | null) => {
    const newProject: BrandProject = {
      id: Date.now().toString(),
      idea,
      category,
      audience,
      style,
      colors,
      referenceImage,
      strategy: null,
      assets: [],
      status: 'idea',
      createdAt: Date.now(),
    };
    setProjects(prev => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<BrandProject>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const generateStrategy = async (project: BrandProject) => {
    const projectId = project.id;

    updateProject(projectId, { status: 'generating_strategy' });

    try {
      const response = await fetch('/api/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: project.idea,
          category: project.category,
          audience: project.audience,
          style: project.style,
          colors: project.colors,
          referenceImage: project.referenceImage,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate strategy');
      
      const strategy: BrandStrategy = await response.json();
      updateProject(projectId, { strategy, status: 'generating_assets' });
      
      // Auto trigger asset generation with the newly fetched strategy
      await generateAssets(projectId, strategy);
    } catch (error) {
      console.error(error);
      updateProject(projectId, { status: 'idea' });
    }
  };

  const generateAssets = async (projectId: string, strategy: BrandStrategy) => {
    const assetsToGenerate = [
      { type: 'Logo', title: 'Primary Logo', prompt: strategy.logoConcept, aspectRatio: '1:1' },
      { type: 'Packaging', title: 'Product Packaging', prompt: strategy.packagingConcept, aspectRatio: '4:3' },
      { type: 'Website', title: 'Landing Page Hero', prompt: strategy.websiteHeroConcept, aspectRatio: '16:9' },
      { type: 'Social', title: 'Instagram Post', prompt: strategy.instagramPostConcept, aspectRatio: '1:1' },
      { type: 'Ad', title: 'Advertisement Banner', prompt: strategy.adBannerConcept, aspectRatio: '16:9' },
      { type: 'Business Card', title: 'Business Card', prompt: strategy.businessCardConcept, aspectRatio: '16:9' },
    ];

    try {
      const promises = assetsToGenerate.map(async (assetReq) => {
        const response = await fetch('/api/generate-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Generate an image for a brand called "${strategy.brandName || 'a brand'}". ${assetReq.prompt || ''}. The brand colors are ${(strategy.colorPalette || []).join(', ')}. Use a modern, minimal, professional style matching this vibe: ${strategy.voice || ''}`,
            aspectRatio: assetReq.aspectRatio,
            model: 'gemini-3.1-flash-lite-image' // Nano Banana 2 Lite
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to generate asset ${assetReq.title}`);
        }
        
        const { imageUrl } = await response.json();
        return {
          id: Date.now().toString() + Math.random().toString(),
          type: assetReq.type,
          title: assetReq.title,
          imageUrl,
          prompt: assetReq.prompt
        } as GeneratedAsset;
      });

      const results = await Promise.allSettled(promises);
      const successfulAssets = results
        .filter((result): result is PromiseFulfilledResult<GeneratedAsset> => result.status === 'fulfilled')
        .map(result => result.value);

      updateProject(projectId, { assets: successfulAssets, status: 'complete' });
    } catch (error) {
      console.error('Failed to generate assets in parallel', error);
      updateProject(projectId, { status: 'complete' }); // at least unblock the UI
    }
  };

  return (
    <BrandContext.Provider value={{
      projects,
      currentProject,
      setCurrentProject: (p) => setCurrentProjectId(p?.id || null),
      createProject,
      updateProject,
      generateStrategy,
      generateAssets,
    }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}
