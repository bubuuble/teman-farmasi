// app/components/Testimonials.tsx
"use client";

import Image from "next/image";
import { FaVideo, FaPhone, FaEllipsisV, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import { urlFor } from '@/lib/sanity';
import { useState } from 'react';

type SanityImage = {
  _type: 'image';
  asset: { _ref: string; _type: 'reference' };
};

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  text: string;
  image?: SanityImage;
  screenshotImage?: SanityImage; // Screenshot WhatsApp asli
  cardColor?: string;
}

interface Props {
  testimonials: Testimonial[];
  isFullPage?: boolean;
}

const colorThemes: Record<string, {
  cardBg: string;
  border: string;
  headerBg: string;
  headerText: string;
  headerSubText: string;
  sendBtnBg: string;
  sendBtnText: string;
  chatBubbleBg: string;
  inputBg: string;
  roleText: string;
}> = {
  'bg-brand-yellow': {
    cardBg: 'bg-[#FDF9F0]',
    border: 'border-brand-yellow/50',
    headerBg: 'bg-brand-yellow',
    headerText: 'text-brand-dark',
    headerSubText: 'text-brand-dark/60',
    sendBtnBg: 'bg-brand-yellow',
    sendBtnText: 'text-brand-dark',
    chatBubbleBg: 'bg-white',
    inputBg: 'bg-yellow-50/70',
    roleText: 'text-amber-600',
  },
  'bg-brand-pink': {
    cardBg: 'bg-pink-50/40',
    border: 'border-brand-pink/30',
    headerBg: 'bg-brand-pink',
    headerText: 'text-brand-cream',
    headerSubText: 'text-pink-100 opacity-90',
    sendBtnBg: 'bg-brand-pink',
    sendBtnText: 'text-white',
    chatBubbleBg: 'bg-white',
    inputBg: 'bg-pink-100/30',
    roleText: 'text-brand-pink',
  },
  'bg-brand-blue': {
    cardBg: 'bg-blue-50/40',
    border: 'border-brand-blue/40',
    headerBg: 'bg-brand-blue',
    headerText: 'text-white',
    headerSubText: 'text-blue-100 opacity-90',
    sendBtnBg: 'bg-brand-blue',
    sendBtnText: 'text-white',
    chatBubbleBg: 'bg-white',
    inputBg: 'bg-blue-100/30',
    roleText: 'text-brand-blue',
  }
};

const defaultTheme = colorThemes['bg-brand-pink'];

export default function Testimonials({ testimonials = [], isFullPage = false }: Props) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const displayItems = isFullPage ? testimonials : testimonials.slice(0, 3);

  return (
    <>
      <div className={`
        ${isFullPage 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6" 
          : "flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 pb-20 pt-10"
        }
      `}>
        {displayItems.map((item, idx) => {
          const imageUrl = item.image ? urlFor(item.image).width(100).height(100).url() : null;
          const screenshotUrl = item.screenshotImage ? urlFor(item.screenshotImage).width(800).url() : null;
          const theme = colorThemes[item.cardColor || 'bg-brand-pink'] || defaultTheme;
          
          const transformations = !isFullPage ? [
            "md:rotate-[-8deg] md:translate-y-8 md:translate-x-4 z-0 scale-90",
            "md:rotate-0 z-20 scale-100 shadow-2xl",
            "md:rotate-[8deg] md:translate-y-8 md:-translate-x-4 z-0 scale-90"
          ] : ["", "", ""];

          return (
            <div 
              key={item._id} 
              className={`flex flex-col ${theme.cardBg} w-full rounded-[1.5rem] shadow-lg border-2 ${theme.border} transition-all duration-300 hover:z-30 hover:scale-[1.02] h-full relative
              ${!isFullPage ? transformations[idx % 3] : ""}`}
            >
              {/* Badge "Bukti Asli" - Sticky di pojok kanan atas */}
              {screenshotUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScreenshot(screenshotUrl);
                  }}
                  className="absolute top-3 right-3 z-50 bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-green-600 transition-all hover:scale-105"
                  style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                >
                  <FaCheckCircle className="text-[11px]" />
                  <span>BUKTI ASLI</span>
                </button>
              )}

              {/* Header WhatsApp */}
              <div className={`p-3 px-4 flex items-center justify-between flex-shrink-0 rounded-t-[1.5rem] ${theme.headerBg} ${theme.headerText}`}>
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] bg-gray-400">
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13px] font-bold truncate leading-tight">{item.name}</h4>
                    <p className={`text-[10px] ${theme.headerSubText}`}>online</p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs opacity-80 flex-shrink-0">
                  <FaVideo /> <FaPhone /> <FaEllipsisV />
                </div>
              </div>

              {/* Chat Body */}
              <div className={`p-4 relative ${theme.cardBg} flex-grow flex flex-col justify-center overflow-hidden`}>
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')` }}>
                </div>

                <div className="relative bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm self-start max-w-[95%] z-10">
                  <span className={`block text-[10px] font-bold ${theme.roleText} mb-1.5 uppercase tracking-wide`}>
                    {item.role}
                  </span>
                  <p className="text-[13.5px] text-gray-700 leading-relaxed pr-4">
                    &quot;{item.text}&quot;
                  </p>
                  <div className="text-right mt-1">
                    <span className="text-[9px] text-gray-400 font-medium">12:45</span>
                  </div>
                  <div className="absolute -left-2 top-0 w-0 h-0 border-r-[10px] border-r-white border-b-[10px] border-b-transparent"></div>
                </div>
              </div>
              
              {/* Footer Input */}
              <div className={`${theme.inputBg} p-3 flex items-center gap-2 flex-shrink-0 mt-auto rounded-b-[1.5rem] overflow-hidden`}>
                <div className="flex-1 bg-white rounded-full py-2 px-4 text-[12px] text-gray-400 shadow-sm">
                  Ketik pesan...
                </div>
                <div className={`w-9 h-9 ${theme.sendBtnBg} ${theme.sendBtnText} rounded-full flex items-center justify-center text-xs shadow-md flex-shrink-0`}>
                  <FaPaperPlane />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Screenshot */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative w-full max-w-md animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            
            {/* Header Section */}
            <div className="mb-4 flex items-center justify-between px-2">
              {/* Badge Verified */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
                <FaCheckCircle className="text-sm" />
                <span>TESTIMONI ASLI</span>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/20 hover:scale-110"
                aria-label="Close"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            {/* Phone Frame */}
            <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-[3rem] shadow-2xl p-3 mx-auto border-4 border-gray-800">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-10 flex items-center justify-center gap-2">
                <div className="w-14 h-1.5 bg-gray-800 rounded-full mt-2"></div>
              </div>
              
              {/* Screenshot Container */}
              <div className="relative rounded-[2.5rem] overflow-hidden bg-white mt-2">
                <Image
                  src={selectedScreenshot}
                  alt="Screenshot testimoni asli"
                  width={800}
                  height={1200}
                  className="w-full h-auto"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-700 rounded-full"></div>
            </div>

            {/* Footer Info */}
            <div className="mt-6 text-center">
              <p className="text-white/90 text-sm font-medium mb-2">
                Chat WhatsApp Asli dari Mahasiswa
              </p>
              <p className="text-white/60 text-xs">
                Tap di luar untuk menutup
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .7;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}