import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dg157s6c';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

// Create client with write token
const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // You'll need to set this
});

// Dummy data
const heroData = {
  _type: 'hero',
  _id: 'hero-singleton',
  title: 'Bimbingan',
  titleLine2: 'Privat untuk',
  highlightedText: 'Riset Farmasi',
  titleLine3: 'Anda',
  description: 'Menjembatani kesenjangan antara teori akademik dan keterampilan riset praktis. Kami membantu Anda sukses dalam skripsi dan publikasi.',
  ctaText: 'Mulai Sekarang',
  emailPlaceholder: 'Masukkan email Anda',
  successRate: '95%',
  studentRating: '4.9/5',
  footerNote: 'Tanpa Kartu Kredit',
};

const blogPosts = [
  {
    _type: 'blog',
    title: '5 Tips Memilih Topik Skripsi Farmasi yang Tepat',
    slug: { current: 'tips-memilih-topik-skripsi-farmasi' },
    date: '2024-12-01',
    excerpt: 'Memilih topik skripsi yang tepat adalah langkah pertama menuju kesuksesan. Pelajari strategi jitu untuk menemukan topik yang sesuai dengan minat dan kebutuhan industri.',
    author: 'Dr. Sarah Johnson',
    category: 'Research Tips',
    readTime: 8,
    publishedAt: '2024-12-01',
    featured: true,
  },
  {
    _type: 'blog',
    title: 'Metodologi Penelitian: Panduan Lengkap untuk Mahasiswa Farmasi',
    slug: { current: 'metodologi-penelitian-farmasi' },
    date: '2024-11-28',
    excerpt: 'Pahami berbagai metodologi penelitian dalam farmasi, dari eksperimental hingga observasional. Panduan praktis untuk menyusun metodologi yang solid.',
    author: 'Apt. Budi Santoso',
    category: 'Methodology',
    readTime: 12,
    publishedAt: '2024-11-28',
    featured: true,
  },
  {
    _type: 'blog',
    title: 'Cara Menulis Literature Review yang Berkualitas',
    slug: { current: 'menulis-literature-review' },
    date: '2024-11-25',
    excerpt: 'Literature review yang baik adalah fondasi penelitian yang kuat. Pelajari teknik pencarian jurnal, analisis kritis, dan penulisan yang sistematis.',
    author: 'Prof. Dr. Rina Wijaya',
    category: 'Writing Tips',
    readTime: 10,
    publishedAt: '2024-11-25',
    featured: false,
  },
  {
    _type: 'blog',
    title: 'Analisis Data Statistik untuk Penelitian Farmasi',
    slug: { current: 'analisis-data-statistik-farmasi' },
    date: '2024-11-20',
    excerpt: 'Kuasai analisis statistik dengan SPSS dan R. Dari uji normalitas hingga regresi, panduan lengkap untuk mengolah data penelitian Anda.',
    author: 'Dr. Ahmad Rahman',
    category: 'Statistics',
    readTime: 15,
    publishedAt: '2024-11-20',
    featured: false,
  },
  {
    _type: 'blog',
    title: 'Publikasi Jurnal: Tips Lolos Review dari Editor',
    slug: { current: 'tips-publikasi-jurnal-farmasi' },
    date: '2024-11-15',
    excerpt: 'Ingin mempublikasikan penelitian Anda? Pelajari strategi menulis manuscript yang menarik dan tips menghadapi peer review.',
    author: 'Apt. Dewi Lestari',
    category: 'Publication',
    readTime: 11,
    publishedAt: '2024-11-15',
    featured: true,
  },
  {
    _type: 'blog',
    title: 'Etika Penelitian dan Good Clinical Practice',
    slug: { current: 'etika-penelitian-farmasi' },
    date: '2024-11-10',
    excerpt: 'Memahami prinsip etika penelitian dan GCP adalah wajib bagi peneliti farmasi. Panduan lengkap untuk mendapatkan ethical clearance.',
    author: 'Prof. Dr. Hadi Susanto',
    category: 'Ethics',
    readTime: 9,
    publishedAt: '2024-11-10',
    featured: false,
  },
];

