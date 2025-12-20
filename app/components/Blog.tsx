import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
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
    author?: string;
    readTime?: number;
    publishedAt?: string;
    featured?: boolean;
    image?: SanityImage;
}

interface BlogProps {
    posts?: BlogPost[];
}

const colorRotation = ['bg-brand-yellow', 'bg-brand-pink', 'bg-brand-blue'];

export default function Blog({ posts = [] }: BlogProps) {
    return (
        <section className="py-20 px-6 max-w-7xl mx-auto border-t border-gray-200">
            <h2 className="text-center font-heading text-3xl font-bold text-brand-dark mb-12">Baca Blog Harian Kami</h2>
            
            {posts && posts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Belum ada blog post yang ditampilkan. Tandai blog sebagai &quot;Featured&quot; di Studio.</p>
                </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {posts.slice(0, 3).map((post, i) => {
                    const cardBg = colorRotation[i % 3];
                    const imageUrl = post.image ? urlFor(post.image).width(800).height(600).url() : null;
                    
                    return (
                        <div key={post._id} className={`group cursor-pointer ${cardBg} p-4 rounded-[2.5rem] border-2 border-white hover:shadow-lg transition-all duration-300`}>
                            <div className="relative h-56 rounded-[2rem] overflow-hidden mb-4 border-2 border-white bg-gray-200">
                                {imageUrl ? (
                                  <Image 
                                      src={imageUrl} 
                                      alt={post.title} 
                                      fill 
                                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                                )}
                                <div className={`absolute top-4 right-4 bg-brand-white px-3 py-1.5 rounded-full text-[10px] font-bold text-brand-dark uppercase tracking-wide border border-white`}>
                                    {post.category}
                                </div>
                            </div>
                            <div className="px-2 pb-2">
                                <span className="text-xs font-bold text-gray-500 mb-2 block">
                                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <h3 className="font-bold text-lg text-brand-dark leading-tight mb-4 group-hover:text-brand-white transition-colors">
                                    {post.title}
                                </h3>
                                <Link href={`/blog/${post.slug.current}`} className="inline-flex items-center gap-2 text-sm font-bold text-brand-dark bg-white px-4 py-2 rounded-full shadow-sm hover:bg-brand-dark hover:text-white transition-all">
                                    Baca Selengkapnya <FaArrowRight className="text-xs" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}
        </section>
    );
}