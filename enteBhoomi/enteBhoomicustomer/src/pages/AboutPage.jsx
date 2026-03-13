import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#fafcf8] font-sans relative">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 z-50 flex items-center justify-center gap-2 bg-black/40 hover:bg-[#5bab00] text-white px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/20 shadow-lg"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold text-sm hidden sm:block">Back</span>
            </button>

            {/* Hero Section */}
            <section className="bg-[#151d0c] relative overflow-hidden py-32 md:py-44">
                <div className="absolute inset-0 bg-[url('/Tropical%20coconut%20plantation_.jpeg')] bg-cover bg-center bg-no-repeat"></div>
                <div className="absolute inset-0 bg-black/40"></div> {/* Subtle dark overlay for text readability without the green shade */}
                <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-10 text-center">
                    <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#5bab00]/20 px-4 py-1.5 text-sm font-bold text-[#5bab00] backdrop-blur-md border border-[#5bab00]/30">
                        <span className="material-symbols-outlined text-sm">eco</span>
                        Our Story
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 drop-shadow-lg">
                        About <span className="text-[#5bab00]">Ente Bhoomi</span>
                    </h1>
                    <p className="mx-auto max-w-3xl text-lg md:text-xl font-medium text-white/90 leading-relaxed drop-shadow-md">
                        A Kerala-based agricultural initiative founded by a collective of farming experts, professionals, and agriculture enthusiasts who share a common vision.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="px-4 py-20 lg:px-10 border-t border-[#eef4e6]">
                <div className="mx-auto max-w-5xl">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                        <div className="space-y-6 text-[#4b5f3e] text-lg leading-relaxed">
                            <h2 className="text-3xl font-black text-[#151d0c] tracking-tight mb-4">Our Vision</h2>
                            <p className="font-bold text-[#151d0c] text-xl leading-snug">
                                Ente Bhoomi (LLP) is an initiative founded to make farming profitable, sustainable, and community-driven.
                            </p>
                            <p>
                                For the past two years, we have been building a grassroots network across Panchayats, Municipalities, and Corporations in Kerala, bringing together individuals who believe in the power of productive land and responsible agriculture.
                            </p>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                            <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80" alt="Sustainable Farming" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
                                <span className="font-bold text-2xl tracking-tight">Community Driven Agriculture</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                        <div className="order-2 lg:order-1 relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                            <img src="/254ff1db7128864fe8f4da0993bd23c2.jpg" alt="Farm to Table" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
                                <span className="font-bold text-2xl tracking-tight">Farm to Table</span>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-6 text-[#4b5f3e] text-lg leading-relaxed">
                            <h2 className="text-3xl font-black text-[#151d0c] tracking-tight mb-4">Our Mission</h2>
                            <p>
                                Our mission is to identify unused and underutilized land in every ward and transform it into productive farms through scientific and sustainable farming practices.
                            </p>
                            <p>
                                By appointing Ward Coordinators and establishing Panchayat-level collection points, we ensure organized cultivation, quality control, and efficient distribution.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-xl border border-[#eef4e6] mb-20 text-center space-y-6">
                        <span className="material-symbols-outlined text-5xl text-[#5bab00] mb-4">handshake</span>
                        <h2 className="text-3xl font-black text-[#151d0c] tracking-tight">Connecting the Ecosystem</h2>
                        <p className="max-w-3xl mx-auto text-[#4b5f3e] text-lg leading-relaxed">
                            Through our digital platform and mobile application, we directly connect farmers and consumers — delivering safe, chemical-free, and trustworthy agricultural products while ensuring stable income opportunities for farmers.
                        </p>
                        <p className="max-w-3xl mx-auto text-[#4b5f3e] text-lg leading-relaxed">
                            Ente Bhoomi is committed to creating employment, attracting youth to agriculture, and building an integrated agricultural ecosystem across Kerala through franchise models, value addition units, cold storage facilities, and logistics networks.
                        </p>
                    </div>

                    <div className="text-center bg-gradient-to-br from-[#1a230f] to-[#151d0c] p-12 md:p-20 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <span className="material-symbols-outlined text-9xl text-[#5bab00]">forest</span>
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6 relative z-10">We Believe</h3>
                        <p className="text-2xl md:text-4xl font-black text-white leading-snug relative z-10 max-w-4xl mx-auto">
                            "The <span className="text-[#5bab00]">Earth</span> is our responsibility — and <span className="text-[#5bab00]">agriculture</span> is our future. 🌱"
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