const programs = [
  {
    _type: 'program',
    title: 'Clinical Pharmacy Research',
    slug: { current: 'clinical-pharmacy-research' },
    description: 'Comprehensive mentoring for clinical pharmacy research, from protocol design to publication. Perfect for students focusing on therapeutic studies and patient care.',
    rating: 4.9,
    students: 450,
    duration: '3 months',
    sessions: 12,
    features: ['Protocol development assistance', 'Statistical analysis guidance', 'Manuscript writing support', 'Weekly 1-on-1 mentoring'],
    bgColor: 'bg-brand-yellow',
    featured: true,
  },
  {
    _type: 'program',
    title: 'Pharmaceutical Technology',
    slug: { current: 'pharmaceutical-technology' },
    description: 'Master formulation development and characterization techniques. Ideal for research in drug delivery systems and novel dosage forms.',
    rating: 4.8,
    students: 380,
    duration: '4 months',
    sessions: 16,
    features: ['Formulation design guidance', 'Characterization techniques', 'Stability testing protocols', 'Lab troubleshooting support'],
    bgColor: 'bg-brand-pink',
    featured: true,
  },
  {
    _type: 'program',
    title: 'Pharmacology & Toxicology',
    slug: { current: 'pharmacology-toxicology' },
    description: 'Expert guidance for in-vivo and in-vitro pharmacological studies. From ethical clearance to data interpretation.',
    rating: 5.0,
    students: 320,
    duration: '5 months',
    sessions: 20,
    features: ['Animal study protocols', 'Ethical clearance assistance', 'Biochemical analysis guidance', 'Result interpretation'],
    bgColor: 'bg-brand-blue',
    featured: true,
  },
  {
    _type: 'program',
    title: 'Phytopharmacy & Natural Products',
    slug: { current: 'phytopharmacy-natural-products' },
    description: 'Specialized mentoring for herbal medicine research. From plant authentication to bioactivity testing.',
    rating: 4.7,
    students: 290,
    duration: '3 months',
    sessions: 12,
    features: ['Plant identification guidance', 'Extraction optimization', 'Phytochemical screening', 'Bioassay techniques'],
    bgColor: 'bg-brand-yellow',
    featured: true,
  },
  {
    _type: 'program',
    title: 'Hospital Pharmacy Management',
    slug: { current: 'hospital-pharmacy-management' },
    description: 'Research track for hospital pharmacy operations, pharmaceutical care, and medication safety studies.',
    rating: 4.9,
    students: 210,
    duration: '2 months',
    sessions: 8,
    features: ['Survey design assistance', 'Data collection strategies', 'Healthcare policy analysis', 'Quality improvement projects'],
    bgColor: 'bg-brand-pink',
    featured: false,
  },
  {
    _type: 'program',
    title: 'Pharmaceutical Analysis',
    slug: { current: 'pharmaceutical-analysis' },
    description: 'Master analytical method development and validation. HPLC, GC, spectroscopy, and more.',
    rating: 4.8,
    students: 340,
    duration: '4 months',
    sessions: 16,
    features: ['Method development guidance', 'Validation protocol support', 'Instrument optimization', 'Troubleshooting techniques'],
    bgColor: 'bg-brand-blue',
    featured: false,
  },
] as any;

const pharmacampProgram = {
  _type: 'program',
  title: 'Pharmacamp - Formulation Cosmetics Class',
  slug: { current: 'pharmacamp' },
  category: 'pharmacamp',
  description: 'Program edukasi intensif formulasi kosmetik yang menjembatani gap antara teori kuliah dan praktik nyata industri. Kombinasi teori, praktik lab hands-on, dan riset terapan untuk mahasiswa farmasi dan fresh graduate.',
  rating: 5.0,
  students: 250,
  price: 'Rp 300.000 - Rp 3.000.000',
  duration: 'Fleksibel',
  sessions: 5,
  features: ['Praktik langsung di mini lab', 'Mentoring dari praktisi industri', 'Akses formula dan bahan', 'Sertifikat resmi'],
  bgColor: 'bg-brand-pink',
  featured: true,
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
};

const mentors = [
  {
    _type: 'mentor',
    name: 'Apt. Sarah Johnson, M.Sc.',
    role: 'Clinical Pharmacy Specialist',
    rating: 5.0,
    reviews: '1.2k',
    cardColor: 'bg-brand-pink',
    borderColor: 'border-white',
    expertise: ['Clinical trials', 'Therapeutic studies', 'Patient care research'],
    featured: true,
  },
  {
    _type: 'mentor',
    name: 'Dr. William Hartono, Ph.D.',
    role: 'Pharmaceutical Technology',
    rating: 4.9,
    reviews: '850',
    cardColor: 'bg-brand-blue',
    borderColor: 'border-white',
    expertise: ['Drug formulation', 'Nanoparticles', 'Quality control'],
    featured: true,
  },
  {
    _type: 'mentor',
    name: 'Apt. Olivia Wijaya, M.Farm.',
    role: 'Social & Community Pharmacy',
    rating: 4.8,
    reviews: '920',
    cardColor: 'bg-brand-yellow',
    borderColor: 'border-white',
    expertise: ['Survey research', 'Public health', 'Medication adherence'],
    featured: true,
  },
  {
    _type: 'mentor',
    name: 'Prof. Dr. Sophia Chen',
    role: 'Pharmacology Expert',
    rating: 5.0,
    reviews: '1.5k',
    cardColor: 'bg-brand-pink',
    borderColor: 'border-white',
    expertise: ['In-vivo studies', 'Toxicology', 'Drug discovery'],
    featured: true,
  },
  {
    _type: 'mentor',
    name: 'Dr. Darrell Kusuma, Ph.D.',
    role: 'Bio-Statistics & Data Science',
    rating: 5.0,
    reviews: '2k+',
    cardColor: 'bg-brand-blue',
    borderColor: 'border-white',
    expertise: ['SPSS & R programming', 'Advanced statistics', 'Data visualization'],
    featured: false,
  },
  {
    _type: 'mentor',
    name: 'Apt. Theresa Lim, M.Sc.',
    role: 'Pharmacy Management',
    rating: 4.9,
    reviews: '700+',
    cardColor: 'bg-brand-yellow',
    borderColor: 'border-white',
    expertise: ['Hospital pharmacy', 'Operations research', 'Quality management'],
    featured: false,
  },
];

