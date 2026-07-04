import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import NavigationProgress from "@/app/components/NavigationProgress";
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
    icon: '/images/logo3.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XGX1F950RZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XGX1F950RZ');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning className={`${plusJakarta.variable} ${montserrat.variable} font-sans bg-brand-cream text-brand-dark antialiased`}>
        <NavigationProgress />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
