// schemas/program.ts
export default {
  name: 'program',
  title: 'Programs',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule: any) => Rule.required() },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'PharmaCore Class', value: 'pharmacore' },
          { title: 'Pharma Research Mentoring', value: 'research' },
          { title: 'PharmaPublish Academy', value: 'publish' },
          { title: 'Pharma Impact', value: 'impact' },
          { title: 'Pharmacamp', value: 'pharmacamp' },
          { title: 'UKAI Series', value: 'ukai' },
        ],
      },
      validation: (Rule: any) => Rule.required()
    },
    { name: 'description', title: 'Description', type: 'text', rows: 4 },
    {
      name: 'badge',
      title: 'Badge Text',
      type: 'string',
      description: 'Teks badge kecil (misal: "Bimbel & Tryout CBT")',
      hidden: ({ document }: any) => document?.category !== 'ukai',
    },
    {
      name: 'whatsappNumber',
      title: 'Nomor WhatsApp Pendaftaran',
      type: 'string',
      description: 'Nomor WA admin (format: 628xxx tanpa +)',
      hidden: ({ document }: any) => document?.category !== 'ukai',
    },
    {
      name: 'masukApoteker',
      title: 'Pengaturan Sub-Program: Masuk Apoteker',
      type: 'object',
      hidden: ({ document }: any) => document?.category !== 'ukai',
      fields: [
        { name: 'title', title: 'Nama Sub-Program', type: 'string', initialValue: 'Masuk Apoteker' },
        { name: 'badge', title: 'Badge', type: 'string', initialValue: 'Bimbel & Tryout Kampus' },
        {
          name: 'description',
          title: 'Deskripsi',
          type: 'text',
          rows: 2,
          initialValue:
            'Bimbingan intensif persiapan seleksi masuk profesi apoteker untuk berbagai kampus ternama dengan kurikulum teruji dan simulasi CBT.',
        },
        {
          name: 'plans',
          title: 'Pilihan Paket / Pricing Plans',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'name', title: 'Nama Paket', type: 'string' },
                { name: 'subtitle', title: 'Sub-judul (Kapasitas)', type: 'string' },
                { name: 'price', title: 'Harga', type: 'string' },
                { name: 'unit', title: 'Satuan (misal: / orang)', type: 'string', initialValue: '/ orang' },
                { name: 'popular', title: 'Tandai Sebagai Terpopuler', type: 'boolean', initialValue: false },
                {
                  name: 'features',
                  title: 'Daftar Benefit / Fitur',
                  type: 'array',
                  of: [{ type: 'string' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'ukmppai',
      title: 'Pengaturan Sub-Program: Kelas UKMPPAI',
      type: 'object',
      hidden: ({ document }: any) => document?.category !== 'ukai',
      fields: [
        { name: 'title', title: 'Nama Sub-Program', type: 'string', initialValue: 'Kelas UKMPPAI' },
        { name: 'badge', title: 'Badge', type: 'string', initialValue: 'Sertifikasi Profesi Apoteker' },
        {
          name: 'description',
          title: 'Deskripsi',
          type: 'text',
          rows: 2,
          initialValue:
            'Persiapan komprehensif Uji Kompetensi Mahasiswa Program Profesi Apoteker Indonesia (UKMPPAI) dengan bank soal blueprint nasional.',
        },
        {
          name: 'plans',
          title: 'Pilihan Paket / Pricing Plans',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'name', title: 'Nama Paket', type: 'string' },
                { name: 'subtitle', title: 'Sub-judul (Kapasitas)', type: 'string' },
                { name: 'price', title: 'Harga', type: 'string' },
                { name: 'unit', title: 'Satuan (misal: / orang)', type: 'string', initialValue: '/ orang' },
                { name: 'popular', title: 'Tandai Sebagai Terpopuler', type: 'boolean', initialValue: false },
                {
                  name: 'features',
                  title: 'Daftar Benefit / Fitur',
                  type: 'array',
                  of: [{ type: 'string' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'cbtHighlight',
      title: 'Highlight Banner Simulasi CBT',
      type: 'object',
      hidden: ({ document }: any) => document?.category !== 'ukai',
      fields: [
        { name: 'badge', title: 'Badge', type: 'string', initialValue: 'CBT Simulation' },
        { name: 'title', title: 'Judul', type: 'string', initialValue: 'Didukung Interface CBT Teman Farmasi' },
        {
          name: 'description',
          title: 'Deskripsi',
          type: 'text',
          rows: 2,
          initialValue:
            'Platform tryout kami dilengkapi timer akurat, ragu-ragu marker, auto-save state, navigasi nomor dinamis, dan pembahasan detail per soal setelah submit.',
        },
        { name: 'ctaText', title: 'Teks Tombol CTA', type: 'string', initialValue: 'Konsultasi Sekarang' },
      ],
    },
    {
      name: 'subjects',
      title: 'Subjects / Course List',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ document }: any) => document?.category !== 'pharmacore'
    },
    
    {
      name: 'tiers',
      title: 'Pricing Tiers',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', title: 'Tier Name', type: 'string' },
          { name: 'price', title: 'Price', type: 'string' },
          { name: 'features', title: 'Tier Features', type: 'array', of: [{ type: 'string' }] }
        ]
      }],
      // Tiers muncul untuk kategori 'research', 'publish', dan 'impact'
      hidden: ({ document }: any) => !['research', 'publish', 'impact'].includes(document?.category)
    },
    
    {
      name: 'benefits',
      title: 'Benefits (untuk Pharmacamp)',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ document }: any) => document?.category !== 'pharmacamp'
    },
    
    { name: 'price', title: 'Starting Price (Label)', type: 'string' },
    { name: 'rating', title: 'Rating', type: 'number', initialValue: 5 },
    { name: 'students', title: 'Students Enrolled', type: 'number' },
  ],
};