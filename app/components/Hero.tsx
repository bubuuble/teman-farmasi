import Image from 'next/image';
import { FaStar, FaUserGraduate, FaFlask, FaCheckCircle } from 'react-icons/fa';
import { urlFor } from '@/lib/sanity';

interface HeroContent {
  title?: string;
  titleLine2?: string;
  highlightedText?: string;
  titleLine3?: string;
  description?: string;
  ctaText?: string;
  emailPlaceholder?: string;
  mainImage?: {
    asset: {
      _ref: string;
    };
  };
  secondaryImage?: {
    asset: {
      _ref: string;
    };
  };
  successRate?: string;
  studentRating?: string;
  footerNote?: string;
}

interface HeroProps {
  content?: HeroContent;
}

// Default fallback content
const defaultContent: HeroContent = {
  title: 'Bimbingan',
  titleLine2: 'Privat untuk',
  highlightedText: 'Riset',
  titleLine3: 'Farmasi',
  description: 'Menjembatani kesenjangan antara teori akademis dan keterampilan riset praktis. Kami membantu Anda sukses dalam skripsi dan publikasi.',
  ctaText: 'Mulai Sekarang',
  emailPlaceholder: 'Masukkan email Anda',
  successRate: '98.5%',
  studentRating: '5.0/5.0',
  footerNote: 'Komunitas Riset Farmasi Terbesar di Indonesia',
};

