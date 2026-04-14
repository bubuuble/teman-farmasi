import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageWithSpinner from "../components/PageWithSpinner";
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

export default function ContactPage() {
  return (
    <PageWithSpinner>
      <ContactContent />
    </PageWithSpinner>
  );
}

function ContactContent() {
  return (
    <main className="min-h-screen bg-brand-cream selection:bg-brand-pink selection:text-white">
      <Navbar />
      
      {/* Header Section */}
      <div className="pt-40 pb-16 px-6 text-center max-w-4xl mx-auto">
         <span className="inline-block px-4 py-1.5 rounded-full bg-brand-pink/20 text-brand-dark font-bold text-xs mb-6 uppercase tracking-wider">
            Hubungi Kami
         </span>
         <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-brand-dark mb-6 tracking-tight">
            Kami Siap Membantu <br/>
            <span className="text-brand-pink">Kesuksesan Anda</span>
         </h1>
         <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Punya pertanyaan tentang program atau bimbingan kami? Jangan ragu untuk menghubungi. Kami selalu siap membantu perjalanan riset Anda.
         </p>
      </div>

      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            
            {/* Left Column: Contact Info Cards */}
            <div className="space-y-8">
                
                {/* WhatsApp Card (Yellow) */}
                <div className="bg-brand-yellow p-8 rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-dark text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        <FaWhatsapp />
                    </div>
                    <h3 className="font-heading font-bold text-2xl text-brand-dark mb-2">Chat via WhatsApp</h3>
                    <p className="text-brand-dark/80 mb-6">Respons tercepat untuk pertanyaan cepat tentang pendaftaran.</p>
                    <a href="https://wa.me/+628895587621" className="inline-block bg-white text-brand-dark px-6 py-3 rounded-full font-bold text-sm hover:bg-brand-dark hover:text-white transition-all shadow-md">
                        Chat Sekarang
                    </a>
                </div>

                {/* Email Card (Pink) */}
                <div className="bg-brand-pink p-8 rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-pink text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        <FaEnvelope />
                    </div>
                    <h3 className="font-heading font-bold text-2xl text-white mb-2">Dukungan Email</h3>
                    <p className="text-white/90 mb-6">Kirimkan pertanyaan detail atau proposal kemitraan.</p>
                    <a href="mailto:hello@temanfarmasi.com" className="inline-block bg-white text-brand-pink px-6 py-3 rounded-full font-bold text-sm hover:bg-brand-dark hover:text-white transition-all shadow-md">
                        temanfarmasikamu@gmail.com
                    </a>
                </div>

                {/* Office Info (Blue) */}
                <div className="bg-brand-blue p-8 rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-blue text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        <FaMapMarkerAlt />
                    </div>
                    <h3 className="font-heading font-bold text-2xl text-white mb-2">Kunjungi Kantor Kami</h3>
                    <p className="text-white/90">
                        Depok, Indonesia
                    </p>
                </div>

            </div>

            {/* Right Column: Contact Form */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl border-2 border-brand-pink/20 h-fit">
                <h3 className="font-heading font-bold text-3xl text-brand-dark mb-2">Kirim Pesan</h3>
                <p className="text-gray-500 mb-8">Isi formulir di bawah ini dan kami akan membalas dalam 24 jam.</p>
                
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-brand-dark ml-2">Nama Depan</label>
                            <input 
                                type="text" 
                                placeholder="John" 
                                className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-2 border-transparent focus:border-brand-pink focus:bg-white outline-none transition-all text-brand-dark"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-brand-dark ml-2">Nama Belakang</label>
                            <input 
                                type="text" 
                                placeholder="Doe" 
                                className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-2 border-transparent focus:border-brand-pink focus:bg-white outline-none transition-all text-brand-dark"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-brand-dark ml-2">Alamat Email</label>
                        <input 
                            type="email" 
                            placeholder="john@example.com" 
                            className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-2 border-transparent focus:border-brand-pink focus:bg-white outline-none transition-all text-brand-dark"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-brand-dark ml-2">Topik</label>
                        <select className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-2 border-transparent focus:border-brand-pink focus:bg-white outline-none transition-all text-brand-dark appearance-none">
                            <option>Pertanyaan Umum</option>
                            <option>Bimbingan Privat</option>
                            <option>Kemitraan</option>
                            <option>Masalah Teknis</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-brand-dark ml-2">Pesan</label>
                        <textarea 
                            rows={5}
                            placeholder="Ceritakan lebih banyak tentang riset Anda..." 
                            className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-2 border-transparent focus:border-brand-pink focus:bg-white outline-none transition-all text-brand-dark resize-none"
                        ></textarea>
                    </div>

                    <button className="w-full bg-brand-dark text-white font-bold py-4 rounded-2xl hover:bg-brand-pink hover:text-brand-dark transition-all shadow-lg flex items-center justify-center gap-2 group">
                        <FaPaperPlane className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        Kirim Pesan
                    </button>
                </form>
            </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}