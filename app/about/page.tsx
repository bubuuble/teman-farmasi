import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-cream selection:bg-brand-pink selection:text-white">
      <Navbar />
      
      {/* Header */}
      <div className="pt-40 pb-20 px-6 text-center max-w-4xl mx-auto">
         <span className="inline-block px-4 py-2 rounded-full bg-brand-pink/20 text-brand-dark font-bold text-sm mb-6 uppercase tracking-wider">
            About Teman Farmasi
         </span>
         <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-brand-dark mb-6 tracking-tight">
            Empowering the Next Generation of <span className="text-brand-pink">Pharmacists</span>
         </h1>
         <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
            We are the largest pharmacy research coaching platform in Indonesia, bridging the gap between academic theory and practical research skills.
         </p>
      </div>

      {/* Stats Section (Colorful) */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-transparent md:divide-gray-100">
            {[
                { number: "2025", label: "Founded", color: "text-brand-pink" },
                { number: "2,000+", label: "Students", color: "text-brand-blue" },
                { number: "167+", label: "Campuses", color: "text-brand-yellow" },
                { number: "50+", label: "Mentors", color: "text-brand-teal" }
            ].map((stat, i) => (
                <div key={i} className="group cursor-default">
                    <h3 className={`font-heading text-5xl font-extrabold mb-2 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                        {stat.number}
                    </h3>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">{stat.label}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Image with Blob Background */}
            <div className="relative">
                <div className="absolute -left-10 -bottom-10 w-full h-full bg-brand-yellow rounded-[3rem] -z-10 opacity-50"></div>
                <div className="relative h-[500px] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl">
                    <Image 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                        alt="Team working" 
                        fill 
                        className="object-cover"
                    />
                </div>
            </div>

            <div>
                <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-dark mb-8">
                    Our <span className="text-brand-blue">Mission</span>
                </h2>
                <div className="space-y-6 text-gray-500 text-lg leading-relaxed">
                    <p>
                        Teman Farmasi was born from a simple observation: many pharmacy students struggle not because they lack knowledge, but because they lack <strong className="text-brand-dark">practical guidance</strong> in research methodology and data analysis.
                    </p>
                    <p>
                        We provide a supportive ecosystem where students can access private coaching, e-books, and a community of peers to ensure they graduate on time with <strong className="text-brand-dark">high-quality research</strong>.
                    </p>
                </div>
                
                {/* Checkmarks */}
                <ul className="mt-8 space-y-4">
                    {["Personalized Mentorship", "Comprehensive E-Library", "24/7 Support Group"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 font-bold text-brand-dark">
                            <div className="w-6 h-6 rounded-full bg-brand-teal flex items-center justify-center text-white text-xs">✓</div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}