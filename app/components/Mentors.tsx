import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

const mentors = [
  {
    name: "Apt. Sarah J.",
    role: "Clinical Specialist",
    rating: 5.0,
    reviews: "1.2k",
    cardColor: "bg-brand-pink",
    borderColor: "border-white",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
  },
  {
    name: "Dr. William Hope",
    role: "Formulation Tech",
    rating: 4.9,
    reviews: "850",
    cardColor: "bg-brand-blue",
    borderColor: "border-white",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
  },
  {
    name: "Apt. Olivia Mia",
    role: "Social Pharmacy",
    rating: 4.8,
    reviews: "920",
    cardColor: "bg-brand-yellow",
    borderColor: "border-white",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
  },
  {
    name: "Dr. Darrell S.",
    role: "Bio-Statistics",
    rating: 5.0,
    reviews: "2k+",
    cardColor: "bg-brand-blue",
    borderColor: "border-white",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
  }
];

export default function Mentors() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
       <h2 className="text-center font-heading text-3xl font-bold text-brand-dark mb-12">Meet Our Mentors</h2>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((mentor, i) => (
             // Using pastel cardColor instead of white
             <div key={i} className={`${mentor.cardColor} p-6 rounded-[2rem] text-center border-2 border-white shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 group`}>
                
                <div className={`w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-[3px] ${mentor.borderColor} p-1 bg-white`}>
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                        <Image src={mentor.image} alt={mentor.name} fill className="object-cover" />
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
          ))}
       </div>
    </section>
  );
}