const testimonials = [
  {
    _type: 'testimonial',
    name: 'Andi Pratama',
    role: 'Clinical Pharmacy Student',
    text: 'Teman Farmasi membantu saya menyusun skripsi dengan sempurna. Saya lulus dengan predikat Cum Laude berkat bimbingan mereka yang luar biasa!',
    cardColor: 'bg-brand-yellow',
    featured: true,
  },
  {
    _type: 'testimonial',
    name: 'Siti Aminah',
    role: 'Pharmaceutical Technology',
    text: 'Bimbingan metodologi yang diberikan benar-benar mengubah penelitian saya. Interpretasi data menjadi jauh lebih mudah dipahami.',
    cardColor: 'bg-brand-pink',
    featured: true,
  },
  {
    _type: 'testimonial',
    name: 'Rina Safitri',
    role: 'Social Pharmacy',
    text: 'Mentor saya sangat responsif dan membantu saya memilih topik penelitian yang sempurna. Panduan penulisan mereka sangat sistematis.',
    cardColor: 'bg-brand-blue',
    featured: true,
  },
  {
    _type: 'testimonial',
    name: 'Budi Wirawan',
    role: 'Clinical Pharmacy',
    text: 'Sangat direkomendasikan untuk mahasiswa tingkat akhir. Pendekatan yang terstruktur membuat penulisan skripsi jadi tidak stres.',
    cardColor: 'bg-brand-yellow',
    featured: false,
  },
  {
    _type: 'testimonial',
    name: 'Dewi Kartika',
    role: 'Hospital Pharmacy',
    text: 'Konsultasi mingguan membuat saya tetap on track. Pengalaman industri mentor memberikan wawasan yang sangat berharga.',
    cardColor: 'bg-brand-pink',
    featured: false,
  },
  {
    _type: 'testimonial',
    name: 'Rizky Maulana',
    role: 'Pharmaceutical Technology',
    text: 'Saya kesulitan dengan desain eksperimen. Bimbingan tentang metodologi sangat membantu dan luar biasa detail.',
    cardColor: 'bg-brand-blue',
    featured: false,
  },
];

async function seedData() {
  console.log('🌱 Starting to seed data...\n');

  try {
    // Delete existing data to prevent duplicates
    console.log('🗑️  Deleting existing data...');
    
    const deleteOperations = [
      client.delete({ query: '*[_type == "blog"]' }),
      client.delete({ query: '*[_type == "program"]' }),
      client.delete({ query: '*[_type == "mentor"]' }),
      client.delete({ query: '*[_type == "testimonial"]' }),
    ];
    
    await Promise.all(deleteOperations);
    console.log('✅ Existing data deleted\n');

    // Create hero
    console.log('Creating hero content...');
    await client.createOrReplace(heroData);
    console.log('✅ Hero created\n');

    // Create blog posts
    console.log('Creating blog posts...');
    for (const post of blogPosts) {
      await client.create(post);
      console.log(`✅ Created: ${post.title}`);
    }
    console.log('\n');

    // Create programs
    console.log('Creating programs...');
    for (const program of programs) {
      await client.create(program);
      console.log(`✅ Created: ${program.title}`);
    }
    
    // Create Pharmacamp program
    await client.create(pharmacampProgram);
    console.log(`✅ Created: ${pharmacampProgram.title}`);
    console.log('\n');

    // Create mentors
    console.log('Creating mentors...');
    for (const mentor of mentors) {
      await client.create(mentor);
      console.log(`✅ Created: ${mentor.name}`);
    }
    console.log('\n');

    // Create testimonials
    console.log('Creating testimonials...');
    for (const testimonial of testimonials) {
      await client.create(testimonial);
      console.log(`✅ Created testimonial from: ${testimonial.name}`);
    }
    console.log('\n');

    console.log('🎉 All data seeded successfully!');
    console.log('\n⚠️  Note: Images need to be uploaded manually through Sanity Studio');
    console.log('Go to http://localhost:3000/studio to add images to your content');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedData();
