import createClient from '@sanity/client';

const client = createClient({
  projectId: 'dg157s6c', 
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
  token: 'skv5ejQyc8EBAKfWucmc1aPnBmNpTqLXBLnp6DkHaMCn2WKOpLD8rwTLUqZr8XHxHVz9WeVCZoavDqjt6Xv9kU3MGlGitimpEoZIzmJVXcuYrF4gleK3RmbUUIQphwwXPZ0BG6amCKuC5oToaOFPbiAEHXPKds0LwMrPyDzcjg5wwO1g3Bf9', 
});

const galleryItems = [
  {
    _type: 'gallery',
    title: 'Selamat untuk Kak Sarah - Lulus Sidang Skripsi!',
    instagramUrl: 'https://www.instagram.com/p/example1/',
    description: 'Alhamdulillah, Kak Sarah berhasil lulus sidang skripsi dengan nilai A! Terima kasih sudah mempercayai Teman Farmasi untuk pendampingan riset.',
    category: 'success',
    featured: true,
    publishedAt: '2024-12-15T10:00:00Z',
    order: 1,
  },
  {
    _type: 'gallery',
    title: 'Workshop Formulasi Sediaan Farmasi',
    instagramUrl: 'https://www.instagram.com/p/example2/',
    description: 'Workshop seru bersama mahasiswa farmasi se-Indonesia membahas formulasi sediaan farmasi modern.',
    category: 'event',
    featured: true,
    publishedAt: '2024-12-10T14:30:00Z',
    order: 2,
  },
  {
    _type: 'gallery',
    title: 'Tips Menulis Literature Review yang Efektif',
    instagramUrl: 'https://www.instagram.com/p/example3/',
    description: 'Simak tips & trik menulis literature review yang sistematis dan berkualitas untuk skripsi Anda.',
    category: 'tips',
    featured: true,
    publishedAt: '2024-12-08T09:00:00Z',
    order: 3,
  },
  {
    _type: 'gallery',
    title: 'Behind The Scenes: Sesi Mentoring',
    instagramUrl: 'https://www.instagram.com/p/example4/',
    description: 'Intip suasana sesi mentoring private antara mentor dan mahasiswa di Teman Farmasi.',
    category: 'bts',
    featured: false,
    publishedAt: '2024-12-05T16:00:00Z',
    order: 4,
  },
  {
    _type: 'gallery',
    title: 'Pengumuman: Program Diskon Spesial!',
    instagramUrl: 'https://www.instagram.com/p/example5/',
    description: 'Dapatkan diskon spesial untuk pendaftaran program PharmaCore Class dan Research Mentoring bulan ini!',
    category: 'announcement',
    featured: true,
    publishedAt: '2024-12-01T08:00:00Z',
    order: 5,
  },
  {
    _type: 'gallery',
    title: 'Testimoni Mahasiswa - Berhasil Publish Jurnal',
    instagramUrl: 'https://www.instagram.com/p/example6/',
    description: 'Kak Budi berhasil mempublikasikan penelitiannya di jurnal Sinta 2 dengan bimbingan mentor kami!',
    category: 'success',
    featured: true,
    publishedAt: '2024-11-28T11:00:00Z',
    order: 6,
  },
  {
    _type: 'gallery',
    title: 'Webinar: Strategi Lolos Publikasi Jurnal Internasional',
    instagramUrl: 'https://www.instagram.com/p/example7/',
    description: 'Webinar gratis bersama mentor berpengalaman membahas strategi publikasi jurnal internasional.',
    category: 'event',
    featured: false,
    publishedAt: '2024-11-25T13:00:00Z',
    order: 7,
  },
  {
    _type: 'gallery',
    title: 'Tips Menghadapi Sidang Skripsi dengan Percaya Diri',
    instagramUrl: 'https://www.instagram.com/p/example8/',
    description: 'Nervous menghadapi sidang? Simak tips dari mentor kami untuk menghadapi sidang dengan percaya diri!',
    category: 'tips',
    featured: false,
    publishedAt: '2024-11-20T10:30:00Z',
    order: 8,
  },
  {
    _type: 'gallery',
    title: 'Meet Our Mentors: Dr. Szalszabilla',
    instagramUrl: 'https://www.instagram.com/p/example9/',
    description: 'Kenalan dengan Dr. Szalszabilla, Founder & CEO Teman Farmasi dan mentor berpengalaman kami.',
    category: 'bts',
    featured: true,
    publishedAt: '2024-11-15T15:00:00Z',
    order: 9,
  },
  {
    _type: 'gallery',
    title: 'Cara Memilih Topik Skripsi yang Tepat',
    instagramUrl: 'https://www.instagram.com/p/example10/',
    description: 'Bingung pilih topik skripsi? Yuk simak panduan lengkap dari mentor Teman Farmasi!',
    category: 'tips',
    featured: false,
    publishedAt: '2024-11-10T09:30:00Z',
    order: 10,
  },
  {
    _type: 'gallery',
    title: 'Student Success Story: Dari Mentoring ke Cumlaude',
    instagramUrl: 'https://www.instagram.com/p/example11/',
    description: 'Inspiratif! Kak Dina berhasil lulus cumlaude setelah mengikuti program mentoring intensif.',
    category: 'success',
    featured: false,
    publishedAt: '2024-11-05T12:00:00Z',
    order: 11,
  },
  {
    _type: 'gallery',
    title: 'Open Recruitment: Mentor Teman Farmasi',
    instagramUrl: 'https://www.instagram.com/p/example12/',
    description: 'Kami membuka kesempatan untuk bergabung sebagai mentor! Info lengkap di bio Instagram.',
    category: 'announcement',
    featured: false,
    publishedAt: '2024-11-01T08:00:00Z',
    order: 12,
  },
];

async function seedGallery() {
  try {
    console.log('🗑️  Menghapus data gallery lama...');
    const deleteResult = await client.delete({ query: '*[_type == "gallery"]' });
    console.log(`✅ Berhasil menghapus ${deleteResult.results?.length || 0} item gallery lama\n`);
    
    console.log('🚀 Membuat data gallery baru...');
    
    // Note: Karena ini seed example, image akan null
    // User perlu upload image manually di Sanity Studio atau update script untuk upload images
    console.log('⚠️  PENTING: Setelah seeding, silakan upload thumbnail images di Sanity Studio untuk setiap gallery item\n');
    
    for (const item of galleryItems) {
      await client.create(item);
      console.log(`✅ Berhasil menambahkan: ${item.title}`);
    }
    
    console.log(`\n✨ Seeding Selesai! Total ${galleryItems.length} gallery items berhasil ditambahkan.`);
    console.log('\n📝 Langkah Selanjutnya:');
    console.log('1. Buka Sanity Studio (/studio)');
    console.log('2. Pilih "Instagram Gallery"');
    console.log('3. Upload thumbnail image untuk setiap item');
    console.log('4. Update Instagram URLs dengan URL post asli dari @temanfarmasi');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  }
}

seedGallery();
