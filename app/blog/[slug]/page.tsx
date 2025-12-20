import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaClock, FaCalendar, FaUser, FaTag } from 'react-icons/fa';
import { getBlogPost } from '@/lib/sanity-queries';
import { urlFor } from '@/lib/sanity';
import { PortableText, PortableTextBlock } from '@portabletext/react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { notFound } from 'next/navigation';
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
  content?: PortableTextBlock[];
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post: BlogPost = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const imageUrl = post.image ? urlFor(post.image).width(1200).height(600).url() : null;

  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      {/* Back Button */}
      <div className="pt-32 pb-8 px-6 max-w-4xl mx-auto">
        <Link 
          href="/#blog" 
          className="inline-flex items-center gap-2 text-brand-dark hover:text-brand-dark/70 transition-colors font-medium"
        >
          <FaArrowLeft /> Kembali ke Blog
        </Link>
      </div>

      {/* Article Header */}
      <article className="pb-20 px-6 max-w-4xl mx-auto">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 bg-brand-yellow px-4 py-2 rounded-full text-sm font-bold text-brand-dark border-2 border-white shadow-sm">
            <FaTag className="text-xs" />
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-dark mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 text-gray-600 mb-8 text-sm">
          {post.author && (
            <div className="flex items-center gap-2">
              <FaUser className="text-brand-pink" />
              <span>{post.author}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <FaCalendar className="text-brand-blue" />
            <span>{new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          {post.readTime && (
            <div className="flex items-center gap-2">
              <FaClock className="text-brand-purple" />
              <span>{post.readTime} menit baca</span>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {imageUrl && (
          <div className="relative h-[400px] rounded-3xl overflow-hidden mb-12 border-4 border-white shadow-xl">
            <Image 
              src={imageUrl} 
              alt={post.title} 
              fill 
              className="object-cover" 
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <div className="bg-brand-pink/20 border-l-4 border-brand-pink rounded-r-2xl p-6 mb-8">
            <p className="text-lg text-brand-dark/80 italic leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        )}

        {/* Content */}
        {post.content && (
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border-2 border-white">
              <PortableText 
                value={post.content}
                components={{
                  block: {
                    h1: ({children}) => <h1 className="text-4xl font-heading font-bold text-brand-dark mt-8 mb-4">{children}</h1>,
                    h2: ({children}) => <h2 className="text-3xl font-heading font-bold text-brand-dark mt-8 mb-4">{children}</h2>,
                    h3: ({children}) => <h3 className="text-2xl font-heading font-bold text-brand-dark mt-6 mb-3">{children}</h3>,
                    h4: ({children}) => <h4 className="text-xl font-heading font-bold text-brand-dark mt-6 mb-3">{children}</h4>,
                    normal: ({children}) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-brand-blue bg-brand-blue/10 pl-6 py-4 my-6 italic">
                        {children}
                      </blockquote>
                    ),
                  },
                  list: {
                    bullet: ({children}) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">{children}</ul>,
                    number: ({children}) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">{children}</ol>,
                  },
                  listItem: {
                    bullet: ({children}) => <li className="ml-4">{children}</li>,
                    number: ({children}) => <li className="ml-4">{children}</li>,
                  },
                  marks: {
                    strong: ({children}) => <strong className="font-bold text-brand-dark">{children}</strong>,
                    em: ({children}) => <em className="italic">{children}</em>,
                    link: ({value, children}) => {
                      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
                      return (
                        <a 
                          href={value?.href} 
                          target={target}
                          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                          className="text-brand-blue hover:text-brand-purple underline font-medium"
                        >
                          {children}
                        </a>
                      );
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-brand-pink rounded-3xl p-8 text-center text-white border-4 border-white shadow-xl">
          <h3 className="font-heading text-2xl font-bold mb-3">
            Butuh Bimbingan Lebih Lanjut?
          </h3>
          <p className="mb-6 text-white/90">
            Konsultasi dengan mentor profesional kami untuk mendapatkan panduan terbaik dalam perjalanan akademik Anda.
          </p>
          <Link 
            href="/programs" 
            className="inline-block bg-white text-brand-dark font-bold px-8 py-3 rounded-full hover:bg-brand-yellow transition-colors shadow-lg"
          >
            Lihat Program Kami
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}
