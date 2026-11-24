// Default paket UKAI bila Sanity belum punya `plans`. Dipakai halaman /programs (client) dan katalog checkout (server).
// File ini sengaja TANPA import server-only supaya aman masuk bundle client.

export type UkaiPlan = {
  type: string
  name: string
  subtitle: string
  price: string
  unit: string
  popular: boolean
  features: string[]
}

// Default paket UKAI bila Sanity belum punya `plans`. Dipakai juga oleh halaman /programs.
export const UKAI_DEFAULT_PLANS: Record<'masuk_apoteker' | 'ukmppai', UkaiPlan[]> = {
  masuk_apoteker: [
    {
      type: 'bimbel_private',
      name: 'Kelas Bimbel Private',
      subtitle: '2 - 5 Orang per Kelompok',
      price: 'Rp 750.000',
      unit: '/ orang',
      popular: true,
      features: [
        'Kelompok eksklusif 2–5 orang (fokus maksimal)',
        'Bebas request jadwal & materi target kampus',
        'Pendampingan intensif mentor spesialis lolos masuk',
        'Bank soal & pembahasan seleksi kampus terkait',
        'Simulasi Tryout CBT Masuk Apoteker + Analisis Hasil',
        'Konsultasi strategi pemilihan kampus & berkas',
      ],
    },
    {
      type: 'bimbel_reguler',
      name: 'Kelas Bimbel Reguler',
      subtitle: '10 - 15 Orang per Kelas',
      price: 'Rp 350.000',
      unit: '/ orang',
      popular: false,
      features: [
        'Kelas interaktif 10–15 orang via Zoom',
        'Kurikulum terstruktur bedah konsep & soal',
        'Rekaman sesi pembelajaran & rangkuman materi',
        'Akses Bank Soal seleksi masuk apoteker',
        '1x Akses Simulasi Tryout CBT Masuk Apoteker',
        'Grup diskusi & tanya jawab dengan mentor',
      ],
    },
    {
      type: 'tryout_cbt',
      name: 'Tryout CBT Simulasi Masuk',
      subtitle: 'Ujian Mandiri Berbasis CBT',
      price: 'Rp 75.000',
      unit: '/ paket tryout',
      popular: false,
      features: [
        'Sistem CBT mirip ujian seleksi asli',
        'Timer countdown & navigasi soal responsif',
        'Kunci jawaban & pembahasan komprehensif',
        'Skor instan, ranking, & statistik kelemahan materi',
        'Bisa dikerjakan kapan saja (fleksibel)',
      ],
    },
  ],
  ukmppai: [
    {
      type: 'bimbel_private',
      name: 'Kelas Bimbel Private UKMPPAI',
      subtitle: '3 - 5 Orang per Kelompok',
      price: 'Rp 950.000',
      unit: '/ orang',
      popular: true,
      features: [
        'Grup privat 3–5 orang bersama Top Mentor UKMPPAI',
        'Bedah tuntas blueprint soal UKMPPAI terbaru',
        'Drilling soal farmakoterapi, teknologi farmasi, sosial klinis',
        'Akses Paket Tryout CBT UKMPPAI Terpadu',
        'Review & evaluasi personal per peserta',
        'Garansi bimbingan sampai siap ujian',
      ],
    },
    {
      type: 'bimbel_reguler',
      name: 'Kelas Bimbel Reguler UKMPPAI',
      subtitle: '10 - 15 Orang per Kelas',
      price: 'Rp 450.000',
      unit: '/ orang',
      popular: false,
      features: [
        'Kelas komprehensif 10–15 orang via live Zoom',
        'Materi lengkap 4 bidang utama blueprint UKMPPAI',
        'Pembahasan trik cepat analisis kasus klinis & hitungan',
        'Rekaman kelas + ringkasan materi PDF',
        '1x Akses Tryout CBT Simulasi Nasional',
        'Forum diskusi soal harian bersama mentor',
      ],
    },
    {
      type: 'tryout_cbt',
      name: 'Tryout CBT Blueprint UKMPPAI',
      subtitle: 'Simulasi Lengkap 200 Soal',
      price: 'Rp 99.000',
      unit: '/ paket tryout',
      popular: false,
      features: [
        '200 Soal standar blueprint UKMPPAI nasional',
        'Interface CBT presisi dengan durasi waktu riil',
        'Pembahasan mendalam pada setiap opsi jawaban',
        'Analisis performa per bidang kompetensi',
        'Akses pembahasan tanpa batas setelah selesai',
      ],
    },
  ],
}
