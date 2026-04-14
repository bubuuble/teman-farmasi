'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaInstagram, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { urlFor } from '@/lib/sanity';

type SanityImage = {
  _type: 'image';
  asset: { _ref: string; _type: 'reference' };
};

interface GalleryItem {
  _id: string;
  title: string;
  instagramUrl: string;
  image: SanityImage;
  description?: string;
  category?: string;
  publishedAt: string;
}

interface GalleryGridProps {
  items: GalleryItem[];
}

const categoryColors: { [key: string]: string } = {
  event: 'bg-brand-blue text-white',
  success: 'bg-brand-yellow text-brand-dark',
  tips: 'bg-brand-pink text-white',
  bts: 'bg-brand-purple text-white',
  announcement: 'bg-brand-teal text-brand-dark',
  other: 'bg-gray-400 text-white',
};

const categoryLabels: { [key: string]: string } = {
  event: 'Event',
  success: 'Student Success',
  tips: 'Tips & Tutorial',
  bts: 'Behind The Scenes',
  announcement: 'Announcement',
  other: 'Other',
};

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category).filter(Boolean)))];

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const handleInstagramClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat as string)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-brand-pink text-white shadow-lg scale-105'
                : 'bg-white text-brand-dark hover:bg-brand-pink/10 border-2 border-brand-pink/20'
            }`}
          >
            {cat === 'all' ? 'Semua' : (cat && categoryLabels[cat]) || cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems
          .filter((item) => item.image) // Only show items with images
          .map((item) => {
            const imageUrl = urlFor(item.image).width(600).height(600).url();
            
            return (
            <div
              key={item._id}
              onClick={() => setSelectedItem(item)}
              className="group relative overflow-hidden rounded-3xl cursor-pointer border-4 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              {/* Image */}
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white font-heading font-bold text-lg mb-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-white/90 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Category Badge */}
                {item.category && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[item.category] || categoryColors.other}`}>
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>
                )}

                {/* Instagram Icon */}
                <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaInstagram className="text-pink-600" size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-20">
          <FaInstagram className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg">Tidak ada postingan di kategori ini</p>
        </div>
      )}

      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-brand-cream max-w-xl w-full rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-white max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 text-brand-dark border-2 border-brand-pink/20"
            >
              <FaTimes size={18} />
            </button>

            {/* Image */}
            <div className="aspect-square relative bg-white border-b-4 border-white">
              <Image
                src={urlFor(selectedItem.image).width(800).height(800).url()}
                alt={selectedItem.title}
                fill
                className="object-cover"
              />
              
              {/* Category Badge on Image */}
              {selectedItem.category && (
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${categoryColors[selectedItem.category] || categoryColors.other}`}>
                    {categoryLabels[selectedItem.category] || selectedItem.category}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="font-heading text-2xl font-extrabold text-brand-dark mb-3 tracking-tight leading-tight">
                {selectedItem.title}
              </h2>

              {selectedItem.description && (
                <p className="text-brand-dark/70 mb-5 leading-relaxed text-base">
                  {selectedItem.description}
                </p>
              )}

              {/* Instagram Link Button */}
              <button
                onClick={() => handleInstagramClick(selectedItem.instagramUrl)}
                className="w-full bg-brand-pink text-white px-6 py-4 rounded-[2rem] font-extrabold text-lg flex items-center justify-center gap-3 hover:bg-brand-darkblue transition-all duration-300 hover:scale-105 shadow-xl active:scale-95 group"
              >
                <FaInstagram size={20} className="group-hover:rotate-12 transition-transform" />
                Lihat di Instagram
                <FaExternalLinkAlt size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
