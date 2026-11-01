'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import LoadingSpinner from "@/app/components/LoadingSpinner";

// Optimasi Ikon (Satu per satu)
import { FaWhatsapp, FaCheck, FaBookOpen, FaLayerGroup, FaStar, FaLaptopCode, FaGraduationCap, FaAward, FaCircleCheck } from "react-icons/fa6";
import { createClient } from 'next-sanity';

// --- 1. TIPE DATA ---
interface Tier { name: string; price: string; features: string[]; }
interface Program {
  _id: string; title: string; category: string;
  description: string; price: string;
  subjects?: string[]; tiers?: Tier[]; benefits?: string[];
}

const client = createClient({
  projectId: 'dg157s6c', 
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-01-01',
});

// --- 2. PALET WARNA & LOGIKA KONTRAS ---
const colorPalette = [
  'bg-brand-pink',   
  'bg-brand-blue',   
  'bg-brand-yellow', 
];

const getStylesByColor = (colorClass: string) => {
  const isDark = ['bg-brand-pink', 'bg-brand-blue', 'bg-brand-purple'].includes(colorClass);

  return {
    card: colorClass,
    title: isDark ? 'text-white' : 'text-brand-dark',
    desc: isDark ? 'text-white/80' : 'text-gray-600',
    iconBg: isDark ? 'bg-white/20 text-white' : 'bg-brand-cream text-brand-dark',
    badge: isDark ? 'bg-white/20 text-white border-white/20' : 'bg-brand-dark/5 text-brand-dark border-brand-dark/10',
    // Footer Box Putih (Konsisten)
    footer: 'bg-white shadow-lg border border-gray-100',
    priceLabel: 'text-gray-400',
    priceVal: 'text-brand-dark',
    waBtn: 'bg-green-500 text-white hover:bg-brand-dark',
  };
};

