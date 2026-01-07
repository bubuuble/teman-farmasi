'use client';

import { FaBook, FaDownload } from "react-icons/fa";

interface CTASectionProps {
  ebooksCount: number;
  categoriesCount: number;
}

export default function CTASection({ ebooksCount, categoriesCount }: CTASectionProps) {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto mb-16">
      <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border-4 border-brand-yellow">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-yellow/20 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-brand-pink/10 px-4 py-2 rounded-full mb-4">
                <span className="text-2xl">🎉</span>
                <span className="text-brand-pink font-bold text-sm uppercase">100% Gratis</span>
              </div>
              
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-dark mb-4 leading-tight">
                Tingkatkan Pengetahuan <br />
                <span className="text-brand-pink">Tanpa Biaya!</span>
              </h2>
              
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Akses seluruh koleksi e-book kami kapan saja, di mana saja. 
                Tidak ada biaya tersembunyi, tidak perlu registrasi ribet. 
                Cukup klik dan download!
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-brand-dark">
                  <div className="bg-brand-yellow rounded-full p-2">
                    <FaBook className="text-brand-dark text-lg" />
                  </div>
                  <span className="font-semibold">PDF Berkualitas</span>
                </div>
                <div className="flex items-center gap-2 text-brand-dark">
                  <div className="bg-brand-yellow rounded-full p-2">
                    <FaDownload className="text-brand-dark text-lg" />
                  </div>
                  <span className="font-semibold">Download Langsung</span>
                </div>
              </div>

              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-brand-pink text-white font-bold py-4 px-8 rounded-full hover:bg-brand-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-3 group"
              >
                <span>Mulai Download Sekarang</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* Right Side - Stats Cards */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-brand-pink to-pink-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-5xl font-bold mb-2">{ebooksCount}+</div>
                <div className="text-white/90 text-lg font-medium">E-Book Siap Download</div>
                <div className="text-white/70 text-sm mt-2">Update berkala setiap bulan</div>
              </div>
              
              <div className="bg-gradient-to-br from-brand-yellow to-yellow-500 rounded-2xl p-6 text-brand-dark shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-5xl font-bold mb-2">{categoriesCount}</div>
                <div className="text-brand-dark/90 text-lg font-medium">Kategori Beragam</div>
                <div className="text-brand-dark/70 text-sm mt-2">Dari basic sampai advanced</div>
              </div>
              
              <div className="bg-gradient-to-br from-brand-dark to-gray-800 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-5xl font-bold mb-2">∞</div>
                <div className="text-white/90 text-lg font-medium">Akses Selamanya</div>
                <div className="text-white/70 text-sm mt-2">Download kapan saja tanpa batas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
