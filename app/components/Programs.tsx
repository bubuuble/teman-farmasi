import Image from 'next/image';
import { FaStar, FaArrowRight } from 'react-icons/fa';
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
  description: string;
  rating: number;
  students: string | number;
  duration?: string;
  sessions?: number;
  features?: string[];
  price: string;
  tagColor: string;
  bgColor?: string;
  featured?: boolean;
  image?: SanityImage;
}

interface ProgramsProps {
  programs?: Program[];
}

export default function Programs({ programs = [] }: ProgramsProps) {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl font-bold text-brand-dark">Track Spesialisasi</h2>
        <p className="text-gray-500 mt-2">Pilih jalur yang sesuai dengan topik skripsi Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {programs.map((track) => {
            const imageUrl = track.image ? urlFor(track.image).width(600).height(400).url() : null;
            const bgColor = track.bgColor || 'bg-brand-yellow';
            return (
            <div key={track._id} className={`${bgColor} p-4 rounded-[2rem] shadow-lg border border-transparent hover:shadow-card hover:-translate-y-1 transition-all duration-300 group`}>
                {/* Image Container with White Border for contrast against yellow */}
                <div className="relative h-40 rounded-[1.5rem] overflow-hidden mb-4 border-4 border-white bg-gray-200">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                    )}
                    <span className={`absolute top-3 left-3 ${track.tagColor} text-[10px] font-bold px-3 py-1.5 rounded-full text-brand-dark uppercase shadow-sm`}>
                        Popular
                    </span>
                </div>

                {/* Content */}
                <div className="px-1">
                    <h3 className="font-bold text-brand-dark text-sm leading-snug mb-2 h-10 line-clamp-2">
                        {track.title}
                    </h3>
                    {/* Text darkened slightly for readability on yellow */}
                    <p className="text-xs text-brand-dark/80 mb-4 line-clamp-2 font-medium">{track.description}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4 bg-white/50 p-2 rounded-lg backdrop-blur-sm">
                        <span className="font-bold text-sm text-brand-dark">{track.rating}</span>
                        <div className="flex text-orange-400 text-xs">
                            {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                        </div>
                        <span className="text-[10px] text-brand-dark/70 font-bold ml-auto">({track.students})</span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-brand-dark/10 pt-3">
                        <span className="font-bold text-brand-dark text-sm bg-white/80 px-2 py-1 rounded-md">{track.price}</span>
                        {/* White Button for contrast */}
                        <button className="w-8 h-8 rounded-full bg-white text-brand-dark flex items-center justify-center hover:bg-brand-dark hover:text-white transition-all shadow-md">
                            <FaArrowRight size={10} />
                        </button>
                    </div>
                </div>
            </div>
        )})}
      </div>
    </section>
  );
}