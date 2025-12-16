import { FaUserTie, FaFlask, FaBook, FaWhatsapp } from 'react-icons/fa';

// Mapped from PDF Features to Edtech Category Style
const features = [
    { name: "Private Coaching", icon: FaUserTie, color: "bg-brand-yellow" },
    { name: "Research Tracks", icon: FaFlask, color: "bg-brand-blue" },
    { name: "E-Book Access", icon: FaBook, color: "bg-brand-pink" },
    { name: "Instant Booking", icon: FaWhatsapp, color: "bg-brand-yellow" },
];

export default function Categories() {
    return (
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <h2 className="text-center font-heading text-3xl font-bold text-brand-dark mb-12">
                Priority Features
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {features.map((feat, i) => (
                    <div key={i} className={`${feat.color} rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-transform duration-300 relative group overflow-hidden`}>
                        <div className="relative z-10">
                            <h3 className="font-bold text-brand-dark mb-4">{feat.name}</h3>
                            <div className="w-12 h-12 mx-auto bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center text-brand-dark">
                                <feat.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}