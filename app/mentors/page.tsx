import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import { FaStar } from 'react-icons/fa';

const allMentors = [
  {
    name: "Apt. Sarah Johnson",
    role: "Clinical Pharmacy",
    rating: 5.0,
    reviews: "1.2k",
    cardColor: "bg-brand-pink",
    borderColor: "border-white",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
  },
  {
    name: "Dr. William Hope",
    role: "Pharmaceutical Tech",
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
    name: "Dr. Sophia Ava",
    role: "Pharmacology",
    rating: 5.0,
    reviews: "1.5k",
    cardColor: "bg-brand-pink",
    borderColor: "border-white",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop"
  },
  {
    name: "Dr. Darrell Steward",
    role: "Bio-Statistics",
    rating: 5.0,
    reviews: "2k+",
    cardColor: "bg-brand-blue",
    borderColor: "border-white",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
  },
  {
    name: "Apt. Theresa Webb",
    role: "Management",
    rating: 4.9,
    reviews: "700+",
    cardColor: "bg-brand-yellow",
    borderColor: "border-white",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
  }
];

export default function MentorsPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      {/* Header */}
      <div className="pt-40 pb-16 px-6 text-center max-w-3xl mx-auto">
         <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-dark mb-4">
            Meet Our Experts
         </h1>
         <p className="text-gray-500 text-lg">
            Learn from experienced pharmacists and researchers who are dedicated to your success.
         </p>
      </div>

      {/* Mentor Cards */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {allMentors.map((mentor, idx) => (
                // Pastel Card Backgrounds
                <div key={idx} className={`${mentor.cardColor} p-6 rounded-[2.5rem] text-center border-4 border-white hover:shadow-card hover:-translate-y-2 transition-all duration-300 group`}>
                    {/* Image with Colorful Border Ring */}
                    <div className={`w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-[3px] ${mentor.borderColor} p-1 shadow-md`}>
                        <div className="w-full h-full rounded-full overflow-hidden relative">
                           <Image src={mentor.image} alt={mentor.name} fill className="object-cover" />
                        </div>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-brand-dark mb-1">{mentor.name}</h3>
                    <p className="text-sm text-brand-dark/60 font-bold mb-4 uppercase tracking-wide">{mentor.role}</p>
                    
                    {/* Rating Section with White Background */}
                    <div className="flex justify-center items-center gap-4 pt-4 border-t border-white/30">
                        <div className="flex items-center gap-1 text-brand-yellow bg-white px-3 py-1 rounded-full shadow-sm">
                            <FaStar /> <span className="text-brand-dark font-bold">{mentor.rating}</span>
                        </div>
                        <span className="text-gray-400 text-sm">({mentor.reviews})</span>
                    </div>
                </div>
            ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}