import Image from 'next/image';
import { FaStar, FaUserGraduate, FaFlask, FaCheckCircle } from 'react-icons/fa';

export default function Hero() {
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

            <h1 className="font-heading font-extrabold text-brand-dark text-5xl sm:text-6xl lg:text-[5.5rem] leading-[1.05] mb-8 tracking-tight">
              Private <br />
              Coaching <br />
              for <br />
              <span className="text-brand-pink relative inline-block">
                Pharmacy
                {/* Underline Squiggle */}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-yellow" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span> <br />
              Research
            </h1>
            
            <p className="text-gray-500 text-lg mb-10 leading-relaxed max-w-md font-medium">
              Bridging the gap between academic theory and practical research skills. We help you succeed in your thesis and publications.
            </p>
            
            {/* Input Field */}
            <div className="flex items-center bg-white p-2 pl-3 rounded-full shadow-xl shadow-brand-pink/10 max-w-md mb-8 border border-gray-100 focus-within:border-brand-pink transition-all">
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-600 placeholder-gray-400 text-base"
                />
                <button className="bg-brand-pink text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-brand-dark transition-all whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Start Now
                </button>
            </div>
            
            <div className="flex items-center gap-2 pl-2">
                <FaCheckCircle className="text-brand-teal" />
                <p className="text-[11px] text-gray-400 font-bold tracking-wide uppercase">
                    Largest Pharmacy Research Community in Indonesia
                </p>
            </div>
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
                        src="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=2070&auto=format&fit=crop" 
                        alt="Pharmacy Student" 
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* 4. Floating Elements */}
                
                {/* Top Right Badge: Success Rate */}
                <div className="absolute top-10 -right-4 z-20 bg-brand-blue p-4 rounded-2xl shadow-xl shadow-brand-blue/30 border-l-4 border-white flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="bg-white/20 p-2.5 rounded-full text-white">
                        <FaStar size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-brand-dark text-xl leading-none">98.5%</h3>
                        <p className="text-[10px] font-bold text-brand-dark/80 uppercase mt-1">Success Rate</p>
                    </div>
                </div>

                {/* Bottom Left Badge: Student Rating */}
                <div className="absolute bottom-16 -left-6 z-20 bg-brand-yellow p-4 rounded-2xl shadow-xl shadow-brand-yellow/30 border-l-4 border-white flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-full text-white">
                        <FaUserGraduate size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-brand-dark text-xl leading-none">5.0/5.0</h3>
                        <p className="text-[10px] font-bold text-brand-dark/80 uppercase mt-1">Student Rating</p>
                    </div>
                </div>

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