export default function Hero({ content }: HeroProps) {
  const heroData = { ...defaultContent, ...content };
  const mainImageUrl = heroData.mainImage ? urlFor(heroData.mainImage).width(800).height(1000).url() : '/images/image_1.jpg';

  return (
    <section className="relative pt-28 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-brand-cream">
      
      {/* Background Decorative Blur (Subtle) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-pink/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* --- LEFT: Text Content --- */}
          <div className="relative order-2 lg:order-1 pt-8 lg:pt-0">
            
            {/* 4-Point Star Decoration */}
            <div className="absolute -top-16 -left-8 text-brand-yellow opacity-100 animate-spin-slow">
                <svg width="60" height="60" viewBox="0 0 50 50" fill="currentColor">
                    <path d="M25 0L28 22L50 25L28 28L25 50L22 28L0 25L22 22L25 0Z" />
                </svg>
            </div>

            <h1 className="font-heading font-extrabold text-brand-darkblue text-5xl sm:text-6xl lg:text-[5.5rem] leading-[1.05] mb-8 tracking-tight">
              {heroData.title} <br />
              {heroData.titleLine2 && <>{heroData.titleLine2} <br /></>}
              <span className="text-brand-pink relative inline-block pb-3">
                {heroData.highlightedText}
                {/* Artistic Brush Stroke */}
                <svg className="absolute w-[105%] h-5 -bottom-1 -left-[2%] text-brand-yellow" viewBox="0 0 300 20" preserveAspectRatio="none">
                    {/* Main thick brush stroke */}
                    <path d="M5 10 Q 30 8, 50 11 Q 80 14, 120 9 Q 160 7, 200 12 Q 240 10, 280 11 L 285 13 Q 260 15, 220 13 Q 180 11, 140 14 Q 100 16, 60 13 Q 30 12, 8 14 Z" fill="currentColor" opacity="0.85" />
                    {/* Top edge texture */}
                    <path d="M10 8 Q 40 6, 70 9 Q 110 7, 150 8 Q 190 6, 230 9 Q 260 7, 290 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
                    {/* Paint splatters */}
                    <circle cx="25" cy="5" r="1.5" fill="currentColor" opacity="0.7" />
                    <circle cx="85" cy="4" r="1" fill="currentColor" opacity="0.6" />
                    <circle cx="145" cy="6" r="1.2" fill="currentColor" opacity="0.65" />
                    <circle cx="205" cy="5" r="0.8" fill="currentColor" opacity="0.5" />
                    <circle cx="265" cy="4" r="1.3" fill="currentColor" opacity="0.7" />
                    {/* Bottom texture streaks */}
                    <path d="M40 15 L 42 18 M 95 16 L 97 19 M 155 15 L 157 18 M 220 16 L 222 19" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
                </svg>
              </span> <br />
              {heroData.titleLine3}
            </h1>
            
            <p className="text-gray-500 text-lg mb-10 leading-relaxed max-w-md font-medium">
              {heroData.description}
            </p>
            
            {/* Input Field */}
            <div className="flex items-center bg-white p-2 pl-3 rounded-full shadow-xl shadow-brand-pink/10 max-w-md mb-8 border border-gray-100 focus-within:border-brand-pink transition-all">
                <input 
                    type="email" 
                    placeholder={heroData.emailPlaceholder} 
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-600 placeholder-gray-400 text-base"
                />
                <button className="bg-brand-pink text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-brand-dark transition-all whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    {heroData.ctaText}
                </button>
            </div>
            
            {heroData.footerNote && (
              <div className="flex items-center gap-2 pl-2">
                  <FaCheckCircle className="text-brand-teal" />
                  <p className="text-[11px] text-gray-400 font-bold tracking-wide uppercase">
                      {heroData.footerNote}
                  </p>
              </div>
            )}
          </div>

          {/* --- RIGHT: New Design Layout --- */}
          <div className="relative order-1 lg:order-2 h-[500px] lg:h-[650px] w-full flex items-center justify-center">
             
             <div className="relative w-full max-w-[500px] aspect-square">
                
                {/* 1. Back Layer: Yellow Circle */}
                <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-brand-yellow rounded-full -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>

                {/* 2. Middle Layer: Pink Rounded Square (Rotated) */}
                <div className="absolute bottom-10 left-4 w-[300px] h-[300px] bg-brand-pink rounded-[3rem] -rotate-12 -z-10 opacity-80"></div>

                {/* 3. Main Image Container (Squircle Shape) */}
                <div className="absolute inset-4 z-10 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-white transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Image 
                        src={mainImageUrl}
                        alt="Pharmacy Student" 
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* 4. Floating Elements */}
                
                {/* Top Right Badge: Success Rate */}
                {heroData.successRate && (
                  <div className="absolute top-10 -right-4 z-20 bg-brand-blue p-4 rounded-2xl shadow-xl shadow-brand-blue/30 border-l-4 border-white flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                      <div className="bg-white/20 p-2.5 rounded-full text-white">
                          <FaStar size={16} />
                      </div>
                      <div>
                          <h3 className="font-bold text-brand-dark text-xl leading-none">{heroData.successRate}</h3>
                          <p className="text-[10px] font-bold text-brand-dark/80 uppercase mt-1">Tingkat Keberhasilan</p>
                      </div>
                  </div>
                )}

                {/* Bottom Left Badge: Student Rating */}
                {heroData.studentRating && (
                  <div className="absolute bottom-16 -left-6 z-20 bg-brand-yellow p-4 rounded-2xl shadow-xl shadow-brand-yellow/30 border-l-4 border-white flex items-center gap-3">
                      <div className="bg-white/20 p-2.5 rounded-full text-white">
                          <FaUserGraduate size={16} />
                      </div>
                      <div>
                          <h3 className="font-bold text-brand-dark text-xl leading-none">{heroData.studentRating}</h3>
                          <p className="text-[10px] font-bold text-brand-dark/80 uppercase mt-1">Rating Mahasiswa</p>
                      </div>
                  </div>
                )}

                {/* Decorative Icon: Beaker */}
                <div className="absolute -bottom-8 right-10 z-20 bg-brand-pink text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform rotate-12 hover:rotate-45 transition-transform duration-300">
                    <FaFlask />
                </div>

             </div>
          </div>

        </div>
      </div>
    </section>
  );
}