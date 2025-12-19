'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signOutAction } from '../(auth)/action';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // Fungsi aman untuk fetch Role
    const fetchRole = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (error || !data) return 'student'; // Default fallback
        return data.role;
      } catch {
        return 'student';
      }
    };

    const initAuth = async () => {
      try {
        // 1. Ambil Session User
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          setUser(session.user);
          // 2. Ambil Role
          const role = await fetchRole(session.user.id);
          if (isMounted) setUserRole(role);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        // 3. Matikan Loading (Wajib Jalan)
        if (isMounted) setIsLoading(false);
      }
    };

    // Jalankan Init
    initAuth();

    // Listener Realtime
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        // Fetch role ulang saat login/register sukses
        const role = await fetchRole(session.user.id);
        if (isMounted) setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
      
      // Pastikan loading mati setiap kali status auth berubah
      if (isMounted) setIsLoading(false);
    });

    // Timeout Pengaman (Safety Net)
    // Jika dalam 500ms DB tidak respon, paksa loading mati agar UI muncul
    const safetyTimer = setTimeout(() => {
      if (isMounted && isLoading) setIsLoading(false);
    }, 100);

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }); // Hapus dependency isLoading agar tidak loop

  const handleLogout = async () => {
    // Set loading agar UI responsif (opsional, tapi bagus buat UX)
    setIsLoading(true);
    
    // Panggil Server Action
    await signOutAction();
    
    // Reset state lokal (sebenarnya akan otomatis ke-reset karena redirect)
    setUser(null);
    setUserRole(null);
  };

  const getDashboardLink = () => {
    if (!userRole) return '/student/dashboard';
    switch (userRole) {
      case 'admin': return '/admin/dashboard';
      case 'mentor': return '/mentor/dashboard';
      default: return '/student/dashboard';
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-cream/90 backdrop-blur-sm pt-6 pb-4 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* 1. Logo */}
        <Link href="/" className="flex items-center gap-2">
            <Image
            src="/images/logos/logo_5.png"
            alt="Teman Farmasi"
            width={120}
            height={40}
            priority
            className="object-contain"
            />
        </Link>

        {/* 2. Search Bar (Desktop) */}
        <div className="hidden lg:flex items-center bg-white px-4 py-3 rounded-full border-2 border-transparent focus-within:border-brand-yellow transition-all w-96 shadow-sm">
            <FaSearch className="text-brand-pink mr-3" />
            <input 
                type="text" 
                placeholder="Cari track riset..." 
                className="bg-transparent outline-none text-sm w-full placeholder-gray-400 text-brand-dark"
            />
        </div>

        {/* 3. Links & Button (Desktop) */}
        <div className="hidden lg:flex items-center gap-8 font-bold text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-pink transition">Beranda</Link>
          <Link href="/about" className="hover:text-brand-pink transition">Tentang</Link>
          <Link href="/programs" className="hover:text-brand-pink transition">Program</Link>
          <Link href="/mentors" className="hover:text-brand-pink transition">Mentor</Link>
          <Link href="/testimonials" className="hover:text-brand-pink transition">Testimonial</Link>
          <Link href="/blog" className="hover:text-brand-pink transition">Blog</Link>
          
          {/* LOGIC BUTTON */}
          {isLoading ? (
            // Skeleton Loader yang ukurannya pas dengan tombol
            <div className="h-[44px] w-[120px] bg-gray-200 animate-pulse rounded-full"></div>
          ) : (
            user ? (
              <div className="flex items-center gap-3">
                <Link href={getDashboardLink()}>
                  <button className="bg-brand-pink text-white px-6 py-3 rounded-full font-bold hover:bg-brand-yellow hover:text-brand-dark transition-all shadow-lg shadow-brand-pink/30">
                    Dashboard
                  </button>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-brand-purple hover:text-brand-dark transition-colors px-2"
                >
                  <span className="text-xs font-bold uppercase">Logout</span>
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="bg-brand-pink text-white px-8 py-3 rounded-full font-bold hover:bg-brand-yellow hover:text-brand-dark transition-all shadow-lg shadow-brand-pink/30">
                  Masuk
                </button>
              </Link>
            )
          )}
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
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 shadow-xl flex flex-col gap-4 text-center z-40">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-pink transition">Beranda</Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-pink transition">Tentang</Link>
            <Link href="/programs" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-pink transition">Program</Link>
            <Link href="/mentors" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-pink transition">Mentor</Link>
            
            {!isLoading && (
              user ? (
                <div className="flex flex-col gap-3 w-full mt-4">
                  <Link href={getDashboardLink()} onClick={() => setIsMenuOpen(false)} className="w-full">
                    <button className="w-full bg-brand-pink text-white px-6 py-3 rounded-full font-bold hover:bg-brand-yellow hover:text-brand-dark transition-all">
                      Dashboard
                    </button>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-brand-purple text-white px-6 py-3 rounded-full font-bold hover:bg-brand-dark transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-4">
                  <button className="w-full bg-brand-pink text-white px-6 py-3 rounded-full font-bold hover:bg-brand-yellow hover:text-brand-dark transition-all">
                    Masuk
                  </button>
                </Link>
              )
            )}
        </div>
      )}
    </nav>
  );
}