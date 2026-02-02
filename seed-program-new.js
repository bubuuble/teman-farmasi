import createClient from '@sanity/client';

const client = createClient({
  projectId: 'dg157s6c', 
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
  token: 'skv5ejQyc8EBAKfWucmc1aPnBmNpTqLXBLnp6DkHaMCn2WKOpLD8rwTLUqZr8XHxHVz9WeVCZoavDqjt6Xv9kU3MGlGitimpEoZIzmJVXcuYrF4gleK3RmbUUIQphwwXPZ0BG6amCKuC5oToaOFPbiAEHXPKds0LwMrPyDzcjg5wwO1g3Bf9', 
});

const newPrograms = [
  // 5. PHARMA IMPACT
  {
    _type: 'program',
    title: 'Pharma Impact',
    slug: { _type: 'slug', current: 'pharma-impact' },
    category: 'impact',
    description: 'Kelas Pendampingan PKM-RE, P2MW, PPK Ormawa, & Lomba untuk membantu tim Anda meraih pendanaan dan prestasi.',
    price: 'Mulai Rp 350.000',
    rating: 5,
    students: 0,
    tiers: [
      {
        name: 'Basic (1x Pertemuan)',
        price: 'Rp 350.000 / tim',
        features: [
          'Review Ide & Judul Proposal',
          'Konsultasi Outline Proposal',
          'Template Proposal dan Panduan Resmi',
          'Review Final Proposal (2x)'
        ]
      },
      {
        name: 'Intensive (3x Pertemuan)',
        price: 'Rp 750.000 / tim',
        features: [
          'Pendampingan dari nol (mentoring pendampingan dimulai dari ide hingga submit)',
          'Klinik Revisi Proposal Intensif',
          'Review Metodologi & Luaran',
          'Strategi Lolos Pendanaan',
          'Template + Contoh Proposal Lolos',
          'Konsultasi via WA selama program'
        ]
      },
      {
        name: 'Exclusive (7x Pertemuan)',
        price: 'Rp 1.200.000 / tim',
        features: [
          'Unlimited Revisi selama periode Program',
          'Pendampingan Teknis dan Administrasi',
          'Simulasi Penilaian Reviewer',
          'Prioritas Fast Response',
          'After-submit Evaluation',
          'Konsultasi via WA selama program'
        ]
      }
    ]
  },

  // 6. OBATIN CLASS
  {
    _type: 'program',
    title: 'OBATIN Class',
    slug: { _type: 'slug', current: 'obatin-class' },
    category: 'obatin',
    description: 'OBrolan Asik Tentang Ilmu Farmasi - Kelas webinar dengan berbagai topik menarik seputar dunia farmasi. Harga variatif sesuai kelas yang dipilih.',
    price: 'Harga Variatif',
    rating: 5,
    students: 0,
    benefits: [
      'Akses webinar gratis',
      'Materi edukatif & aplikatif',
      'E-sertifikat',
      'Insight Kuliah, Riset, dan Karier',
      'Networking sesama Mahasiswa Farmasi'
    ]
  }
];

async function seedNewPrograms() {
  try {
    console.log('🚀 Menambahkan program baru...');
    
    for (const p of newPrograms) {
      await client.create(p);
      console.log(`✅ Berhasil ditambahkan: ${p.title}`);
    }
    
    console.log('\n✨ Seeding Program Baru Selesai!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

seedNewPrograms();
