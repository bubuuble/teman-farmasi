import createClient from '@sanity/client';

const client = createClient({
  projectId: 'dg157s6c', 
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
  token: 'skv5ejQyc8EBAKfWucmc1aPnBmNpTqLXBLnp6DkHaMCn2WKOpLD8rwTLUqZr8XHxHVz9WeVCZoavDqjt6Xv9kU3MGlGitimpEoZIzmJVXcuYrF4gleK3RmbUUIQphwwXPZ0BG6amCKuC5oToaOFPbiAEHXPKds0LwMrPyDzcjg5wwO1g3Bf9', 
});

const blogPosts = [
  {
    _type: 'blog',
    title: '5 Strategi Jitu Memilih Topik Skripsi Farmasi yang Impactful',
    slug: { current: 'strategi-memilih-topik-skripsi-farmasi' },
    date: '2024-12-15',
    category: 'Research Tips',
    excerpt: 'Memilih topik skripsi yang tepat adalah langkah pertama menuju kesuksesan akademik. Pelajari 5 strategi praktis untuk menemukan topik penelitian yang original, relevan, dan impactful.',
    author: 'Dr. Szalszabilla Rahayu',
    readTime: 8,
    publishedAt: '2024-12-15T09:00:00Z',
    featured: true,
  },
  {
    _type: 'blog',
    title: 'Panduan Lengkap Metodologi Penelitian untuk Mahasiswa Farmasi',
    slug: { current: 'panduan-metodologi-penelitian-farmasi' },
    date: '2024-12-10',
    category: 'Methodology',
    excerpt: 'Metodologi penelitian yang solid adalah fondasi kesuksesan riset. Artikel ini menjelaskan berbagai jenis metodologi, dari experimental hingga mixed-methods, dengan contoh aplikasi nyata di farmasi.',
    author: 'apt. Khansa Fitrah Shaliha',
    readTime: 12,
    publishedAt: '2024-12-10T10:30:00Z',
    featured: true,
  },
  {
    _type: 'blog',
    title: 'Cara Menulis Literature Review yang Berkualitas dan Sistematis',
    slug: { current: 'menulis-literature-review-berkualitas' },
    date: '2024-12-05',
    category: 'Writing Tips',
    excerpt: 'Literature review bukan hanya sekadar merangkum jurnal, melainkan menganalisis, mengkritisi, dan mensintesis penelitian sebelumnya. Pelajari teknik penulisan literature review yang efektif dan sistematis.',
    author: 'apt. Camelia Ayu Prawesti',
    readTime: 10,
    publishedAt: '2024-12-05T14:00:00Z',
    featured: false,
  },
  {
    _type: 'blog',
    title: 'Strategi Sukses Publikasi Manuskrip di Jurnal Ilmiah Sinta & Scopus',
    slug: { current: 'strategi-publikasi-jurnal-ilmiah' },
    date: '2024-11-28',
    category: 'Publication',
    excerpt: 'Ingin mempublikasikan penelitian Anda? Pelajari strategi komprehensif mulai dari pemilihan jurnal, penyiapan manuskrip, strategi menghadapi reviewer, hingga tips lolos publikasi di jurnal ternama.',
    author: 'Khoiron Basulloh, S.Farm., M.M.',
    readTime: 15,
    publishedAt: '2024-11-28T11:00:00Z',
    featured: true,
  },
];

async function seedBlogPosts() {
  try {
    console.log('🚀 Menambahkan blog posts baru...');
    
    for (const post of blogPosts) {
      await client.create(post);
      console.log(`✅ Berhasil ditambahkan: ${post.title}`);
    }
    
    console.log('\n✨ Seeding Blog Posts Selesai!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

seedBlogPosts();
