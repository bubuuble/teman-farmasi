import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { urlFor } from '@/lib/sanity';

type SanityImage = {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
};

interface Mentor {
  _id: string;
  name: string;
  role: string;
  rating: number;
  reviews: string;
  cardColor: string;
  borderColor?: string;
  expertise?: string[];
  featured?: boolean;
  image?: SanityImage;
  bio?: string;
}

interface MentorsProps {
  mentors?: Mentor[];
}

export default function Mentors({ mentors = [] }: MentorsProps) {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
       <h2 className="text-center font-heading text-3xl font-bold text-brand-dark mb-12">Kenali Para Mentor Kami</h2>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((mentor) => {
             const imageUrl = mentor.image ? urlFor(mentor.image).width(400).height(400).url() : null;
             return (
             <div key={mentor._id} className={`${mentor.cardColor} p-6 rounded-[2rem] text-center border-2 border-white shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 group`}>
                
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-[3px] border-white p-1 bg-white">
                    <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-200">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={mentor.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">{mentor.name.charAt(0)}</div>
                        )}
                    </div>
                </div>
                
                <h3 className="font-bold text-brand-dark mb-1">{mentor.name}</h3>
                <p className="text-xs text-brand-dark/60 font-bold mb-4 uppercase tracking-wide">{mentor.role}</p>
                
                <div className="flex justify-between items-center text-xs px-4 border-t border-brand-dark/5 pt-4">
                    <div className="flex items-center gap-1 text-brand-yellow bg-white px-2 py-1 rounded-full shadow-sm">
                        <FaStar /> <span className="text-brand-dark font-bold">{mentor.rating}</span>
                    </div>
                    <span className="text-gray-500">({mentor.reviews})</span>
                </div>
             </div>
          )})}
       </div>
    </section>
  );
}