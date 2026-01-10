import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Star } from 'lucide-react';

// Hardcoded paths to our local seeded videos for the marquee background
const VIDEO_PATHS = [
    "/videos/v15044gf0000d4r0q87og65opbb0e2kg.MP4",
    "/videos/v15044gf0000d4thr1vog65r1fgmtdi0.MP4",
    "/videos/v15044gf0000d504utfog65vf158i3d0.MP4",
    "/videos/v15044gf0000d507847og65hqin6u2n0.MP4",
    "/videos/v15044gf0000d55cqdvog65l9rkeu560.MP4",
    "/videos/v15044gf0000d59cppvog65omdf7bqk0.MP4",
    "/videos/v15044gf0000d5cnpjvog65vm2j05ec0.MP4",
    "/videos/v15044gf0000d5dv94vog65vaiv83nb0.MP4"
];

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#F3F4F6] font-[Inter]">

            {/* Background Video Marquee */}
            {/* We create a tilted, scrolling grid of videos to match the reference vibe */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-90 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] flex gap-6 rotate-[-6deg] opacity-60 grayscale-[30%] blur-[1px]">
                    {/* Column 1 - Slow Scroll Up */}
                    <div className="flex flex-col gap-6 w-1/4 animate-marquee-up-slow">
                        {[...VIDEO_PATHS, ...VIDEO_PATHS].map((src, i) => (
                            <div key={`c1-${i}`} className="w-full aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-lg border-4 border-white/50">
                                <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    {/* Column 2 - Scroll Down */}
                    <div className="flex flex-col gap-6 w-1/4 animate-marquee-down">
                        {[...VIDEO_PATHS.reverse(), ...VIDEO_PATHS].map((src, i) => (
                            <div key={`c2-${i}`} className="w-full aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-lg border-4 border-white/50">
                                <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    {/* Column 3 - Scroll Up Fast */}
                    <div className="flex flex-col gap-6 w-1/4 animate-marquee-up">
                        {[...VIDEO_PATHS, ...VIDEO_PATHS].map((src, i) => (
                            <div key={`c3-${i}`} className="w-full aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-lg border-4 border-white/50">
                                <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    {/* Column 4 - Scroll Down Slow */}
                    <div className="flex flex-col gap-6 w-1/4 animate-marquee-down-slow">
                        {[...VIDEO_PATHS.reverse(), ...VIDEO_PATHS].map((src, i) => (
                            <div key={`c4-${i}`} className="w-full aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-lg border-4 border-white/50">
                                <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/80 to-transparent w-full h-full pointer-events-none" />

            {/* Main Content Container */}
            <div className="relative z-20 container mx-auto px-6 min-h-screen flex items-center">

                {/* Glassmorphism Hero Card */}
                <div className="max-w-xl bg-white/40 backdrop-blur-2xl border border-white/60 p-10 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] animate-fade-in-up">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide uppercase">
                        <Star size={12} fill="currentColor" />
                        AI-Powered Marketplace
                    </div>

                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
                        The future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            effortless deals.
                        </span>
                    </h1>

                    <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                        Matcha is your autonomous AI agent for brand deals.
                        Plan, negotiate, and get paid in stablecoins instantly.
                        Zero friction.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-10">
                        <button
                            onClick={() => navigate('/signup/creator')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Get Started Free <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => navigate('/signup/advertiser')}
                            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-8 rounded-full border border-slate-200 shadow-sm transition-all hover:rotate-1 flex items-center justify-center gap-2"
                        >
                            View Demo <Play size={18} className="fill-slate-700" />
                        </button>
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center gap-4 pt-6 border-t border-slate-200/60">
                        <div className="flex -space-x-3">
                            <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
                            <img src="https://i.pravatar.cc/100?img=5" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
                            <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">+2k</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex text-yellow-500 text-xs mb-0.5">
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                            </div>
                            <span className="text-xs font-medium text-slate-500">Loved by 10,000+ creators</span>
                        </div>
                    </div>

                </div>

            </div>

            {/* Navbar (Absolute) */}
            <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm">
                    <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold text-xs">M</span>
                    </div>
                    <span className="font-bold text-slate-800 tracking-tight">Matcha</span>
                </div>

                <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600 bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/40 shadow-sm">
                    <a href="#" className="hover:text-indigo-600 transition-colors">Features</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">How it Works</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a>
                </div>

                <div className="flex gap-3">
                    <button className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm transition-all hover:bg-white">Log in</button>
                    <button className="text-sm font-semibold text-white bg-slate-900 hover:bg-black px-4 py-2 rounded-full shadow-lg transition-all hover:scale-105">Get App</button>
                </div>
            </nav>

            {/* CSS for Scrolling Marquee */}
            <style>{`
                @keyframes scrollUp {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                @keyframes scrollDown {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-marquee-up { animation: scrollUp 40s linear infinite; }
                .animate-marquee-up-slow { animation: scrollUp 60s linear infinite; }
                .animate-marquee-down { animation: scrollDown 45s linear infinite; }
                .animate-marquee-down-slow { animation: scrollDown 65s linear infinite; }
                .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

        </div>
    );
};

export default LandingPage;
