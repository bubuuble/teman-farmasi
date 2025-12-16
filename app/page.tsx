import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Programs from "./components/Programs";
import Mentors from "./components/Mentors";
import Testimonials from "./components/Testimonials";
import Blog from "./components/Blog";
import Footer from "./components/Footer";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-cream selection:bg-brand-pink selection:text-brand-dark">
      <Navbar />
      <Hero />
      <Categories />
      
      {/* Programs Preview */}
      <div className="relative">
        <Programs />
        {/* Button: Pink */}
        <div className="text-center pb-12 -mt-4 relative z-10">
             <Link href="/programs" className="inline-flex items-center gap-2 bg-brand-pink text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-brand-yellow hover:text-brand-dark transition-all shadow-lg">
                View All Programs <FaArrowRight size={12}/>
             </Link>
        </div>
      </div>

      {/* Mentors Preview */}
      <div className="relative border-t border-brand-pink/10">
        <Mentors />
         {/* Button: Yellow Outline */}
        <div className="text-center pb-12 -mt-16 relative z-10">
             <Link href="/mentors" className="inline-flex items-center gap-2 border-2 border-brand-yellow text-brand-dark px-8 py-3 rounded-full font-bold text-sm hover:bg-brand-yellow hover:text-white transition-all">
                Meet All Mentors <FaArrowRight size={12}/>
             </Link>
        </div>
      </div>

      <Testimonials />
      
      {/* Blog Preview */}
      <div className="relative">
        <Blog />
        {/* Button: Text Link with Pink Hover */}
        <div className="text-center pb-20 -mt-16 relative z-10">
             <Link href="/blog" className="inline-flex items-center gap-2 text-brand-dark font-bold border-b-2 border-brand-dark hover:text-brand-pink hover:border-brand-pink transition-colors">
                Read More Stories <FaArrowRight size={12}/>
             </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}