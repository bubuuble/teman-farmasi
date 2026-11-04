// sanity/schemas/ukaiBanner.ts
export default {
  name: 'ukaiBanner',
  title: 'UKAI Series (Homepage Banner & Detail)',
  type: 'document',
  fields: [
    {
      name: 'badge',
      title: 'Badge Text',
      type: 'string',
      description: 'Teks badge kecil di atas judul (misal: "✨ Program Unggulan Baru — UKAI Series")',
      initialValue: '✨ Program Unggulan Baru — UKAI Series',
    },
    {
      name: 'title',
      title: 'Judul Utama Banner',
      type: 'string',
      description: 'Judul banner UKAI di homepage',
      initialValue: 'Persiapan Ujian Masuk Apoteker & UKMPPAI Berbasis CBT',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Deskripsi Banner',
      type: 'text',
      rows: 3,
      description: 'Deskripsi singkat program UKAI di banner homepage',
      initialValue:
        'Tersedia bimbingan kelas intensif (Private & Reguler) serta Simulasi CBT Tryout dengan ribuan bank soal dan pembahasan lengkap untuk mengantarkanmu lulus dengan predikat terbaik.',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'ctaText',
      title: 'Teks Tombol CTA',
      type: 'string',
      description: 'Teks pada tombol (misal: "Lihat Detail UKAI Series")',
      initialValue: 'Lihat Detail UKAI Series',
    },
    {
      name: 'ctaLink',
      title: 'Link Tombol CTA',
      type: 'string',
      description: 'Tujuan link tombol (default: "/programs?cat=ukai")',
      initialValue: '/programs?cat=ukai',
    },
    {
      name: 'whatsappNumber',
      title: 'Nomor WhatsApp Pendaftaran',
      type: 'string',
      description: 'Nomor WA admin untuk pendaftaran (format: 628xxx tanpa tanda +)',
      initialValue: '628895587621',
    },
    // Sub-program Masuk Apoteker
    {
      name: 'masukApoteker',
      title: 'Pengaturan Sub-Program: Masuk Apoteker',
      type: 'object',
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
    // Sub-program UKMPPAI
    {
      name: 'ukmppai',
      title: 'Pengaturan Sub-Program: Kelas UKMPPAI',
      type: 'object',
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
    // CBT Platform Highlight Banner
    {
      name: 'cbtHighlight',
      title: 'Highlight Banner Simulasi CBT',
      type: 'object',
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'badge',
    },
  },
};

