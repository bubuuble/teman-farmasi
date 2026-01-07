'use client';

import Image from 'next/image';
import { FaDownload, FaFilePdf, FaFileAlt } from 'react-icons/fa';
import { urlFor } from '@/lib/sanity';

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

interface EBookGridProps {
  ebooks: EBook[];
}

// Category color mapping
const categoryColors: { [key: string]: string } = {
  'Cosmetic Formulation': 'bg-pink-100 text-pink-700',
  'R&D': 'bg-blue-100 text-blue-700',
  'Pharmapreneur': 'bg-yellow-100 text-yellow-700',
  'Cosmetic Sciences': 'bg-purple-100 text-purple-700',
  'Research': 'bg-indigo-100 text-indigo-700',
  'International Programs': 'bg-teal-100 text-teal-700',
  'Public Education': 'bg-green-100 text-green-700',
  'Chemistry': 'bg-lime-100 text-lime-700',
  'Natural Products': 'bg-emerald-100 text-emerald-700',
  'Microbiology': 'bg-cyan-100 text-cyan-700',
  'Pharmacology': 'bg-rose-100 text-rose-700',
  'Farmakologi': 'bg-purple-100 text-purple-700',
  'Farmasetika': 'bg-blue-100 text-blue-700',
  'Kimia Farmasi': 'bg-green-100 text-green-700',
  'Farmasi Klinik': 'bg-red-100 text-red-700',
  'Metodologi Penelitian': 'bg-yellow-100 text-yellow-700',
  'Statistika': 'bg-indigo-100 text-indigo-700',
  'Academic Writing': 'bg-pink-100 text-pink-700',
  'Lainnya': 'bg-gray-100 text-gray-700',
};

export default function EBookGrid({ ebooks }: EBookGridProps) {
  const handleDownload = async (pdfFile: SanityFile) => {
    if (pdfFile?.asset?._ref) {
      // Convert Sanity file reference to URL
      const fileUrl = `https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${pdfFile.asset._ref.replace('file-', '').replace('-pdf', '.pdf')}`;
      
      // Open in new tab
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {ebooks.map((ebook) => {
        const coverUrl = ebook.coverImage 
          ? urlFor(ebook.coverImage).width(600).height(800).url() 
          : null;
        
        // Get the first category for the main badge
        const primaryCategory = ebook.category[0];
        const categoryColor = categoryColors[primaryCategory] || categoryColors['Lainnya'];

        return (
          <div
            key={ebook._id}
            className="bg-white rounded-3xl shadow-lg border-2 border-transparent hover:border-brand-pink hover:shadow-card hover:-translate-y-2 transition-all duration-300 overflow-hidden group h-full flex flex-col"
          >
            {/* Cover Image */}
            <div className="relative h-80 bg-gray-100 overflow-hidden flex-shrink-0">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={ebook.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaFileAlt size={80} />
                </div>
              )}
              {/* Category Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[calc(100%-2rem)]">
                {ebook.category.slice(0, 2).map((cat, index) => {
                  const color = categoryColors[cat] || categoryColors['Lainnya'];
                  return (
                    <span 
                      key={index} 
                      className={`${color} text-xs font-bold px-3 py-1.5 rounded-full uppercase shadow-md`}
                    >
                      {cat}
                    </span>
                  );
                })}
                {ebook.category.length > 2 && (
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase shadow-md">
                    +{ebook.category.length - 2}
                  </span>
                )}
              </div>
              {/* Featured Badge */}
              {ebook.featured && (
                <span className="absolute top-4 right-4 bg-brand-yellow text-brand-dark text-xs font-bold px-3 py-1.5 rounded-full uppercase shadow-md">
                  Popular
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="font-bold text-brand-dark text-xl mb-2 line-clamp-2 leading-snug">
                {ebook.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-1">
                by <span className="font-semibold text-brand-dark">{ebook.author}</span>
              </p>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {ebook.description}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                {ebook.pages && (
                  <div className="flex items-center gap-1">
                    <FaFilePdf className="text-red-500" />
                    <span>{ebook.pages} halaman</span>
                  </div>
                )}
                {ebook.fileSize && (
                  <span className="font-medium">{ebook.fileSize}</span>
                )}
              </div>

              {/* Download Stats */}
              {ebook.downloads !== undefined && ebook.downloads > 0 && (
                <div className="text-xs text-gray-500 mb-4">
                  <FaDownload className="inline mr-1" />
                  {ebook.downloads.toLocaleString()} downloads
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={() => handleDownload(ebook.pdfFile)}
                className="w-full bg-brand-pink text-white font-bold py-3 px-6 rounded-full hover:bg-brand-dark transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-auto"
              >
                <FaDownload />
                Download Gratis
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
