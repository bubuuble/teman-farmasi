import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

const testimonials = [
    { 
        name: "Andi Pratama", 
        role: "Clinical Pharmacy", 
        text: "Teman Farmasi helped me structure my thesis perfectly. I graduated Cum Laude thanks to their expertise!", 
        image: "https://i.pravatar.cc/150?img=12",
        cardColor: "bg-brand-yellow",
        iconColor: "text-brand-dark"
    },
    { 
        name: "Siti Aminah", 
        role: "Pharm Technology", 
        text: "The methodology coaching was a game changer for my lab research. Data interpretation became so much clearer.", 
        image: "https://i.pravatar.cc/150?img=45",
        cardColor: "bg-brand-pink",
        iconColor: "text-white"
    },
    { 
        name: "Rina Safitri", 
        role: "Social Pharmacy", 
        text: "My mentor was super responsive. They helped me choose the perfect research topic and guided me through writing.", 
        image: "https://i.pravatar.cc/150?img=32",
        cardColor: "bg-brand-blue",
        iconColor: "text-white"
    },
    { 
        name: "Budi Wirawan", 
        role: "Clinical Pharmacy", 
        text: "Highly recommended for final year students. The structured approach made thesis writing less stressful.", 
        image: "https://i.pravatar.cc/150?img=33",
        cardColor: "bg-brand-yellow",
        iconColor: "text-brand-dark"
    },
    { 
        name: "Dewi Kartika", 
        role: "Hospital Pharmacy", 
        text: "The weekly consultations kept me on track. My mentor's industry experience provided amazing insights.", 
        image: "https://i.pravatar.cc/150?img=47",
        cardColor: "bg-brand-pink",
        iconColor: "text-white"
    },
    { 
        name: "Rizky Maulana", 
        role: "Pharm Technology", 
        text: "I was struggling with experimental design. The guidance on methodology was exceptional.", 
        image: "https://i.pravatar.cc/150?img=15",
        cardColor: "bg-brand-blue",
        iconColor: "text-white"
    }
];

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      <div className="pt-40 pb-16 px-6 text-center max-w-3xl mx-auto">
         <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-green mb-4">
            Success Stories
         </h1>
         <p className="text-brand-green/70 text-lg">
            Join over 2,000 students who have successfully completed their research with us.
         </p>
      </div>

      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
                <div key={idx} className={`p-8 rounded-[2rem] shadow-sm transition-all duration-300 hover:shadow-card hover:-translate-y-1 relative group ${item.cardColor}`}>
                    
                    <FaQuoteLeft className={`text-4xl mb-6 opacity-50 ${item.iconColor}`}/>
                    
                    <p className="text-sm leading-relaxed mb-8 font-medium text-brand-dark">
                        &quot;{item.text}&quot;
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-brand-dark">{item.name}</h4>
                            <p className="text-xs text-brand-dark/60 font-bold">{item.role}</p>
                        </div>
                    </div>

                    <div className="absolute top-8 right-8 flex text-sm text-brand-yellow bg-white px-2 py-1 rounded-full shadow-sm">
                        <FaStar/><FaStar/><FaStar/><FaStar/><FaStar/>
                    </div>
                </div>
            ))}
        </div>
      </section>
    </main>
  );
}