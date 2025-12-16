import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

const blogs = [
    {
        title: "5 Tips for Choosing a Thesis Topic",
        date: "Oct 12",
        category: "Tips",
        color: "bg-brand-dark",
        cardBg: "bg-brand-yellow",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Understanding SPSS for Beginners",
        date: "Oct 08",
        category: "Stats",
        color: "bg-white",
        cardBg: "bg-brand-pink",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "How to Publish in International Journals",
        date: "Sep 25",
        category: "Journal",
        color: "bg-brand-dark",
        cardBg: "bg-brand-blue",
        image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop"
    }
];

export default function Blog() {
    return (
        <section className="py-20 px-6 max-w-7xl mx-auto border-t border-gray-200">
            <h2 className="text-center font-heading text-3xl font-bold text-brand-dark mb-12">Read Our Daily Blogs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogs.map((post, i) => (
                    // Pastel Card Background
                    <div key={i} className={`group cursor-pointer ${post.cardBg} p-4 rounded-[2.5rem] border-2 border-white hover:shadow-lg transition-all duration-300`}>
                        <div className="relative h-56 rounded-[2rem] overflow-hidden mb-4 border-2 border-white">
                            <Image 
                                src={post.image} 
                                alt={post.title} 
                                fill 
                                className="object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                            <div className={`absolute top-4 right-4 ${post.color} px-3 py-1.5 rounded-full text-[10px] font-bold text-brand-dark uppercase tracking-wide border border-white`}>
                                {post.category}
                            </div>
                        </div>
                        <div className="px-2 pb-2">
                             <span className="text-xs font-bold text-gray-500 mb-2 block">{post.date}, 2024</span>
                            <h3 className="font-bold text-lg text-brand-dark leading-tight mb-4 group-hover:text-brand-pink transition-colors">
                                {post.title}
                            </h3>
                            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-brand-dark bg-white px-4 py-2 rounded-full shadow-sm hover:bg-brand-dark hover:text-white transition-all">
                                Read More <FaArrowRight className="text-xs" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}