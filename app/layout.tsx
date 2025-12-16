import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Montserrat } from "next/font/google";
import "./globals.css";

// Heading Font
const montserrat = Montserrat({ 
  subsets: ["latin"], 
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '600', '700', '800'] 
});

// Body Font
const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700'] 
});

export const metadata: Metadata = {
  title: "Teman Farmasi | Bimbingan Riset Farmasi Privat",
  description: "Platform bimbingan riset farmasi terbesar di Indonesia.",
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${plusJakarta.variable} ${montserrat.variable} font-sans bg-brand-cream text-brand-dark antialiased`}>
        {children}
      </body>
    </html>
  );
}