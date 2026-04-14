'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import LoadingSpinner from "@/app/components/LoadingSpinner";

// Optimasi Ikon (Satu per satu)
import { FaWhatsapp, FaCheck, FaBookOpen, FaLayerGroup, FaStar } from "react-icons/fa6";
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
  const [programData, setProgramData] = useState<Program | null>(null);
  const [loading, setLoading] = useState(!!categoryFilter);

  const WA_NUMBER = "628895587621"; 

  useEffect(() => {
    if (!categoryFilter) return;
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
        {programData.category === 'pharmacamp' && (
          <div className="col-span-full">
            <div className="bg-brand-pink rounded-[3rem] p-10 shadow-sm hover:shadow-xl transition-all group animate-in zoom-in-95 duration-500">
              <div className="flex flex-col lg:flex-row gap-10">
                {/* Left Content */}
                <div className="flex-1">
                  <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                    <FaBookOpen size={24} />
                  </div>
                  <h3 className="font-heading font-bold text-3xl mb-4 text-white tracking-tighter leading-tight">
                    Pharmacamp
                  </h3>
                  <p className="text-white/80 font-bold text-sm mb-6">
                    Formulation Cosmetics Class - Kelas praktis tentang formulasi kosmetik dan science of beauty.
                  </p>
                  <div className="inline-block bg-white/20 text-white px-6 py-3 rounded-2xl font-extrabold text-lg mb-8">
                    Harga Variatif
                  </div>
                </div>

                {/* Right Content - Benefits */}
                <div className="flex-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6 text-white opacity-60">Benefit:</p>
                  <ul className="space-y-4">
                    {programData.benefits?.map((b, idx) => (
                      <li key={`benefit-${idx}`} className="flex items-start gap-4 text-[14px] font-bold leading-snug text-white/90">
                        <div className="mt-0.5 p-1 rounded-full shrink-0 bg-white/20 text-white border border-white/20">
                          <FaCheck size={10} />
                        </div>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-white shadow-lg border border-gray-100 mt-8 rounded-[2rem] p-6 flex flex-col sm:flex-row justify-between items-center gap-4 transition-transform group-hover:scale-[1.02]">
                <p className="text-brand-dark font-bold text-sm text-center sm:text-left">
                  Pilih kelas webinar sesuai minatmu dan tingkatkan insight tentang dunia farmasi!
                </p>
                <button 
                  onClick={() => handleWaLink('Pharmacamp')}
                  className="bg-green-500 text-white px-8 py-4 rounded-2xl font-extrabold text-xs flex items-center gap-2 hover:bg-brand-dark transition-all shadow-md active:scale-95 whitespace-nowrap"
                >
                  <FaWhatsapp size={16}/> Lihat Kelas Tersedia
                </button>
              </div>
            </div>
          </div>
        )}
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