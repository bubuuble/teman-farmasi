import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from 'next/image';
import { FaStar, FaArrowRight } from "react-icons/fa";
import { getAllPrograms } from '@/lib/sanity-queries';
import { urlFor } from '@/lib/sanity';
export const revalidate = 60; // Revalidate setiap 60 detik

type SanityImage = {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
};

interface Program {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  rating: number;
  students: number;
  duration?: string;
  sessions?: number;
  features?: string[];
  price: string;
  tagColor: string;
  bgColor?: string;
  featured?: boolean;
  image?: SanityImage;
  order?: number;
}

export default async function ProgramsPage() {
  const programs = await getAllPrograms();
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      {/* Header */}
      <div className="pt-40 pb-16 px-6 text-center max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-dark mb-4">
          Semua Track Riset
        </h1>
        <p className="text-gray-500 text-lg">
          Pilih track spesialisasi yang sesuai dengan topik skripsi Anda. 
          Bimbingan ahli dari proposal hingga publikasi.
        </p>
      </div>
      
      {/* Grid */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((track: Program) => {
            const imageUrl = track.image ? urlFor(track.image).width(800).height(600).url() : null;
            const bgColor = track.bgColor || 'bg-brand-yellow';
            return (
              <div key={track._id} className={`${bgColor} p-4 rounded-[2rem] shadow-lg border border-transparent hover:shadow-card hover:-translate-y-1 transition-all group`}>
                {/* Image */}
                <div className="relative h-56 rounded-[1.5rem] overflow-hidden mb-5 border-4 border-white bg-gray-200">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm">No image</span>
                      </div>
                    )}
                    <div className={`absolute top-4 right-4 ${track.tagColor} px-3 py-1 rounded-full text-xs font-bold text-brand-dark flex items-center gap-1 shadow-sm border border-white`}>
                        <FaStar className="text-white text-xs"/> {track.rating}
                    </div>
                </div>

                {/* Content */}
                <div className="px-2 pb-2">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-heading font-bold text-brand-dark text-xl leading-tight max-w-[80%]">
                            {track.title}
                        </h3>
                        {/* Price Badge White for Contrast */}
                        <span className="bg-white text-brand-dark font-bold text-xs px-2 py-1 rounded-lg shadow-sm">
                            {track.price}
                        </span>
                    </div>
                    
                    <p className="text-sm text-brand-dark/80 font-medium mb-6 leading-relaxed min-h-[3rem]">
                        {track.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-brand-dark/10">
                        <span className="text-xs font-bold text-brand-dark/60">
                            {track.students} Mahasiswa Terdaftar
                        </span>
                        {/* White Button */}
                        <button className="w-10 h-10 rounded-full bg-white text-brand-dark flex items-center justify-center hover:bg-brand-dark hover:text-white transition-all shadow-md">
                            <FaArrowRight size={12}/>
                        </button>
                    </div>
                </div>
            </div>
          )})}
        </div>
      </section>
      
      <Footer />
    </main>
  );
}