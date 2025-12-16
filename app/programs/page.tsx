import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from 'next/image';
import { FaStar, FaArrowRight } from "react-icons/fa";

const programs = [
  {
    title: "Clinical Pharmacy & Data Analysis",
    description: "Guidance on clinical methodologies and hospital data analysis using SPSS.",
    rating: 5.0,
    students: "850+",
    price: "Rp 350k",
    tagColor: "bg-brand-pink",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Pharmaceutical Technology",
    description: "Formulation development, stability testing, and lab research support.",
    rating: 4.9,
    students: "620+",
    price: "Rp 400k",
    tagColor: "bg-brand-blue",
    image: "https://images.unsplash.com/photo-1563213126-a4273aed2016?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Social Pharmacy & Management",
    description: "Qualitative research, survey design, and pharmacy management studies.",
    rating: 4.8,
    students: "450+",
    price: "Rp 350k",
    tagColor: "bg-brand-yellow",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Scientific Publication",
    description: "Turn your thesis into an international journal. Writing and submission guidance.",
    rating: 5.0,
    students: "300+",
    price: "Rp 500k",
    tagColor: "bg-brand-teal",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop"
  },
  {
    title: "Pharmacology & Toxicology",
    description: "In-vivo and in-vitro study designs, dosing, and effect analysis.",
    rating: 4.9,
    students: "250+",
    price: "Rp 400k",
    tagColor: "bg-brand-purple",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Microbiology & Biotech",
    description: "Antibacterial testing, fermentation, and biotechnology research.",
    rating: 4.8,
    students: "200+",
    price: "Rp 450k",
    tagColor: "bg-brand-pink",
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function ProgramsPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      {/* Header */}
      <div className="pt-40 pb-16 px-6 text-center max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-dark mb-4">
          All Research Tracks
        </h1>
        <p className="text-gray-500 text-lg">
          Choose the specialized track that fits your thesis topic. 
          Expert guidance from proposal to publication.
        </p>
      </div>
      
      {/* Grid */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((track, idx) => {
            const bgColors = ['bg-brand-yellow', 'bg-brand-pink', 'bg-brand-blue'];
            return (
              <div key={idx} className={`${bgColors[idx % 3]} p-4 rounded-[2rem] shadow-lg border border-transparent hover:shadow-card hover:-translate-y-1 transition-all group`}>
                {/* Image */}
                <div className="relative h-56 rounded-[1.5rem] overflow-hidden mb-5 border-4 border-white">
                    <Image src={track.image} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
                            {track.students} Students Enrolled
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