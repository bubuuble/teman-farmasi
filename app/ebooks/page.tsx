import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FilterableEBooks from "./FilterableEBooks";
import CTASection from "./CTASection";
import { getAllEBooks } from "@/lib/sanity-queries";
import PageWithSpinner from "../components/PageWithSpinner";
import { FaBook } from "react-icons/fa";

export const revalidate = 60; // Revalidate every 60 seconds

type SanityImage = {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
};

type SanityFile = {
  _type: 'file';
  asset: {
    _ref: string;
    _type: 'reference';
    url?: string;
  };
};

interface EBook {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description: string;
  category: string[];
  author: string;
  coverImage: SanityImage;
  pdfFile: SanityFile;
  pages?: number;
  fileSize?: string;
  publishedAt: string;
  featured?: boolean;
  downloads?: number;
}

export default async function EBooksPage() {
  return (
    <PageWithSpinner>
      <EBooksContent />
    </PageWithSpinner>
  );
}

async function EBooksContent() {
  const ebooks = await getAllEBooks() as EBook[];

  // Get unique categories for filter display - flatten array since category is now an array
  const allCategories = ebooks.flatMap((ebook) => ebook.category);
  const categories = Array.from(new Set(allCategories)).sort();

  return (
    <main className="min-h-screen bg-brand-cream selection:bg-brand-pink selection:text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-3 bg-brand-yellow/30 px-6 py-3 rounded-full mb-6 border-2 border-brand-yellow">
            <FaBook className="text-brand-dark text-2xl" />
            <span className="font-bold text-brand-dark uppercase text-sm tracking-wide">
              E-Book Gratis
            </span>
          </div>
          
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
            Koleksi E-Book <br />
            <span className="text-brand-pink">Farmasi & Penelitian</span>
          </h1>
          
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Download gratis berbagai e-book berkualitas tentang farmasi, metodologi penelitian, 
            statistika, dan academic writing untuk mendukung perjalanan akademik Anda.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-2xl p-6 text-center shadow-md border-2 border-transparent hover:border-brand-pink transition-all">
            <div className="text-3xl font-bold text-brand-pink mb-2">{ebooks.length}+</div>
            <div className="text-gray-600 font-medium">E-Book Tersedia</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-md border-2 border-transparent hover:border-brand-pink transition-all">
            <div className="text-3xl font-bold text-brand-pink mb-2">{categories.length}</div>
            <div className="text-gray-600 font-medium">Kategori</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-md border-2 border-transparent hover:border-brand-pink transition-all">
            <div className="text-3xl font-bold text-brand-pink mb-2">100%</div>
            <div className="text-gray-600 font-medium">Gratis</div>
          </div>
        </div>
      </section>

      {/* E-Books Grid with Filter */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        {ebooks.length > 0 ? (
          <FilterableEBooks ebooks={ebooks} categories={categories} />
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-brand-dark mb-2">
              Belum Ada E-Book
            </h3>
            <p className="text-gray-600">
              E-book sedang dalam proses penambahan. Silakan cek kembali nanti!
            </p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <CTASection ebooksCount={ebooks.length} categoriesCount={categories.length} />

      <Footer />
    </main>
  );
}
