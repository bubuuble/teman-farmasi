import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6 text-center">
      
      {/* 404 Graphic Area */}
      <div className="relative mb-8">
        <div className="absolute top-0 -left-10 text-brand-pink opacity-50 text-9xl font-bold animate-bounce" style={{ animationDuration: '3s' }}>?</div>
        <div className="absolute bottom-0 -right-10 text-brand-blue opacity-50 text-9xl font-bold animate-bounce" style={{ animationDuration: '4s' }}>?</div>
        
        <h1 className="font-heading text-[10rem] leading-none font-extrabold text-brand-dark">
          404
        </h1>
      </div>

      <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-4">
        Oops! Halaman Tidak Ditemukan
      </h2>
      
      <p className="text-gray-500 text-lg max-w-md mb-10">
        Sepertinya topik riset yang Anda cari belum ditemukan.
      </p>

      <Link 
        href="/"
        className="inline-flex items-center gap-2 bg-brand-dark text-white px-8 py-4 rounded-full font-bold hover:bg-brand-pink hover:text-brand-dark transition-all shadow-lg"
      >
        <FaHome /> Kembali ke Beranda
      </Link>
      
    </div>
  );
}