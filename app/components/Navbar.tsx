'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronDown, FaBars} from 'react-icons/fa6'; // Pakai fa6 lebih ringan
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';
import { FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { title: 'PharmaCore Class', desc: 'Kelas Mata Kuliah Farmasi', href: '/programs?cat=pharmacore' },
    { title: 'Pharma Research', desc: 'Monitoring Riset & Skripsi', href: '/programs?cat=research' },
    { title: 'PharmaPublish Academy', desc: 'Publikasi Ilmiah & Jurnal', href: '/programs?cat=publish' },
    { title: 'PharmaImpact', desc: 'Program Pengabdian Masyarakat', href: '/programs?cat=impact' },
    { title: 'OBATIN Class', desc: 'Kelas Kesehatan Masyarakat', href: '/programs?cat=obatin' },
  ];

  useEffect(() => {
    const supabase = createClient();
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        setUserRole(profile?.role || 'student');
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const getDashboardLink = () => {
    if (userRole === 'admin') return '/admin/dashboard';
    if (userRole === 'mentor') return '/mentor/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className="fixed top-0 w-full z-[100] bg-brand-cream/90 backdrop-blur-md pt-6 pb-4 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image src="/images/logos/logo_5.png" alt="Logo" width={120} height={40} priority />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8 font-bold text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-pink transition">Beranda</Link>
          <Link href="/about" className="hover:text-brand-pink transition">Tentang Kami</Link>

          {/* Dropdown Program */}
          <div className="relative" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
            <button className={`flex items-center gap-1 transition ${isDropdownOpen ? 'text-brand-pink' : ''}`}>
              Program <FaChevronDown size={10} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full -left-4 pt-4 w-72">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 animate-in fade-in slide-in-from-top-2">
                  {categories.map((cat) => (
                    <Link key={cat.href} href={cat.href} className="block p-4 hover:bg-brand-cream rounded-2xl transition-colors group">
                      <p className="text-brand-dark font-bold text-sm group-hover:text-brand-pink">{cat.title}</p>
                      <p className="text-gray-400 text-[10px] font-medium">{cat.desc}</p>
                    </Link>
                  ))}
                  <div className="border-t border-gray-50 mt-2 pt-2">
                  </div>
                </div>
              </div>
            )}
          </div>


          <Link href="/mentors" className="hover:text-brand-pink transition">Mentor</Link>
          <Link href="/testimonials" className="hover:text-brand-pink transition">Testimonial</Link>
          <Link href="/gallery" className="hover:text-brand-pink transition">Gallery</Link>
          <Link href="/ebooks" className="hover:text-brand-pink transition">E-Books</Link>
          <Link href="/blog" className="hover:text-brand-pink transition">Blog</Link>
          
          {!isLoading && (
            user ? (
              <Link href={getDashboardLink()}>
                <button className="bg-brand-pink text-white px-6 py-3 rounded-full hover:bg-brand-dark transition-all shadow-lg">Dashboard</button>
              </Link>
            ) : (
              <Link href="/login">
                <button className="bg-brand-pink text-white px-8 py-3 rounded-full hover:bg-brand-dark transition-all shadow-lg">Masuk</button>
              </Link>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-brand-dark">
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white p-6 shadow-2xl flex flex-col gap-5 border-t border-gray-50">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="font-bold text-brand-dark">Beranda</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className="font-bold text-brand-dark">Tentang Kami</Link>
          <div className="space-y-3 border-y border-gray-50 py-4 text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Program Kami</p>
            {categories.map((cat) => (
              <Link key={cat.href} href={cat.href} onClick={() => setIsMenuOpen(false)} className="block font-bold text-sm text-brand-dark hover:text-brand-pink pl-2">{cat.title}</Link>
            ))}
          </div>
          <Link href="/mentors" onClick={() => setIsMenuOpen(false)} className="font-bold text-brand-dark text-left">Mentor</Link>
          <Link href="/testimonials" onClick={() => setIsMenuOpen(false)} className="font-bold text-brand-dark text-left">Testimonial</Link>
          <Link href="/gallery" onClick={() => setIsMenuOpen(false)} className="font-bold text-brand-dark text-left">Gallery</Link>
          <Link href="/ebooks" onClick={() => setIsMenuOpen(false)} className="font-bold text-brand-dark text-left">E-Books</Link>
          <Link href="/blog" onClick={() => setIsMenuOpen(false)} className="font-bold text-brand-dark text-left">Blog</Link>
          <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
            <button className="w-full bg-brand-pink text-white py-4 rounded-2xl font-bold">Akses Dashboard</button>
          </Link>
        </div>
      )}
    </nav>
  );
}