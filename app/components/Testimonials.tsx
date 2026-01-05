import Image from "next/image";
import { FaVideo, FaPhone, FaEllipsisV, FaPaperPlane } from "react-icons/fa";
import { urlFor } from '@/lib/sanity';

type SanityImage = {
  _type: 'image';
  asset: { _ref: string; _type: 'reference' };
};

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  text: string;
  image?: SanityImage;
}

interface Props {
  testimonials: Testimonial[];
  isFullPage?: boolean; // Prop baru untuk membedakan mode
}

export default function Testimonials({ testimonials = [], isFullPage = false }: Props) {
  // Jika di homepage, batasi 3. Jika di halaman testimoni, tampilkan semua.
  const displayItems = isFullPage ? testimonials : testimonials.slice(0, 3);

  return (
    <div className={`
      ${isFullPage 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6" 
        : "flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 pb-20 pt-10"
      }
    `}>
      {displayItems.map((item, idx) => {
        const imageUrl = item.image ? urlFor(item.image).width(100).height(100).url() : null;
        
        // Transformasi Bukit (Hanya jika bukan Full Page)
        const transformations = !isFullPage ? [
          "md:rotate-[-8deg] md:translate-y-8 md:translate-x-4 z-0 scale-90",
          "md:rotate-0 z-20 scale-100 shadow-2xl",
          "md:rotate-[8deg] md:translate-y-8 md:-translate-x-4 z-0 scale-90"
        ] : ["", "", ""];

        return (
          <div 
            key={item._id} 
            className={`flex flex-col bg-pink-50 w-full rounded-[1.5rem] overflow-hidden shadow-lg border-2 border-brand-pink/20 transition-all duration-300 hover:z-30 hover:scale-[1.02] h-full
            ${!isFullPage ? transformations[idx % 3] : ""}`}
          >
            {/* Header WhatsApp */}
            <div className="bg-brand-pink p-3 px-4 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] bg-gray-400">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-bold truncate leading-tight text-brand-cream">{item.name}</h4>
                  <p className="text-[10px] text-pink-100 opacity-90">online</p>
                </div>
              </div>
              <div className="flex gap-3 text-xs opacity-80 flex-shrink-0">
                <FaVideo /> <FaPhone /> <FaEllipsisV />
              </div>
            </div>

            {/* Chat Body - grows to fill space */}
            <div className="p-4 relative bg-pink-50 flex-grow flex flex-col justify-center">
               {/* Pattern WhatsApp (Opsional) */}
               <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                    style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')` }}>
               </div>

               {/* Bubble Kiri (Incoming) */}
               <div className="relative bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm self-start max-w-[95%] z-10">
                  <span className="block text-[10px] font-bold text-brand-pink mb-1.5 uppercase tracking-wide">
                    {item.role}
                  </span>
                  <p className="text-[13.5px] text-gray-700 leading-relaxed pr-4">
                    &quot;{item.text}&quot;
                  </p>
                  <div className="text-right mt-1">
                    <span className="text-[9px] text-gray-400 font-medium">12:45</span>
                  </div>
                  {/* Bubble Tail */}
                  <div className="absolute -left-2 top-0 w-0 h-0 border-r-[10px] border-r-white border-b-[10px] border-b-transparent"></div>
               </div>
            </div>
            
            {/* Footer Input - fixed at bottom */}
            <div className="bg-pink-100/50 p-3 flex items-center gap-2 flex-shrink-0 mt-auto">
                <div className="flex-1 bg-white rounded-full py-2 px-4 text-[12px] text-gray-400 shadow-sm">
                  Ketik pesan...
                </div>
                <div className="w-9 h-9 bg-brand-pink rounded-full flex items-center justify-center text-white text-xs shadow-md flex-shrink-0">
                   <FaPaperPlane />
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}