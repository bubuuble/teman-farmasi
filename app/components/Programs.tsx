import Image from 'next/image';
import { FaStar, FaArrowRight } from 'react-icons/fa';

const tracks = [
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
  }
];

export default function Programs() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl font-bold text-brand-dark">Specialization Tracks</h2>
        <p className="text-gray-500 mt-2">Choose the path that fits your thesis topic.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tracks.map((track, idx) => {
            const bgColors = ['bg-brand-yellow', 'bg-brand-pink', 'bg-brand-blue', 'bg-brand-yellow'];
            return (
            <div key={idx} className={`${bgColors[idx]} p-4 rounded-[2rem] shadow-lg border border-transparent hover:shadow-card hover:-translate-y-1 transition-all duration-300 group`}>
                {/* Image Container with White Border for contrast against yellow */}
                <div className="relative h-40 rounded-[1.5rem] overflow-hidden mb-4 border-4 border-white">
                    <Image src={track.image} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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