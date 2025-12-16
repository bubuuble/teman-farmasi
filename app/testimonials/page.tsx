import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { getAllTestimonials } from '@/lib/sanity-queries';
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
  order?: number;
}

const iconColors: Record<string, string> = {
  'bg-brand-yellow': 'text-brand-dark',
  'bg-brand-pink': 'text-white',
  'bg-brand-blue': 'text-white',
};

export default async function TestimonialsPage() {
  const testimonials = await getAllTestimonials();
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      <div className="pt-40 pb-16 px-6 text-center max-w-3xl mx-auto">
         <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-dark mb-4">
            Kisah Sukses
         </h1>
         <p className="text-gray-500 text-lg">
            Bergabunglah dengan lebih dari 2.000 mahasiswa yang telah berhasil menyelesaikan riset mereka bersama kami.
         </p>
      </div>

      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((item: Testimonial, idx: number) => {
                const imageUrl = item.image ? urlFor(item.image).width(200).height(200).url() : null;
                const iconColor = iconColors[item.cardColor] || 'text-brand-dark';
                return (
                <div key={item._id} className={`p-8 rounded-[2rem] shadow-sm transition-all duration-300 hover:shadow-card hover:-translate-y-1 relative group ${item.cardColor} border-2 border-white`}>
                    
                    <FaQuoteLeft className={`text-3xl mb-6 opacity-40 ${iconColor}`}/>
                    
                    <p className="text-sm leading-relaxed mb-8 font-medium text-brand-dark">
                        &quot;{item.text}&quot;
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-gray-200">
                            {imageUrl ? (
                              <Image src={imageUrl} alt={item.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                {item.name.charAt(0)}
                              </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-brand-dark">{item.name}</h4>
                            <p className="text-xs text-brand-dark/60">{item.role}</p>
                        </div>
                    </div>

                    <div className="absolute top-8 right-8 flex text-sm text-brand-yellow bg-white px-2 py-1 rounded-full shadow-sm">
                        <FaStar/><FaStar/><FaStar/><FaStar/><FaStar/>
                    </div>
                </div>
            )})}
        </div>
      </section>

      <Footer />
    </main>
  );
}