'use client';

import { Suspense, ReactNode } from 'react';
import PageLoadingSpinner from './PageLoadingSpinner';

interface PageWithSpinnerProps {
  children: ReactNode;
}

export default function PageWithSpinner({ children }: PageWithSpinnerProps) {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      {children}
    </Suspense>
  );
}
