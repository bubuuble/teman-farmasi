import createClient from '@sanity/client';

const client = createClient({
  projectId: 'dg157s6c', 
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
  token: 'skv5ejQyc8EBAKfWucmc1aPnBmNpTqLXBLnp6DkHaMCn2WKOpLD8rwTLUqZr8XHxHVz9WeVCZoavDqjt6Xv9kU3MGlGitimpEoZIzmJVXcuYrF4gleK3RmbUUIQphwwXPZ0BG6amCKuC5oToaOFPbiAEHXPKds0LwMrPyDzcjg5wwO1g3Bf9', 
});

const programs = [
  // 1. PHARMACORE CLASS
  {
    _type: 'program',
    title: 'PharmaCore Class',
    slug: { _type: 'slug', current: 'pharmacore-class' },
    category: 'pharmacore',
    description: 'Kelas intensif pendampingan mata kuliah farmasi yang dirancang untuk memperkuat pemahaman teori dan praktikum.',
    price: 'Rp 79.900 / Mata Kuliah',
    rating: 5,
    students: 500,
    subjects: [
        'Basic Science Block: -Anatomi dan Fisiologi Manusia -Kimia Dasar -Kimia Organik 1 -Kimia Organik 2 -Biologi Sel & Molekuler',
        'Pharmaceutical Chemistry Block: -Kimia Analisis -Analisis Farmasi Kualitatif & Kuantitatif -Farmakognosi -Fitokimia -Biokimia',
        'Pharmaceutics & Industrial Pharmacy Block: -Farmasetika Dasar -Farmasi Fisik 1 -Farmasi Fisik 2 -Farmasi Industri -Teknologi Sediaan Padat -Teknologi Sediaan Cair -Teknologi Sediaan Semi Solid -Teknologi Sediaan Steril -Biofarmasetika',
        'Clinical & Community Pharmacy Block: -Farmasi Klinik -Farmakoterapi -Farmasi Komunitas -Pelayanan Kefarmasian -Farmakoekonomi -Farmakovigillence -Farmakoepidiemologi -Farmakologi -Patofisiologi -Toksikologi -Imunologi dan Virologi -Stabilitas Obat -Swamedikasi -Interaksi Obat -Keamanan dan Efek Samping Obat',
        'Microbiologi & Biotechnology Block: -Mikrobiologi Klinis -Mikrobiologi Industri -Bioteknologi'
    ]
  },

  // 2. PHARMA RESEARCH MENTORING
  {
    _type: 'program',
    title: 'Pharma Research Mentoring',
    slug: { _type: 'slug', current: 'pharma-research-mentoring' },
    category: 'research',
    description: 'Kelas Private Monitoring Riset untuk membimbing Anda dari penentuan judul hingga simulasi sidang skripsi.',
    price: 'Mulai Rp 165.000',
    rating: 5,
    students: 200,
    tiers: [
      {
        name: '1x Pertemuan',
        price: 'Rp 165.000',
        features: [
          'Rekomendasi 3 Judul Penelitian',
          'Total 6 Jurnal Ilmiah',
          'Sesi Private 40-60 menit',
          'Free Konsultasi WA 1x24 jam'
        ]
      },
      {
        name: '3x Pertemuan',
        price: 'Rp 350.000',
        features: [
          'Rekomendasi 5 Judul Penelitian',
          'Total 10 Jurnal Ilmiah',
          'Mentoring Kerangka Bab 1-3',
          'Simulasi Sidang 40 menit',
          'Konsultasi WA 3 jam/hari'
        ]
      },
      {
        name: '5x Pertemuan',
        price: 'Rp 525.000',
        features: [
          'Rekomendasi 7 Judul Penelitian',
          'Total 21 Jurnal Ilmiah',
          'Mentoring Analisis & Hasil',
          '3x Revisi Draft Penelitian',
          'Simulasi Sidang 90 menit',
          'Konsultasi WA 5 jam/hari'
        ]
      },
      {
        name: '10x Pertemuan',
        price: 'Rp 735.000',
        features: [
          'Paket Full Proposal sampai Hasil',
          'Total 21 Jurnal Ilmiah',
          'Mentoring Analisis Mendalam',
          'Simulasi Sidang Intensif',
          'Free Konsultasi WA Sepuasnya'
        ]
      }
    ]
  },

  // 3. PHARMAPUBLISH ACADEMY (UPDATE BARU)
  {
    _type: 'program',
    title: 'PharmaPublish Academy',
    slug: { _type: 'slug', current: 'pharmapublish-academy' },
    category: 'publish',
    description: 'Kelas khusus persiapan manuskrip jurnal untuk publikasi ilmiah farmasi nasional maupun internasional.',
    price: 'Mulai Rp 350.000',
    rating: 5,
    students: 150,
    tiers: [
      {
        name: 'PharmaPublish Basic (2x Pertemuan)',
        price: 'Rp 350.000',
        features: [
          'Pengenalan struktur artikel (IMRaD)',
          'Menentukan scope & novelty',
          'Penulisan judul, abstrak, kata kunci',
          'Pengenalan jurnal SINTA / Scopus',
          'Draft outline & monitoring abstrak',
          'Etika publikasi & plagiarisme'
        ]
      },
      {
        name: 'PharmaPublish Advanced (5x Pertemuan)',
        price: 'Rp 500.000',
        features: [
          'Penulisan pendahuluan (gap & urgensi)',
          'Penyusunan metode publishable',
          'Penulisan hasil & pembahasan ilmiah',
          'Manajemen referensi (Mendeley/Zotero)',
          'Penyesuaian template jurnal',
          'Proses submission & strategi reviewer',
          'Revisi manuskrip pasca review'
        ]
      }
    ]
  }
];

async function seedData() {
  try {
    console.log('🚀 Menghapus data lama...');
    await client.delete({ query: '*[_type == "program"]' });
    
    console.log('🚀 Membuat data program baru...');
    for (const p of programs) {
      await client.create(p);
      console.log(`✅ Berhasil: ${p.title}`);
    }
    console.log('\n✨ Seeding Selesai!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

seedData();