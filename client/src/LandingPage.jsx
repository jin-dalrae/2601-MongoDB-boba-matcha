import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp, Users, DollarSign } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0B0F0C] via-[#0F1511] to-[#0D1410] text-white">

            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute w-96 h-96 bg-[#9FE870] rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-[#5BC299] rounded-full blur-3xl bottom-0 right-0 animate-pulse delay-1000"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 px-8 py-8 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-[#0E120F] font-bold text-lg">M</span>
                    </div>
                    <span className="font-bold text-white text-xl tracking-tight">Matcha</span>
                </div>

                <div className="hidden md:flex gap-8 text-sm font-medium text-[#C3CFC8]">
                    <a href="#features" className="hover:text-[#9FE870] transition-colors">Features</a>
                    <a href="#how" className="hover:text-[#9FE870] transition-colors">How it Works</a>
                    <a href="#pricing" className="hover:text-[#9FE870] transition-colors">Pricing</a>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/advertiser/overview')}
                        className="text-sm font-medium text-white hover:text-[#9FE870] px-4 py-2 rounded-lg transition-all"
                    >
                        Log in
                    </button>
                    <button
                        onClick={() => navigate('/signup/advertiser')}
                        className="text-sm font-semibold text-[#0E120F] bg-[#9FE870] hover:bg-[#8FE060] px-6 py-2 rounded-lg shadow-lg shadow-[#9FE870]/30 transition-all hover:scale-105"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-20 container mx-auto px-8 pt-24 pb-40">
                <div className="max-w-4xl mx-auto text-center">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-[#9FE870]/10 border border-[#9FE870]/20 text-[#9FE870] text-sm font-semibold backdrop-blur-sm">
                        <Sparkles size={16} className="animate-pulse" />
                        AI-Powered Brand Deals
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                        Autonomous deals.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9FE870] via-[#7FD85F] to-[#5BC299] animate-gradient">
                            Zero friction.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl text-[#C3CFC8] mb-12 leading-relaxed max-w-2xl mx-auto">
                        Let AI agents handle negotiations, contracts, and payments. Focus on creating content while Matcha handles the rest.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <button
                            onClick={() => navigate('/signup/advertiser')}
                            className="group bg-[#9FE870] hover:bg-[#8FE060] text-[#0E120F] font-bold py-4 px-8 rounded-xl shadow-lg shadow-[#9FE870]/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Start Free Trial
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/signup/creator')}
                            className="bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-xl border border-white/20 transition-all hover:border-[#9FE870]/50"
                        >
                            I'm a Creator
                        </button>
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center justify-center gap-6 text-sm text-[#C3CFC8]">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-[#9FE870]" />
                            <span>10,000+ creators</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-[#C3CFC8]"></div>
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-[#9FE870]" />
                            <span>$5M+ paid out</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-[#C3CFC8]"></div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#9FE870]" />
                            <span>98% satisfaction</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative z-20 container mx-auto px-8 pb-40">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">

                        {/* Feature 1 */}
                        <div className="group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                                <Zap size={28} className="text-[#0E120F]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">AI Negotiations</h3>
                            <p className="text-[#C3CFC8] leading-relaxed">
                                Your personal AI agent negotiates the best deals on your behalf, 24/7.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                                <Shield size={28} className="text-[#0E120F]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Smart Contracts</h3>
                            <p className="text-[#C3CFC8] leading-relaxed">
                                Automated, transparent contracts ensure fair terms for everyone.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                                <DollarSign size={28} className="text-[#0E120F]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Instant Payouts</h3>
                            <p className="text-[#C3CFC8] leading-relaxed">
                                Get paid in stablecoins instantly when content is approved.
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            <style>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradient 3s ease infinite;
                }
            `}</style>

        </div>
    );
};

export default LandingPage;
