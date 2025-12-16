'use client';

import { NextStudio } from 'next-sanity/studio';
import { useEffect, useState } from 'react';
import type { WorkspaceOptions } from 'sanity';

export default function StudioPage() {
  const [config, setConfig] = useState<WorkspaceOptions | null>(null);

  useEffect(() => {
    // Dynamically import config to avoid SSR issues with Turbopack
    import('../../../sanity.config').then((mod) => setConfig(mod.default));
    
    // Suppress React 19 prop warnings from Sanity Studio
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args[0];
      if (typeof errorMessage === 'string' && (
        errorMessage.includes('disableTransition') ||
        errorMessage.includes('React does not recognize') ||
        errorMessage.includes('prop on a DOM element')
      )) {
        return;
      }
      originalError.call(console, ...args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);

  if (!config) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Studio...</div>;
  }

  return (
    <div suppressHydrationWarning style={{ height: '100vh' }}>
      <NextStudio config={config} />
    </div>
  );
}
