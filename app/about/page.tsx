// app/about/page.tsx
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import { FaMicroscope, FaBrain, FaGraduationCap, FaCheck, FaUsers, FaUserTie } from "react-icons/fa";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-cream selection:bg-brand-pink selection:text-white overflow-hidden">
      <Navbar />
      
      {/* 1. ARTISTIC HERO SECTION */}
      <section className="relative pt-44 pb-24 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-pink/5 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-pink/20 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
             <span className="w-2 h-2 bg-brand-pink rounded-full animate-pulse"></span>
             <span className="text-[10px] font-extrabold text-brand-dark uppercase tracking-[0.2em]">Kisah Teman Farmasi</span>
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl font-extrabold text-brand-darkblue mb-8 tracking-tight leading-[1.05]">
            Membangun Jembatan Menuju <br />
            <span className="relative inline-block text-brand-pink">
               Riset Berkualitas
               <svg className="absolute w-[110%] h-4 -bottom-1 -left-[5%] text-brand-yellow" viewBox="0 0 300 20" preserveAspectRatio="none">
                  <path d="M5 10 Q 30 8, 50 11 Q 80 14, 120 9 Q 160 7, 200 12 Q 240 10, 280 11" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
               </svg>
            </span>
          </h1>
          
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-medium opacity-80">
            Berawal dari kepedulian terhadap tantangan akademik di Indonesia, kami hadir sebagai ruang kolaboratif yang menghubungkan ilmu pengetahuan dengan praktek riset nyata.
          </p>
        </div>
      </section>

      {/* 2. STATS SECTION (Floating Cards) */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Mahasiswa Aktif", val: "2,000+", color: "bg-brand-blue" },
            { label: "Tingkat Kelulusan", val: "98.5%", color: "bg-brand-pink" },
            { label: "Mitra Kampus", val: "167+", color: "bg-brand-yellow" },
            { label: "Mentor Ahli", val: "50+", color: "bg-brand-darkblue" }
          ].map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300">
              <h3 className={`text-4xl font-extrabold font-heading mb-2 ${i === 3 ? 'text-white' : 'text-brand-dark'} ${i === 3 ? s.color : ''} ${i === 3 ? 'px-4 py-1 rounded-xl' : ''}`}>
                {s.val}
              </h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CHALLENGES & VISION (Bento Style) */}
      <section className="py-24 bg-white rounded-[4rem] lg:rounded-[6rem] shadow-inner-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Big Card */}
            <div className="lg:col-span-7 bg-brand-cream rounded-[3.5rem] p-10 lg:p-16 relative overflow-hidden flex flex-col justify-center border border-brand-yellow/30">
               <div className="relative z-10">
                 <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-dark mb-8 leading-tight">
                    Tantangan yang Kami <br /> <span className="text-brand-blue">Selesaikan Bersama.</span>
                 </h2>
                 <p className="text-gray-600 text-lg mb-10 font-medium leading-relaxed max-w-md">
                    Mahasiswa farmasi seringkali terhambat bukan karena kurangnya materi, melainkan kurangnya akses pendampingan yang intensif dan terarah.
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["Ketelitian Ilmiah", "Penyusunan Karya Tulis", "Akses Jurnal Internasional", "Simulasi Sidang"].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm">
                         <div className="bg-brand-pink text-white p-1 rounded-full"><FaCheck size={8} /></div>
                         <span className="text-sm font-bold text-brand-dark">{item}</span>
                      </div>
                    ))}
                 </div>
               </div>
               <div className="absolute right-[-10%] bottom-[-10%] opacity-10 rotate-12 -z-0">
                  <FaMicroscope size={300} />
               </div>
            </div>

            {/* Right Stacked Cards */}
            <div className="lg:col-span-5 flex flex-col gap-8">
               <div className="bg-brand-pink rounded-[3rem] p-10 text-white flex-1 relative overflow-hidden group">
                  <FaBrain className="absolute top-10 right-10 opacity-20 group-hover:scale-125 transition-transform duration-700" size={120} />
                  <h3 className="text-3xl font-bold mb-4 relative z-10">Berpikir Kritis</h3>
                  <p className="text-white/80 font-medium relative z-10">Kami melatih mahasiswa untuk tidak sekadar menghafal, tapi memahami logika multidisplin ilmu farmasi.</p>
               </div>
               <div className="bg-brand-yellow rounded-[3rem] p-10 text-brand-dark flex-1 border border-brand-yellow/50">
                  <FaGraduationCap className="mb-6 text-brand-pink" size={40} />
                  <h3 className="text-3xl font-bold mb-2">Akses Terarah</h3>
                  <p className="text-brand-dark/70 font-bold text-sm">Pendampingan personal yang aplikatif dan mudah diakses kapanpun.</p>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. COLLABORATION (Visual Focus) */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <div className="relative order-2 lg:order-1">
             <div className="absolute -right-10 -bottom-10 w-[80%] h-[80%] bg-brand-pink rounded-full -z-10 blur-3xl opacity-20"></div>
             <div className="relative w-full max-w-[500px] aspect-square mx-auto">
                {/* Visual Frame */}
                <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-brand-yellow rounded-[4rem] -z-10 rotate-6"></div>
                <div className="absolute inset-4 rounded-[4rem] overflow-hidden border-8 border-white shadow-2xl bg-white transform -rotate-3 hover:rotate-0 transition-transform duration-700">
                    <Image 
                      src="https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=2070&auto=format&fit=crop" 
                      alt="Pharmacy Lab Research" 
                      fill 
                      className="object-cover"
                    />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 animate-float">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">50+</div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kolaborasi <br /> Mentor Ahli</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-brand-darkblue leading-[1.1]">
              Ruang <span className="text-brand-pink">Kolaborasi</span> Lintas Disiplin.
            </h2>
            <p className="text-gray-500 text-lg font-medium leading-relaxed">
               Teman Farmasi bukan sekadar platform kursus. Kami adalah ekosistem yang menghubungkan mahasiswa, dosen, dan praktisi industri.
            </p>
            <div className="space-y-4">
              {[
                { t: "Mahasiswa Farmasi", i: FaUsers, d: "Bertukar ide dan pengalaman riset antar kampus." },
                { t: "Dosen & Akademisi", i: FaUserTie, d: "Bimbingan standar kompetensi karya ilmiah." }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 p-6 rounded-[2rem] bg-white border border-gray-50 hover:border-brand-blue/30 transition-all shadow-sm">
                   <div className="w-12 h-12 bg-brand-cream text-brand-dark rounded-2xl flex items-center justify-center shrink-0">
                      <item.i size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-brand-dark mb-1">{item.t}</h4>
                      <p className="text-sm text-gray-400 font-medium">{item.d}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL COMMITMENT (Gradient CTA) */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto bg-brand-darkblue rounded-[4rem] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl">
          {/* Background Textures */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/10 rounded-full blur-[100px] -z-0"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-[80px] -z-0"></div>
          
          <div className="relative z-10">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-brand-yellow mb-8 leading-tight">
              Mencetak Generasi Farmasis <br /> Kompeten & Berdaya Saing.
            </h2>
            <p className="text-white/70 text-lg mb-12 max-w-2xl mx-auto font-medium">
              Komitmen kami adalah menjadi mitra terbaik dalam perjalanan riset dan kesuksesan akademik Anda di dunia farmasi.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Kelas Privat", "Webinar", "Publikasi", "Monitoring Riset"].map((tag, i) => (
                <span key={i} className="px-6 py-2 rounded-full border border-white/20 bg-white/5 text-white text-xs font-bold uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}