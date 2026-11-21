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
// Dataset "development" hasil copy dari "production": dokumen ikut tercopy, tapi file
// gambarnya tetap tersimpan di path production/ di cdn.sanity.io (URL development/ -> 404).
// Set NEXT_PUBLIC_SANITY_IMAGE_DATASET=production di .env.local untuk membangun URL gambar
// ke dataset tempat file aslinya berada. Kosongkan jika dataset-nya sama.
const builder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset:
    process.env.NEXT_PUBLIC_SANITY_IMAGE_DATASET ||
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    'production',
});

export function urlFor(source: any) {
  return builder.image(source);
}
