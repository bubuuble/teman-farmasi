import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

// Sanity client configuration
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  // Di Next.js App Router dengan caching (revalidate), disarankan useCdn: false
  // Ini memastikan data selalu fresh dan menghindari masalah socket ECONNRESET pada edge CDN
  useCdn: false,
});

// Helper for generating image URLs
const builder = createImageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
