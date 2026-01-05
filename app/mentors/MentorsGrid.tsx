'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { urlFor } from '@/lib/sanity';
export const revalidate = 60; // Revalidate setiap 60 detik

type SanityImage = {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
};

interface Mentor {
  _id: string;
  name: string;
  slug: { current: string };
  role: string;
  rating: number;
  reviews: string;
  cardColor: string;
  borderColor?: string;
  expertise?: string[];
  featured?: boolean;
  image?: SanityImage;
  bio?: string;
  order?: number;
}

interface MentorsGridProps {
  mentors: Mentor[];
}

export default function MentorsGrid({ mentors }: MentorsGridProps) {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMentor(null);
    };
    if (selectedMentor) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedMentor]);

  return (
    <>
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mentors.map((mentor: Mentor) => {
                const imageUrl = mentor.image ? urlFor(mentor.image).width(400).height(400).url() : null;
                return (
                <div 
                  key={mentor._id} 
                  onClick={() => setSelectedMentor(mentor)}
                  className={`${mentor.cardColor} p-6 rounded-[2.5rem] text-center border-4 border-white hover:shadow-card hover:-translate-y-2 transition-all duration-300 group cursor-pointer flex flex-col h-full`}
                >
                    {/* Image with Colorful Border Ring */}
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-[3px] border-white p-1 shadow-md bg-gray-200 flex-shrink-0">
                        <div className="w-full h-full rounded-full overflow-hidden relative">
                           {imageUrl ? (
                             <Image src={imageUrl} alt={mentor.name} fill className="object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                               No photo
                             </div>
                           )}
                        </div>
                    </div>
                    
                    {/* Text Content - grows to fill space */}
                    <div className="flex-grow flex flex-col">
                        <h3 className="font-heading font-bold text-xl text-brand-dark mb-1 min-h-[3.5rem] flex items-center justify-center">{mentor.name}</h3>
                        <p className="text-sm text-brand-dark/60 font-bold mb-4 uppercase tracking-wide min-h-[3rem] flex items-center justify-center">{mentor.role}</p>
                    </div>
                    
                    {/* Rating Section with White Background - fixed at bottom */}
                    <div className="flex justify-center items-center gap-4 pt-4 border-t border-white/30 mt-auto">
                        <div className="flex items-center gap-1 text-brand-yellow bg-white px-3 py-1 rounded-full shadow-sm">
                            <FaStar /> <span className="text-brand-dark font-bold">{mentor.rating}</span>
                        </div>
                        <span className="text-black text-sm">({mentor.reviews})</span>
                    </div>
                </div>
            )})}
        </div>
      </section>

      {/* Modal */}
      {selectedMentor && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedMentor(null)}
        >
          <div 
            className={`${selectedMentor.cardColor} max-w-2xl w-full rounded-3xl p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide`}
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMentor(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 text-brand-dark"
              aria-label="Close"
            >
              <FaTimes />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center">
              {/* Image */}
              <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-white p-1 bg-white shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-200">
                  {selectedMentor.image ? (
                    <Image 
                      src={urlFor(selectedMentor.image).width(400).height(400).url()} 
                      alt={selectedMentor.name} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                      {selectedMentor.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Role */}
              <h3 className="font-heading text-3xl font-bold text-brand-dark mb-2">{selectedMentor.name}</h3>
              <p className="text-sm text-brand-dark/70 font-bold mb-4 uppercase tracking-wide">{selectedMentor.role}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md mb-6">
                <div className="flex items-center gap-1 text-brand-yellow">
                  <FaStar /> 
                  <span className="text-brand-dark font-bold text-lg">{selectedMentor.rating}</span>
                </div>
                <span className="text-gray-500 text-sm">({selectedMentor.reviews} ulasan)</span>
              </div>

              {/* Expertise */}
              {selectedMentor.expertise && selectedMentor.expertise.length > 0 && (
                <div className="mb-6 w-full">
                  <h4 className="font-bold text-brand-dark mb-3">Keahlian</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedMentor.expertise.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="bg-white px-3 py-1 rounded-full text-sm text-brand-dark font-medium shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {selectedMentor.bio && (
                <div className="w-full bg-white/50 rounded-2xl p-6 text-left">
                  <h4 className="font-bold text-brand-dark mb-3">Tentang Mentor</h4>
                  <ul className="space-y-2">
                    {selectedMentor.bio.split('|').map((item, idx) => {
                      const trimmedItem = item.trim();
                      if (!trimmedItem) return null;
                      return (
                        <li key={idx} className="text-brand-dark/80 leading-relaxed flex items-start gap-2">
                          <span className="text-brand-dark font-bold mt-1">•</span>
                          <span>{trimmedItem}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {!selectedMentor.bio && (
                <p className="text-brand-dark/60 italic">Belum ada deskripsi untuk mentor ini.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
