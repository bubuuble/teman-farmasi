import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GalleryGrid from './GalleryGrid';
import { getAllGalleryItems } from '@/lib/sanity-queries';
import PageWithSpinner from '../components/PageWithSpinner';
import { FaInstagram, FaHeart } from 'react-icons/fa';

export const revalidate = 60;

export default async function GalleryPage() {
  return (
    <PageWithSpinner>
      <GalleryContent />
    </PageWithSpinner>
  );
}

async function GalleryContent() {
  const galleryItems = await getAllGalleryItems();

  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Instagram Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-6 border border-brand-pink/20 shadow-sm">
            <FaInstagram className="text-pink-600" />
            <span className="font-bold text-sm text-brand-dark">@temanfarmasi</span>
          </div>

          <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-brand-dark mb-6 leading-tight tracking-tighter">
            Gallery <span className="text-brand-pink underline decoration-brand-yellow/50 underline-offset-8">Farmasi</span>
          </h1>
          
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            Lihat keseruan aktivitas, pencapaian mahasiswa, dan momen berharga 
            di Teman Farmasi melalui galeri Instagram kami
          </p>

          {/* Follow Button */}
          <a
            href="https://www.instagram.com/temanfarmasi/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-brand-pink text-white px-8 py-4 rounded-[2rem] font-extrabold hover:bg-brand-darkblue transition-all duration-300 hover:scale-105 shadow-lg group active:scale-95"
          >
            <FaInstagram size={24} />
            Follow @temanfarmasi
            <FaHeart className="group-hover:scale-125 transition-transform" />
          </a>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 mt-16 pt-12 border-t border-gray-200">
            <div className="text-center">
              <div className="font-heading text-4xl md:text-5xl font-bold text-brand-pink mb-2">
                {galleryItems.length}+
              </div>
              <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-heading text-4xl md:text-5xl font-bold text-brand-pink mb-2">
                500+
              </div>
              <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Students Featured</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid Section */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <GalleryGrid items={galleryItems} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-brand-cream">
        <div className="max-w-5xl mx-auto bg-brand-pink rounded-[4rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-12">
          <div className="relative z-10 flex-1 text-center md:text-left">
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/10">
              Instagram Gallery
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-tighter leading-tight">
              Ingin Cerita Sukses <br/>Anda <span className="text-brand-yellow">Ditampilkan?</span>
            </h2>
            <p className="text-white/80 text-lg font-bold mb-10 leading-relaxed">
              Tag kami di Instagram dan gunakan hashtag #TemanFarmasi untuk kesempatan 
              ditampilkan di galeri kami!
            </p>
            <a
              href="https://www.instagram.com/temanfarmasi/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 bg-white text-brand-dark px-12 py-5 rounded-[2rem] font-extrabold text-xl hover:bg-brand-darkblue hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 transform"
            >
              <FaInstagram size={28} className="text-pink-600" /> 
              Kunjungi Instagram
            </a>
          </div>
          
          {/* Visual Decoration */}
          <div className="relative shrink-0 hidden md:block">
            <div className="w-64 h-64 bg-white/10 rounded-[4rem] rotate-12 flex items-center justify-center border border-white/20 shadow-inner">
              <FaInstagram size={140} className="opacity-20 text-white" />
            </div>
            <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-brand-yellow/20 rounded-full blur-2xl"></div>
          </div>
          
          <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