function ProgramsContent({ categoryFilter }: { categoryFilter: string | null }) {
  const isUkai = categoryFilter === 'ukai';
  const [activeUkaiTab, setActiveUkaiTab] = useState<'masuk_apoteker' | 'ukmppai'>('masuk_apoteker');
  const [programData, setProgramData] = useState<Program | null>(null);
  const [loading, setLoading] = useState(!!categoryFilter && !isUkai);

  const WA_NUMBER = "628895587621"; 

  useEffect(() => {
    if (!categoryFilter || categoryFilter === 'ukai') return;
    let isMounted = true;
    client.fetch(`*[_type == "program" && category == $cat][0]`, { cat: categoryFilter })
      .then((data) => {
        if (isMounted) {
          setProgramData(data);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [categoryFilter]);

  const handleWaLink = (name: string) => {
    const msg = encodeURIComponent(`Halo Teman Farmasi, saya ingin daftar program: ${name}`);
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
  };

  if (loading) return <LoadingSpinner />;

  // Case UKAI Series (Custom UI with interactive subprograms & CBT highlight)
  if (isUkai) {
    const ukaiSubprograms = {
      masuk_apoteker: {
        title: 'Masuk Apoteker',
        badge: 'Bimbel & Tryout Kampus',
        description: 'Bimbingan intensif persiapan seleksi masuk profesi apoteker untuk berbagai kampus ternama dengan kurikulum teruji dan simulasi CBT.',
        icon: FaGraduationCap,
        plans: [
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
            ]
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
            ]
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
            ]
          }
        ]
      },
      ukmppai: {
        title: 'Kelas UKMPPAI',
        badge: 'Sertifikasi Profesi Apoteker',
        description: 'Persiapan komprehensif Uji Kompetensi Mahasiswa Program Profesi Apoteker Indonesia (UKMPPAI) dengan bank soal blueprint nasional.',
        icon: FaAward,
        plans: [
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
            ]
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
            ]
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
            ]
          }
        ]
      }
    };

    const currentSub = ukaiSubprograms[activeUkaiTab];

    return (
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto font-sans">
        {/* HEADER UKAI SERIES */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 bg-brand-pink/10 text-brand-pink px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4">
            <FaLaptopCode size={14} /> CBT & Mentoring Series
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-brand-dark mb-4 tracking-tighter uppercase leading-tight">
            UKAI Series
          </h1>
          <p className="text-gray-600 font-medium text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Program persiapan ujian komprehensif untuk calon apoteker dan mahasiswa profesi farmasi, dilengkapi bimbingan intensif serta <span className="font-bold text-brand-dark">Simulasi Tryout CBT</span> berstandar nasional.
          </p>

          {/* SUBPROGRAM TOGGLE / TABS */}
          <div className="flex justify-center mt-8">
            <div className="bg-white p-1.5 rounded-3xl shadow-md border border-gray-100 inline-flex gap-2">
              <button
                onClick={() => setActiveUkaiTab('masuk_apoteker')}
                className={`px-6 py-3.5 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2 ${
                  activeUkaiTab === 'masuk_apoteker'
                    ? 'bg-brand-dark text-white shadow-md'
                    : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                <FaGraduationCap size={16} />
                Masuk Apoteker
              </button>
              <button
                onClick={() => setActiveUkaiTab('ukmppai')}
                className={`px-6 py-3.5 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2 ${
                  activeUkaiTab === 'ukmppai'
                    ? 'bg-brand-pink text-white shadow-md'
                    : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                <FaAward size={16} />
                Kelas UKMPPAI
              </button>
            </div>
          </div>
        </div>

        {/* SUBPROGRAM INFO BANNER */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 mb-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
              activeUkaiTab === 'masuk_apoteker' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-brand-pink'
            }`}>
              <currentSub.icon size={30} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-brand-dark tracking-tight">
                  {currentSub.title}
                </h2>
                <span className="bg-brand-dark/5 text-brand-dark text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  {currentSub.badge}
                </span>
              </div>
              <p className="text-gray-500 text-sm font-medium mt-1 leading-relaxed max-w-2xl">
                {currentSub.description}
              </p>
            </div>
          </div>
          <div className="bg-brand-cream/80 px-6 py-4 rounded-2xl text-center shrink-0 border border-brand-dark/5">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Sistem Ujian</p>
            <p className="text-base font-extrabold text-brand-dark mt-0.5 flex items-center gap-1.5 justify-center">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Real CBT Platform
            </p>
          </div>
        </div>

        {/* PRICING & OPTIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentSub.plans.map((plan, i) => {
            const isHighlighted = plan.popular;
            return (
              <div
                key={plan.type}
                className={`rounded-[3rem] p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 relative overflow-hidden ${
                  isHighlighted
                    ? 'bg-gradient-to-b from-brand-dark to-slate-900 text-white shadow-2xl border-2 border-brand-pink'
                    : 'bg-white text-brand-dark shadow-sm hover:shadow-xl border border-gray-100'
                }`}
              >
                {isHighlighted && (
                  <div className="absolute top-5 right-6">
                    <span className="bg-brand-pink text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                      Paling Populer
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <span className={`inline-block text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3 ${
                    isHighlighted ? 'bg-white/10 text-teal-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {plan.subtitle}
                  </span>
                  <h3 className={`font-heading text-2xl font-extrabold tracking-tight mb-2 ${
                    isHighlighted ? 'text-white' : 'text-brand-dark'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className={`font-heading text-3xl md:text-4xl font-extrabold tracking-tight ${
                      isHighlighted ? 'text-teal-300' : 'text-brand-dark'
                    }`}>
                      {plan.price}
                    </span>
                    <span className={`text-xs font-bold ${
                      isHighlighted ? 'text-white/60' : 'text-gray-400'
                    }`}>
                      {plan.unit}
                    </span>
                  </div>
                </div>

                <div className="flex-1 my-6">
                  <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-4 ${
                    isHighlighted ? 'text-white/60' : 'text-gray-400'
                  }`}>
                    Fasilitas yang didapat:
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs md:text-sm font-semibold leading-relaxed">
                        <FaCircleCheck
                          size={14}
                          className={`shrink-0 mt-0.5 ${
                            isHighlighted ? 'text-teal-400' : 'text-brand-pink'
                          }`}
                        />
                        <span className={isHighlighted ? 'text-white/90' : 'text-gray-600'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleWaLink(`UKAI Series - ${currentSub.title} (${plan.name})`)}
                  className={`w-full py-4 px-6 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                    isHighlighted
                      ? 'bg-brand-pink hover:bg-white hover:text-brand-dark text-white'
                      : 'bg-green-500 hover:bg-brand-dark text-white'
                  }`}
                >
                  <FaWhatsapp size={16} />
                  Daftar via WhatsApp
                </button>
              </div>
            );
          })}
        </div>

        {/* CBT PLATFORM HIGHLIGHT BANNER */}
        <div className="mt-16 bg-gradient-to-r from-brand-yellow/30 via-brand-cream to-white rounded-[3rem] p-8 md:p-12 border border-brand-yellow/40 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="inline-block bg-brand-yellow text-brand-dark text-[10px] font-extrabold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-3">
              CBT Simulation
            </span>
            <h3 className="font-heading text-2xl md:text-3xl font-extrabold text-brand-dark tracking-tight mb-2">
              Didukung Interface CBT Teman Farmasi
            </h3>
            <p className="text-gray-600 text-sm font-medium leading-relaxed max-w-xl">
              Platform tryout kami dilengkapi timer akurat, ragu-ragu marker, auto-save state, navigasi nomor dinamis, dan pembahasan detail per soal setelah submit.
            </p>
          </div>
          <button
            onClick={() => handleWaLink(`Konsultasi Tryout CBT UKAI Series`)}
            className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-extrabold text-xs hover:bg-brand-pink transition-all shadow-md active:scale-95 shrink-0"
          >
            Konsultasi Sekarang
          </button>
        </div>
      </div>
    );
  }

  if (!programData) return (
    <div className="text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 mx-6 font-bold text-gray-400">Kategori belum tersedia.</div>
  );

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto font-sans">
      
      {/* HEADER */}
      <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-brand-dark mb-4 tracking-tighter uppercase leading-tight">
          {programData.category === 'pharmacore' ? 'PharmaCore Class' : 
           programData.category === 'research' ? 'Pharma Research Mentoring' : 
           programData.category === 'publish' ? 'PharmaPublish Academy' :
           programData.category === 'impact' ? 'Pharma Impact' :
           programData.category === 'pharmacamp' ? 'Pharmacamp' : programData.title}
        </h1>
        <p className="text-brand-pink font-extrabold text-lg md:text-xl uppercase tracking-[0.3em] opacity-80">
          {programData.category === 'pharmacore' ? 'Kelas Mata Kuliah Farmasi' : 
           programData.category === 'research' ? 'Kelas Riset & Skripsi Farmasi' :
           programData.category === 'publish' ? 'Kelas Manuskrip Jurnal Publikasi Ilmiah Farmasi' :
           programData.category === 'impact' ? 'Kelas Pendampingan PKM-RE, P2MW, PPK Ormawa, & Lomba' :
           programData.category === 'pharmacamp' ? 'Formulation Cosmetics Class' : programData.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 justify-center max-w-6xl mx-auto">
        
        {/* CASE PHARMACORE */}
        {programData.category === 'pharmacore' && programData.subjects?.map((blockText, i) => {
          const [title, raw] = blockText.split(':');
          const mats = raw?.split('-').filter(m => m.trim() !== '') || [];
          const s = getStylesByColor(colorPalette[i % colorPalette.length]);

          return (
            <div key={`block-${i}`} className={`${s.card} rounded-[3rem] p-8 shadow-sm flex flex-col hover:shadow-xl transition-all group animate-in zoom-in-95 duration-500`}>
              <div className="flex-1">
                <div className={`w-14 h-14 ${s.iconBg} rounded-2xl flex items-center justify-center mb-8 shadow-inner`}>
                  <FaBookOpen size={24} />
                </div>
                <h3 className={`font-heading font-bold text-2xl mb-6 ${s.title}`}>{title}</h3>
                <ul className="space-y-4 mb-10">
                  {mats.map((m, idx) => (
                    <li key={`mat-${idx}`} className={`flex items-start gap-3 text-sm font-bold ${s.desc}`}>
                      <div className="w-1.5 h-1.5 bg-current rounded-full mt-2 shrink-0 opacity-40" />
                      {m.trim()}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* FOOTER PUTIH KONSISTEN */}
              <div className={`${s.footer} mt-auto rounded-[2rem] p-6 flex justify-between items-center transition-transform group-hover:scale-[1.02]`}>
                <div>
                  <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Harga</p>
                  <p className="text-xl font-extrabold text-brand-dark tracking-tighter">Rp 99.900 / Mata Kuliah</p>
                </div>
                <button 
                  onClick={() => handleWaLink(title)}
                  className="bg-green-500 text-white px-8 py-4 rounded-2xl font-extrabold text-xs flex items-center gap-2 hover:bg-brand-dark transition-all shadow-md active:scale-95"
                >
                  <FaWhatsapp size={16}/> Daftar
                </button>
              </div>
            </div>
          );
        })}

        {/* CASE RESEARCH & PUBLISH & IMPACT */}
        {(programData.category === 'research' || programData.category === 'publish' || programData.category === 'impact') && 
         programData.tiers?.map((tier, i) => {
          const s = getStylesByColor(colorPalette[i % colorPalette.length]);

          return (
            <div key={`tier-${i}`} className={`${s.card} rounded-[3rem] p-8 shadow-sm flex flex-col hover:shadow-xl transition-all group animate-in zoom-in-95 duration-500`}>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 ${s.iconBg} rounded-2xl flex items-center justify-center shadow-inner`}>
                    <FaLayerGroup size={24} />
                  </div>
                  <div className="flex text-brand-yellow gap-1">
                     {[...Array(5)].map((_, idx) => <FaStar key={`star-${idx}`} size={12} />)}
                  </div>
                </div>
                
                <h3 className={`font-heading font-bold text-3xl mb-4 tracking-tighter leading-tight ${s.title}`}>
                  {tier.name}
                </h3>
                
                <div className="mb-10">
                  <p className={`text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6 opacity-60 ${s.title}`}>Fasilitas Eksklusif:</p>
                  <ul className="space-y-4">
                    {tier.features.map((f, idx) => (
                      <li key={`feat-${idx}`} className={`flex items-start gap-4 text-[13px] font-bold leading-snug ${s.desc}`}>
                        <div className={`mt-0.5 p-1 rounded-full shrink-0 ${s.badge}`}>
                          <FaCheck size={8} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* FOOTER PUTIH KONSISTEN */}
              <div className={`${s.footer} mt-auto rounded-[2rem] p-6 flex justify-between items-center transition-transform group-hover:scale-[1.02]`}>
                <div>
                  <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Harga</p>
                  <p className="text-xl font-extrabold text-brand-dark tracking-tighter">{tier.price}</p>
                </div>
                <button 
                  onClick={() => handleWaLink(tier.name)}
                  className="bg-green-500 text-white px-8 py-4 rounded-2xl font-extrabold text-xs flex items-center gap-2 hover:bg-brand-dark transition-all shadow-md active:scale-95"
                >
                  <FaWhatsapp size={16}/> Daftar via WA
                </button>
              </div>
            </div>
          );
        })}

        {/* CASE PHARMACAMP */}
        {/* CASE PHARMACAMP */}
{programData.category === 'pharmacamp' && (() => {
  const pharmacampClasses = [
    {
      title: 'Formulation Lab Experience',
      duration: '±1 jam',
      pricing: [
        { label: 'Private (1 orang)', price: 'Rp 300.000 / orang' },
        { label: 'Berdua (2 orang)', price: 'Rp 275.000 / orang' },
      ],
      features: [
        'Materi teori formulasi (basic)',
        'Hands-on formulation (praktik langsung) : 1 Formula',
        'Pengenalan & fungsi bahan baku kosmetik/farmasi',
        'Diskusi troubleshooting formula',
        'E-modul / materi ringkas PDF',
        'Sertifikat',
        'Konsultasi singkat pasca kelas (via chat)',
      ],
    },
    {
      title: 'Research Mentorship',
      duration: null,
      pricing: [{ label: 'Private (1 orang)', price: 'Rp 750.000 / orang' }],
      features: [
        'Konsultasi judul & arah penelitian',
        'Pendampingan desain penelitian & variabel',
        'Arahan metode penelitian & analisis data',
        'Akses formula basis (sesuai topik riset) : F0, F1, F2, dan F3',
        'Diskusi teknis pelaksanaan penelitian',
        'Sertifikat',
      ],
    },
    {
      title: 'Skill Development Program',
      duration: '2 hari',
      pricing: [{ label: 'Per kegiatan', price: 'Rp 1.500.000 / kegiatan' }],
      features: [
        'Peran & kompetensi',
        'Komunikasi profesional',
        'Etika & sikap kerja',
        'Dasar critical thinking kasus',
        'Pendalaman alur formulasi kosmetik (idea → prototype)',
        'Pengenalan bahan baku kosmetik & fungsinya',
        'Diskusi studi kasus troubleshooting dasar formula',
        'Insight karir di Industri Kosmetik',
        'Akses modul formulasi kosmetik terpilih (PDF)',
        'Sertifikat',
      ],
    },
    {
      title: 'Business Mentoring',
      duration: '5 hari',
      pricing: [{ label: 'Per program', price: 'Rp 3.000.000 / program' }],
      features: [
        'Analisis ide & konsep produk',
        'Pendampingan pengembangan formula dan maklon',
        'Penentuan target market & positioning',
        'Costing, pricing, dan estimasi HPP',
        'Insight regulasi awal (CPKB, BPOM & Halal)',
        'Strategi branding & value proposition',
        'Action plan bisnis (step-by-step)',
        'Sertifikat',
      ],
    },
    {
      title: 'Collaboration Event',
      duration: null,
      pricing: [{ label: 'Harga', price: 'By agreement' }],
      features: [
        'Penyesuaian materi sesuai tema event (Talkshow, Workshop, Bootcamp, Roadshow)',
        'Target audiens: Mahasiswa, Fresh Graduate, Startup, UMKM',
        'Pelaksanaan: Offline / Online / Hybrid',
        'Exclusive Class for Partner: community development, kolaborasi riset, potensi partnership',
        'Branding di poster, flyer, media sosial (Feed, IGS, Reels, TikTok)',
        'Sertifikat & materi acara',
      ],
    },
  ];

  const labPhotos = [
    { src: '/images/lab1.jpeg', label: 'Area Kerja' },
    { src: '/images/lab2.jpeg', label: 'Area Kerja' },
  ];

  return (
    <div className="col-span-full space-y-10">

      {/* ── BACKGROUND ── */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          <div className="flex-1">
            <span className="inline-block bg-brand-pink/10 text-brand-pink text-[10px] font-extrabold uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-4">
              Background
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-brand-dark tracking-tighter leading-tight mb-4">
              Mengapa PharmaCamp Hadir?
            </h2>
            <p className="text-gray-500 font-bold text-sm leading-relaxed mb-3">
              Perkembangan industri kosmetik yang semakin pesat menuntut sumber daya manusia farmasi yang tidak hanya memahami teori, tetapi juga memiliki{' '}
              <span className="text-brand-dark">kompetensi praktis dalam ilmu formulasi.</span>
            </p>
            <p className="text-gray-500 font-bold text-sm leading-relaxed">
              PharmaCamp hadir sebagai wadah pembelajaran intensif yang dirancang oleh{' '}
              <span className="text-brand-dark">Szalszabilla Rahayu, S.Farm., M.Farm.</span> (Founder & CEO Teman Farmasi), bersama komunitas lebih dari{' '}
              <span className="text-brand-dark">2.000 mahasiswa farmasi</span> dari seluruh Indonesia — menjembatani kesenjangan antara teori di bangku kuliah dan penerapan formulasi secara nyata.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 shrink-0">
            {[
              { num: '2.000+', label: 'Mahasiswa Farmasi' },
              { num: '4', label: 'Kategori Produk' },
              { num: '5', label: 'Program Kelas' },
              { num: '3', label: 'Mode Belajar' },
            ].map((s, i) => (
              <div key={i} className="bg-brand-cream rounded-2xl p-5 text-center min-w-[110px]">
                <p className="font-heading text-2xl font-extrabold text-brand-pink tracking-tighter">{s.num}</p>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── VALUE PROPOSITION ── */}
      <div className="bg-brand-dark rounded-[3rem] p-10">
        <span className="inline-block bg-white/10 text-white text-[10px] font-extrabold uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-4">
          Value Proposition
        </span>
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tighter leading-tight mb-8">
          Mengapa Memilih PharmaCamp?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { num: '01', title: 'Scientific-Based Learning', desc: 'Program berbasis ilmu farmasi & formulasi yang kuat, mengedepankan pendekatan ilmiah, bukan sekadar praktik pembuatan produk.' },
            { num: '02', title: 'Integrated Theory & Practice', desc: 'Mengintegrasikan teori formulasi, hands-on lab, serta pengenalan riset terapan yang relevan dengan dunia akademik dan industri.' },
            { num: '03', title: 'Industry-Relevant Competency', desc: 'Materi selaras kebutuhan industri kosmetik: aspek kualitas, stabilitas, dan pemahaman regulasi dasar.' },
            { num: '04', title: 'Collaborative Ecosystem', desc: 'Platform kolaboratif antara kampus, industri, dan komunitas profesional untuk pengembangan kompetensi dan jejaring.' },
            { num: '05', title: 'Flexible Implementation', desc: 'Dapat diselenggarakan online, offline, maupun hybrid — adaptif terhadap kebutuhan mitra dan peserta.' },
            { num: '06', title: 'Early Career Building', desc: 'Fondasi awal dalam Formulation Science untuk mendukung pengembangan karier akademik, riset, maupun industri.' },
          ].map((vp, i) => (
            <div key={i} className="bg-white/10 rounded-3xl p-6 hover:bg-white/15 transition-all">
              <p className="font-heading text-4xl font-extrabold text-white/10 tracking-tighter mb-2 leading-none">{vp.num}</p>
              <p className="font-heading font-extrabold text-white text-sm tracking-tight mb-2">{vp.title}</p>
              <p className="text-white/60 text-xs font-bold leading-relaxed">{vp.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROGRAM CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {pharmacampClasses.map((kelas, i) => {
          const s = getStylesByColor(colorPalette[i % colorPalette.length]);
          return (
            <div
              key={`pharmacamp-${i}`}
              className={`${s.card} rounded-[3rem] p-8 shadow-sm flex flex-col hover:shadow-xl transition-all group animate-in zoom-in-95 duration-500 ${i === 4 ? 'md:col-span-2' : ''}`}
            >
              <div className="flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 ${s.iconBg} rounded-2xl flex items-center justify-center shadow-inner`}>
                    <FaBookOpen size={24} />
                  </div>
                  {kelas.duration && (
                    <span className={`text-xs font-extrabold px-4 py-2 rounded-2xl border ${s.badge}`}>
                      ⏱ {kelas.duration}
                    </span>
                  )}
                </div>
                <h3 className={`font-heading font-bold text-2xl mb-6 tracking-tighter ${s.title}`}>
                  {kelas.title}
                </h3>
                <ul className="space-y-3 mb-8">
                  {kelas.features.map((f, idx) => (
                    <li key={`f-${idx}`} className={`flex items-start gap-3 text-sm font-bold leading-snug ${s.desc}`}>
                      <div className={`mt-1 p-1 rounded-full shrink-0 ${s.badge}`}>
                        <FaCheck size={8} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${s.footer} mt-auto rounded-[2rem] p-6 flex flex-col sm:flex-row justify-between items-center gap-4 transition-transform group-hover:scale-[1.02]`}>
                <div>
                  {kelas.pricing.length === 1 && (
                    <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Harga</p>
                  )}
                  {kelas.pricing.map((p, idx) => (
                    <div key={`p-${idx}`}>
                      {kelas.pricing.length > 1 && (
                        <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-0.5">{p.label}</p>
                      )}
                      <p className="text-base font-extrabold text-brand-dark tracking-tighter">{p.price}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleWaLink(kelas.title)}
                  className="bg-green-500 text-white px-8 py-4 rounded-2xl font-extrabold text-xs flex items-center gap-2 hover:bg-brand-dark transition-all shadow-md active:scale-95 whitespace-nowrap"
                >
                  <FaWhatsapp size={16} /> Daftar via WA
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MINI LAB ── */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <span className="inline-block bg-brand-pink/10 text-brand-pink text-[10px] font-extrabold uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-4">
              Lokasi
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-brand-dark tracking-tighter leading-tight mb-3">
              Mini Lab Offline
            </h2>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand-pink rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
                </svg>
              </div>
              <div>
                <p className="text-brand-dark font-extrabold text-sm leading-relaxed">
                  Jl. Jawa No. 3 Kavling Anturium RT 14/RW 03.
                </p>
                <p className="text-brand-dark font-extrabold text-sm leading-relaxed">
                  Kel. Tirtajaya, Kec. Sukmajaya
                </p>
                <p className="text-brand-pink font-extrabold text-sm">Depok, Jawa Barat</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.open('https://maps.google.com/?q=Jl.+Jawa+No.3+Kavling+Anturium+Sukmajaya+Depok', '_blank')}
            className="bg-brand-pink text-white px-6 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 hover:bg-brand-dark transition-all shadow-md active:scale-95 shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
            </svg>
            Buka di Google Maps
          </button>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          {labPhotos.map((photo, i) => (
            <div key={i} className="group relative overflow-hidden rounded-3xl aspect-square bg-brand-cream">
              <img
                src={photo.src}
                alt={photo.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Label overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-xs font-extrabold leading-snug">{photo.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
})()}
      </div>
    </div>
  );
}

// --- EXPORT PAGE ---
export default function ProgramsPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-brand-dark">Memuat...</div>}>
        <InnerProgramsPage />
      </Suspense>
      <Footer />
    </main>
  );
}

function InnerProgramsPage() {
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('cat'); 
    return <ProgramsContent key={categoryFilter} categoryFilter={categoryFilter} />;
}