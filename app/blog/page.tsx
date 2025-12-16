import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

const posts = [
    { 
        title: "5 Tips for Choosing a Pharmacy Thesis Topic", 
        date: "Oct 12", 
        category: "Tips",
        color: "bg-brand-dark",
        cardBg: "bg-brand-yellow",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop"
    },
    { 
        title: "Understanding SPSS for Social Pharmacy", 
        date: "Oct 08", 
        category: "Methodology",
        color: "bg-white",
        cardBg: "bg-brand-pink",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
    },
    { 
        title: "How to Write a Literature Review", 
        date: "Sep 25", 
        category: "Writing",
        color: "bg-brand-dark",
        cardBg: "bg-brand-blue",
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop"
    },
    { 
        title: "Top 10 Journals for Pharmacy Publication", 
        date: "Sep 10", 
        category: "Publication",
        color: "bg-brand-dark",
        cardBg: "bg-brand-yellow",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2028&auto=format&fit=crop"
    },
    { 
        title: "Lab Safety 101 for Undergraduates", 
        date: "Aug 22", 
        category: "Lab Skills",
        color: "bg-white",
        cardBg: "bg-brand-pink",
        image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2080&auto=format&fit=crop"
    },
    { 
        title: "Managing Thesis Stress", 
        date: "Aug 15", 
        category: "Wellness",
        color: "bg-brand-dark",
        cardBg: "bg-brand-blue",
        image: "https://images.unsplash.com/photo-1512413914633-b5043f4041ea?q=80&w=2053&auto=format&fit=crop"
    },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      <div className="pt-40 pb-16 px-6 text-center max-w-3xl mx-auto">
         <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-dark mb-4">
            Research Insights
         </h1>
         <p className="text-gray-500 text-lg">
            Latest articles, guides, and tips to help you ace your pharmacy research.
         </p>
      </div>

      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
                // Pastel Card Backgrounds
                <div key={idx} className={`group cursor-pointer ${post.cardBg} p-4 rounded-[2rem] border-2 border-white hover:shadow-lg transition-all duration-300`}>
                    <div className="relative h-64 rounded-[2rem] overflow-hidden mb-5 border border-white/50">
                        <Image 
                           src={post.image} 
                           alt={post.title} 
                           fill 
                           className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className={`absolute top-4 right-4 ${post.color} px-4 py-1.5 rounded-full text-xs font-bold text-brand-dark flex items-center gap-2 uppercase tracking-wide border border-white shadow-sm`}>
                             {post.category}
                        </div>
                    </div>
                    
                    <div className="px-2">
                        <span className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-wider">{post.date}</span>
                        <h2 className="text-xl font-bold text-brand-dark mb-4 leading-tight group-hover:text-brand-pink transition-colors">
                            {post.title}
                        </h2>
                        {/* Link Button: Pink */}
                        <Link href="#" className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue bg-white px-5 py-2.5 rounded-full shadow-lg hover:bg-brand-yellow hover:text-brand-dark transition-all">
                            Read Article <FaArrowRight size={12}/>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}