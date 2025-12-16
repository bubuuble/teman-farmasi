import Image from "next/image";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { urlFor } from '@/lib/sanity';

type SanityImage = {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
};

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  text: string;
  image?: SanityImage;
  cardColor: string;
  featured?: boolean;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

const iconColors: Record<string, string> = {
  'bg-brand-yellow': 'text-brand-dark',
  'bg-brand-pink': 'text-white',
  'bg-brand-blue': 'text-white',
};

export default function Testimonials({ testimonials = [] }: TestimonialsProps) {
  // Calculate curved positioning for each card
  const getCurveStyle = (index: number, total: number) => {
    const angle = ((index - (total - 1) / 2) * 15); // Spread cards across arc
    const yOffset = Math.abs(index - (total - 1) / 2) * 30; // Create downward curve
    return {
      transform: `translateY(${yOffset}px) rotate(${angle * 0.3}deg)`,
    };
  };

  return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-center font-heading text-3xl font-bold text-brand-dark mb-12">Kisah Sukses Mahasiswa</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => {
                const imageUrl = item.image ? urlFor(item.image).width(200).height(200).url() : null;
                const iconColor = iconColors[item.cardColor] || 'text-brand-dark';
                const curveStyle = getCurveStyle(idx, testimonials.length);
                return (
                <div key={item._id} className={`p-8 rounded-[2rem] shadow-sm transition-all duration-500 hover:shadow-2xl hover:scale-110 hover:rotate-0 hover:z-10 relative group cursor-pointer ${item.cardColor}`} style={curveStyle}>
                    
                    <FaQuoteLeft className={`text-4xl mb-6 opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-125 ${iconColor}`}/>
                    
                    <p className="text-sm leading-relaxed mb-8 font-medium text-brand-dark">
                        &quot;{item.text}&quot;
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-200 transition-all duration-300 group-hover:scale-125 group-hover:border-4">
                            {imageUrl ? (
                              <Image src={imageUrl} alt={item.name} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold transition-all duration-300 group-hover:text-brand-dark">{item.name.charAt(0)}</div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-brand-dark">{item.name}</h4>
                            <p className="text-xs text-brand-dark/60 font-bold">{item.role}</p>
                        </div>
                    </div>

                    <div className="absolute top-8 right-8 flex text-sm text-brand-yellow bg-white px-2 py-1 rounded-full shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:animate-pulse">
                        <FaStar/><FaStar/><FaStar/><FaStar/><FaStar/>
                    </div>
                </div>
            )})}
        </div>
      </section>
  );
}