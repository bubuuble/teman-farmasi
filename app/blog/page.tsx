import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { getAllBlogPosts } from '@/lib/sanity-queries';
import { urlFor } from '@/lib/sanity';
export const revalidate = 60; // Revalidate setiap 60 detik

type SanityImage = {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
};

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  date: string;
  category: string;
  excerpt?: string;
  author?: string;
  readTime?: number;
  publishedAt?: string;
  featured?: boolean;
  image?: SanityImage;
}

const colorRotation = ['bg-brand-yellow', 'bg-brand-pink', 'bg-brand-blue'];

export default async function BlogPage() {
  const posts = await getAllBlogPosts();
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      <div className="pt-40 pb-16 px-6 text-center max-w-3xl mx-auto">
         <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-dark mb-4">
            Wawasan Riset
         </h1>
         <p className="text-gray-500 text-lg">
            Artikel terbaru, panduan, dan tips untuk membantu riset farmasi Anda.
         </p>
      </div>

      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: BlogPost, idx: number) => {
                const cardBg = colorRotation[idx % 3];
                const imageUrl = post.image ? urlFor(post.image).width(800).height(600).url() : null;
                
                return (
                <div key={post._id} className={`group cursor-pointer ${cardBg} p-4 rounded-[2rem] border-2 border-white hover:shadow-lg transition-all duration-300`}>
                    <div className="relative h-64 rounded-[2rem] overflow-hidden mb-5 border border-white/50 bg-gray-200">
                        {imageUrl ? (
                          <Image 
                             src={imageUrl} 
                             alt={post.title} 
                             fill 
                             className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-sm">No image</span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-brand-dark flex items-center gap-2 uppercase tracking-wide border border-white shadow-sm">
                             {post.category}
                        </div>
                    </div>
                    
                    <div className="px-2">
                        <span className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-wider">
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <h2 className="text-xl font-bold text-brand-dark mb-4 leading-tight group-hover:text-brand-pink transition-colors">
                            {post.title}
                        </h2>
                        <Link href={`/blog/${post.slug.current}`} className="inline-flex items-center gap-2 text-sm font-bold text-white bg-brand-pink px-5 py-2.5 rounded-full shadow-lg hover:bg-brand-yellow hover:text-brand-dark transition-all">
                            Baca Artikel <FaArrowRight size={12}/>
                        </Link>
                    </div>
                </div>
                );
            })}
        </div>
      </section>

      <Footer />
    </main>
  );
}