import Link from 'next/link';
import Image from 'next/image';
import { FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-brand-cream pt-20 pb-10 border-t border-brand-pink/10">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                
                {/* Brand */}
                <div className="col-span-1 md:col-span-1">
                    <div className="font-heading font-extrabold text-2xl text-brand-dark mb-4 tracking-tight flex items-center gap-2">
                         <Image src="/images/logos/logo_5.png" alt="Teman Farmasi" width={100} height={40} className="object-contain"/>
                    </div>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        PT. Generasi Farma Kreatif.<br/>
                        Platform bimbingan riset farmasi terbesar di Indonesia.
                    </p>
                    <div className="flex gap-3">
                        <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-dark hover:bg-brand-pink hover:text-white transition-all shadow-sm">
                            <FaInstagram />
                        </a>
                         <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-dark hover:bg-brand-blue hover:text-white transition-all shadow-sm">
                            <FaTwitter />
                        </a>
                         <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-dark hover:bg-brand-yellow hover:text-brand-dark transition-all shadow-sm">
                            <FaLinkedinIn />
                        </a>
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h3 className="font-bold text-brand-dark mb-4">Program</h3>
                    <ul className="space-y-3 text-gray-500 text-sm">
                        <li><Link href="#" className="hover:text-brand-pink transition-colors">Farmasi Klinis</Link></li>
                        <li><Link href="#" className="hover:text-brand-pink transition-colors">Teknologi Farmasi</Link></li>
                        <li><Link href="#" className="hover:text-brand-pink transition-colors">Farmasi Sosial</Link></li>
                        <li><Link href="#" className="hover:text-brand-pink transition-colors">Publikasi</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold text-brand-dark mb-4">Perusahaan</h3>
                    <ul className="space-y-3 text-gray-500 text-sm">
                        <li><Link href="/about" className="hover:text-brand-pink transition-colors">Tentang Kami</Link></li>
                        <li><Link href="/" className="hover:text-brand-pink transition-colors">Kampus Mitra</Link></li>
                        <li><Link href="/mentors" className="hover:text-brand-pink transition-colors">Mentor</Link></li>
                        <li><Link href="/contact" className="hover:text-brand-pink transition-colors">Kontak</Link></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 className="font-bold text-brand-dark mb-4">Tetap Terhubung</h3>
                    <div className="flex flex-col gap-3">
                        <input 
                            type="email" 
                            placeholder="Masukkan email Anda" 
                            className="px-4 py-3 rounded-full bg-white border-2 border-transparent text-sm outline-none focus:border-brand-pink transition-colors"
                        />
                        <button className="bg-brand-pink text-white font-bold py-3 rounded-full hover:bg-brand-yellow hover:text-brand-dark transition-all shadow-lg">
                            Berlangganan
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-brand-pink/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                <p>© 2024 PT. Generasi Farma Kreatif. Hak cipta dilindungi.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <Link href="#" className="hover:text-brand-dark">Kebijakan Privasi</Link>
                    <Link href="#" className="hover:text-brand-dark">Syarat Layanan</Link>
                </div>
            </div>
        </div>
    </footer>
  );
}