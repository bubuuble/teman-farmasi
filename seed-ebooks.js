import createClient from '@sanity/client';

const client = createClient({
  projectId: 'dg157s6c', 
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
  token: 'skv5ejQyc8EBAKfWucmc1aPnBmNpTqLXBLnp6DkHaMCn2WKOpLD8rwTLUqZr8XHxHVz9WeVCZoavDqjt6Xv9kU3MGlGitimpEoZIzmJVXcuYrF4gleK3RmbUUIQphwwXPZ0BG6amCKuC5oToaOFPbiAEHXPKds0LwMrPyDzcjg5wwO1g3Bf9',
});

const ebooks = [
  {
    _type: 'ebook',
    title: 'Panduan Lengkap Formulasi Kosmetik',
    slug: { _type: 'slug', current: 'panduan-formulasi-kosmetik' },
    description: 'E-book komprehensif tentang cara memformulasi produk kosmetik yang aman dan efektif. Mencakup teori dasar, bahan-bahan, dan praktik formulasi kosmetik modern.',
    category: ['Cosmetic Formulation', 'R&D'],
    author: 'Szalszabilla Rahayu, S.Farm., M.Farm',
    pages: 120,
    fileSize: '2.5 MB',
    publishedAt: 2025,
    featured: true,
    downloads: 1250,
  },
  {
    _type: 'ebook',
    title: 'Research & Development dalam Industri Farmasi',
    slug: { _type: 'slug', current: 'rd-industri-farmasi' },
    description: 'Memahami proses R&D dalam pengembangan produk farmasi dan kosmetik. Dari riset awal hingga produksi massal dengan standar industri.',
    category: ['R&D', 'Research'],
    author: 'Tim Teman Farmasi',
    pages: 95,
    fileSize: '1.8 MB',
    publishedAt: 2025,
    featured: true,
    downloads: 980,
  },
  {
    _type: 'ebook',
    title: 'Menjadi Pharmapreneur Sukses',
    slug: { _type: 'slug', current: 'pharmapreneur-sukses' },
    description: 'Panduan praktis memulai bisnis di bidang farmasi. Strategi, tips, dan studi kasus pengusaha farmasi sukses Indonesia.',
    category: ['Pharmapreneur'],
    author: 'Tim Mentor Teman Farmasi',
    pages: 85,
    fileSize: '1.5 MB',
    publishedAt: 2024,
    featured: true,
    downloads: 750,
  },
  {
    _type: 'ebook',
    title: 'Ilmu Kosmetik Modern',
    slug: { _type: 'slug', current: 'ilmu-kosmetik-modern' },
    description: 'Memahami sains di balik produk kosmetik modern. Bahan aktif, mekanisme kerja, dan tren terkini dalam industri kosmetik global.',
    category: ['Cosmetic Sciences', 'Chemistry'],
    author: 'apt. Camelia Ayu Prawesti, M.Farm',
    pages: 140,
    fileSize: '3.2 MB',
    publishedAt: 2024,
    featured: true,
    downloads: 1100,
  },
  {
    _type: 'ebook',
    title: 'Metodologi Penelitian Farmasi: Dari Konsep hingga Publikasi',
    slug: { _type: 'slug', current: 'metodologi-penelitian-farmasi' },
    description: 'Panduan lengkap metodologi penelitian untuk mahasiswa farmasi. Dari proposal, eksekusi, hingga publikasi jurnal ilmiah.',
    category: ['Metodologi Penelitian', 'Research', 'Academic Writing'],
    author: 'Dr. Apt. Sarah Kusuma',
    pages: 160,
    fileSize: '3.8 MB',
    publishedAt: 2024,
    featured: true,
    downloads: 1450,
  },
  {
    _type: 'ebook',
    title: 'Statistika untuk Penelitian Farmasi',
    slug: { _type: 'slug', current: 'statistika-penelitian-farmasi' },
    description: 'Penerapan statistika dalam penelitian farmasi. Mencakup analisis data dengan SPSS, uji hipotesis, dan interpretasi hasil penelitian.',
    category: ['Statistika', 'Research'],
    author: 'Prof. Dr. Budi Santoso',
    pages: 150,
    fileSize: '8.5 MB',
    publishedAt: 2024,
    featured: true,
    downloads: 890,
  },
  {
    _type: 'ebook',
    title: 'Academic Writing untuk Jurnal Internasional',
    slug: { _type: 'slug', current: 'academic-writing-jurnal' },
    description: 'Tips dan trik menulis artikel ilmiah untuk publikasi di jurnal internasional. Struktur paper, citation, dan strategi publikasi yang efektif.',
    category: ['Academic Writing', 'International Programs'],
    author: 'Dr. Apt. Maya Indah, M.Pharm',
    pages: 80,
    fileSize: '3.2 MB',
    publishedAt: 2024,
    featured: false,
    downloads: 670,
  },
  {
    _type: 'ebook',
    title: 'Bahan Alam dalam Farmasi',
    slug: { _type: 'slug', current: 'bahan-alam-farmasi' },
    description: 'Eksplorasi kekayaan bahan alam Indonesia untuk pengembangan obat dan produk kesehatan. Fitokimia, ekstraksi, dan aplikasi klinis.',
    category: ['Natural Products', 'Pharmacology'],
    author: 'Fitri Melati, S.Farm., M.Farm',
    pages: 130,
    fileSize: '2.8 MB',
    publishedAt: 2024,
    featured: true,
    downloads: 1020,
  },
  {
    _type: 'ebook',
    title: 'Mikrobiologi Farmasi Praktis',
    slug: { _type: 'slug', current: 'mikrobiologi-farmasi' },
    description: 'Panduan praktis mikrobiologi dalam konteks farmasi. Sterilisasi, kontrol kualitas mikrobiologi, dan aplikasi klinis mikrobiologi.',
    category: ['Microbiology', 'Farmasi Klinik'],
    author: 'apt. Mutiara Ariani Saputri, S.Farm',
    pages: 105,
    fileSize: '2.1 MB',
    publishedAt: 2024,
    featured: false,
    downloads: 580,
  },
  {
    _type: 'ebook',
    title: 'Farmakologi Dasar dan Terapan',
    slug: { _type: 'slug', current: 'farmakologi-dasar-terapan' },
    description: 'Memahami mekanisme kerja obat, farmakokinetik, dan farmakodinamik untuk aplikasi klinis. Lengkap dengan studi kasus.',
    category: ['Pharmacology', 'Farmakologi'],
    author: 'Tim Teman Farmasi',
    pages: 150,
    fileSize: '3.5 MB',
    publishedAt: 2024,
    featured: true,
    downloads: 1350,
  },
  {
    _type: 'ebook',
    title: 'Kimia Farmasi untuk Pemula',
    slug: { _type: 'slug', current: 'kimia-farmasi-pemula' },
    description: 'Pengantar kimia farmasi yang mudah dipahami. Struktur molekul, sintesis obat, dan hubungan struktur-aktivitas (SAR).',
    category: ['Chemistry', 'Kimia Farmasi'],
    author: 'Khansa Fitrah Shaliha, S.Farm., M.Farm',
    pages: 135,
    fileSize: '7.1 MB',
    publishedAt: 2024,
    featured: true,
    downloads: 720,
  },
  {
    _type: 'ebook',
    title: 'Program Internasional untuk Mahasiswa Farmasi',
    slug: { _type: 'slug', current: 'program-internasional-farmasi' },
    description: 'Panduan lengkap mengikuti program pertukaran pelajar, summer school, dan konferensi internasional di bidang farmasi.',
    category: ['International Programs', 'Academic Writing'],
    author: 'apt. Salsabila Putri, S.Farm',
    pages: 65,
    fileSize: '1.2 MB',
    publishedAt: 2024,
    featured: false,
    downloads: 450,
  },
  {
    _type: 'ebook',
    title: 'Public Education: Edukasi Kesehatan untuk Masyarakat',
    slug: { _type: 'slug', current: 'public-education-kesehatan' },
    description: 'Panduan praktis melakukan edukasi kesehatan kepada masyarakat. Teknik komunikasi, media, dan evaluasi program edukasi.',
    category: ['Public Education'],
    author: 'Tim Teman Farmasi',
    pages: 75,
    fileSize: '1.4 MB',
    publishedAt: 2024,
    featured: false,
    downloads: 520,
  },
];

async function uploadEBooks() {
  console.log('🚀 Starting E-Books upload...\n');

  for (const ebook of ebooks) {
    try {
      const result = await client.create(ebook);
      console.log(`✅ Uploaded: ${ebook.title}`);
      console.log(`   📚 Category: ${ebook.category}`);
      console.log(`   👤 Author: ${ebook.author}`);
      console.log(`   📄 Pages: ${ebook.pages}`);
      console.log(`   ⭐ Featured: ${ebook.featured ? 'Yes' : 'No'}\n`);
    } catch (error) {
      console.error(`❌ Error uploading ${ebook.title}:`, error.message);
    }
  }

  console.log('✨ E-Books upload complete!');
  console.log(`📊 Total e-books: ${ebooks.length}`);
}

uploadEBooks();
