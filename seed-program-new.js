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

  // 6. PHARMACAMP - FORMULATION COSMETICS CLASS
  {
    _type: 'program',
    title: 'Pharmacamp - Formulation Cosmetics Class',
    slug: { _type: 'slug', current: 'pharmacamp' },
    category: 'pharmacamp',
    description: 'Program edukasi intensif formulasi kosmetik yang menjembatani gap antara teori kuliah dan praktik nyata industri. Kombinasi teori, praktik lab hands-on, dan riset terapan untuk mahasiswa farmasi dan fresh graduate.',
    price: 'Rp 300.000 - Rp 3.000.000',
    rating: 5,
    students: 250,
    benefits: [
      'Scientific-based learning - formulasi aman, stabil, dan efektif berdasarkan ilmu',
      'Integrasi teori + praktik hands-on + riset terapan',
      'Sesuai kebutuhan industri kosmetik modern',
      'Kolaborasi dengan kampus, industri, dan komunitas farmasi',
      'Format fleksibel - online/offline/hybrid sesuai kebutuhan',
      'Pengembangan karier awal melalui skill praktis dan networking',
      'Akses ke mini lab di Depok untuk praktik langsung',
      'Bahan dan formula siap pakai untuk pembelajaran',
      'Mentoring dari praktisi industri berpengalaman',
      'Sertifikat resmi Teman Farmasi setelah menyelesaikan program'
    ]
  },
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
