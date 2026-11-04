// scripts/seed-ukai.mjs
// Jalankan dengan: node scripts/seed-ukai.mjs
// Script ini membuat dokumen UKAI Series di Sanity jika belum ada

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dg157s6c',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-01-01',
});

const ukaiDocument = {
  _type: 'program',
  title: 'UKAI Series',
  slug: { _type: 'slug', current: 'ukai-series' },
  category: 'ukai',
  description: 'Program persiapan ujian komprehensif untuk calon apoteker dan mahasiswa profesi farmasi, dilengkapi bimbingan intensif serta Simulasi Tryout CBT berstandar nasional.',
  price: 'Mulai Rp 99.000',
  badge: 'Bimbel & Tryout CBT',
  whatsappNumber: '628895587621',

  // ── Sub-program: Masuk Apoteker ──
  masukApoteker: {
    title: 'Masuk Apoteker',
    badge: 'Bimbel & Tryout Kampus',
    description: 'Bimbingan intensif persiapan seleksi masuk profesi apoteker untuk berbagai kampus ternama dengan kurikulum teruji dan simulasi CBT.',
    plans: [
      {
        _key: 'ma_plan_0',
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
        _key: 'ma_plan_1',
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
        _key: 'ma_plan_2',
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
  },

  // ── Sub-program: Kelas UKMPPAI ──
  ukmppai: {
    title: 'Kelas UKMPPAI',
    badge: 'Sertifikasi Profesi Apoteker',
    description: 'Persiapan komprehensif Uji Kompetensi Mahasiswa Program Profesi Apoteker Indonesia (UKMPPAI) dengan bank soal blueprint nasional.',
    plans: [
      {
        _key: 'uk_plan_0',
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
        _key: 'uk_plan_1',
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
        _key: 'uk_plan_2',
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
  },

  // ── CBT Platform Highlight Banner ──
  cbtHighlight: {
    badge: 'CBT Platform Teman Farmasi',
    title: 'Didukung Interface CBT Berstandar Nasional',
    description: 'Platform tryout kami dilengkapi timer akurat, ragu-ragu marker, auto-save state, navigasi nomor dinamis, dan pembahasan detail per soal setelah submit.',
    ctaText: 'Konsultasi Sekarang',
  },
};

async function seed() {
  console.log('🔍 Memeriksa apakah dokumen UKAI Series sudah ada...');
  
  const existing = await client.fetch(
    `*[_type == "program" && category == "ukai"][0]{ _id }`,
  );

  if (existing?._id) {
    console.log(`✅ Dokumen UKAI Series sudah ada (ID: ${existing._id})`);
    console.log('   Memperbarui dokumen...');
    const result = await client.patch(existing._id).set(ukaiDocument).commit();
    console.log(`✅ Dokumen berhasil diperbarui! (ID: ${result._id})`);
  } else {
    console.log('📄 Dokumen belum ada, membuat baru...');
    const result = await client.create(ukaiDocument);
    console.log(`✅ Dokumen UKAI Series berhasil dibuat! (ID: ${result._id})`);
  }
  
  console.log('\n🎉 Selesai! Buka Sanity Studio > Programs > UKAI Series untuk mulai mengedit.');
}

seed().catch(console.error);
