'use client';

import { useState } from 'react';
import EBookGrid from './EBookGrid';

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

interface FilterableEBooksProps {
  ebooks: EBook[];
  categories: string[];
}

export default function FilterableEBooks({ ebooks, categories }: FilterableEBooksProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredEbooks = selectedCategory
    ? ebooks.filter((ebook) => ebook.category.includes(selectedCategory))
    : ebooks;

  return (
    <>
      {/* Categories Filter */}
      <div className="bg-white rounded-3xl p-6 shadow-md mb-12">
        <h3 className="font-bold text-brand-dark mb-4 flex items-center gap-2">
          <span className="text-brand-pink">📚</span> Kategori Tersedia:
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
              selectedCategory === null
                ? 'bg-brand-pink text-white border-brand-pink'
                : 'bg-brand-cream text-brand-dark border-transparent hover:border-brand-pink'
            }`}
          >
            Semua ({ebooks.length})
          </button>
          {categories.map((category) => {
            const count = ebooks.filter((ebook) => ebook.category.includes(category)).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  selectedCategory === category
                    ? 'bg-brand-pink text-white border-brand-pink'
                    : 'bg-brand-cream text-brand-dark border-transparent hover:border-brand-pink'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* E-Books Grid */}
      {filteredEbooks.length > 0 ? (
        <>
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Menampilkan <span className="font-bold text-brand-pink">{filteredEbooks.length}</span> e-book
              {selectedCategory && ` dalam kategori "${selectedCategory}"`}
            </p>
          </div>
          <EBookGrid ebooks={filteredEbooks} />
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-brand-dark mb-2">
            Tidak Ada E-Book
          </h3>
          <p className="text-gray-600 mb-4">
            Tidak ada e-book dalam kategori &ldquo;{selectedCategory}&rdquo;.
          </p>
          <button
            onClick={() => setSelectedCategory(null)}
            className="bg-brand-pink text-white font-bold py-3 px-6 rounded-full hover:bg-brand-dark transition-all"
          >
            Lihat Semua E-Book
          </button>
        </div>
      )}
    </>
  );
}
