'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-cream/90 backdrop-blur-sm pt-6 pb-4 transition-all">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* 1. Logo */}
        <Link href="/" className="flex items-center gap-2">
            <Image
            src="/images/logos/logo_5.png"
            alt="Teman Farmasi"
            width={120}
            height={120}
            priority
            />
        </Link>

        {/* 2. Search Bar */}
        <div className="hidden lg:flex items-center bg-white px-4 py-3 rounded-full border-2 border-transparent focus-within:border-brand-yellow transition-all w-96 shadow-sm">
            <FaSearch className="text-brand-pink mr-3" />
            <input 
                type="text" 
                placeholder="Cari track riset..." 
                className="bg-transparent outline-none text-sm w-full placeholder-gray-400 text-brand-dark"
            />
        </div>

        {/* 3. Links & Button */}
        <div className="hidden lg:flex items-center gap-8 font-bold text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-pink transition">Beranda</Link>
          <Link href="/about" className="hover:text-brand-pink transition">Tentang</Link>
          <Link href="/programs" className="hover:text-brand-pink transition">Program</Link>
          <Link href="/mentors" className="hover:text-brand-pink transition">Mentor</Link>
          <Link href="/testimonials" className="hover:text-brand-pink transition">Testimoni</Link>
          <Link href="/blog" className="hover:text-brand-pink transition">Blog</Link>
          
          
          {/* Button: Vibrant Pink */}
          <button className="bg-brand-pink text-white px-8 py-3 rounded-full font-bold hover:bg-brand-yellow hover:text-brand-dark transition-all shadow-lg shadow-brand-pink/30">
             Masuk
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-brand-dark"
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 shadow-xl">
             <div className="flex flex-col gap-4 text-center">
                <Link href="/programs" className="font-bold text-gray-600">Program</Link>
                <Link href="/mentors" className="font-bold text-gray-600">Mentor</Link>
                <button className="bg-brand-pink text-white px-6 py-3 rounded-full font-bold">Masuk</button>
             </div>
        </div>
      )}
    </nav>
  );
}