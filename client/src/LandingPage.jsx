import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Rocket, ArrowRight, Zap, Shield, DollarSign } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden relative">

            {/* Animated Background Gradient */}
            <div
                className="pointer-events-none fixed inset-0 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(159,232,112,0.06), transparent 40%)`
                }}
            />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6bS0xIDFIOXY1OGg1OFYxeiIgZmlsbD0iIzE1MTUxNSIvPjwvZz48L3N2Zz4=')] opacity-40" />

            {/* Floating Orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#9FE870] rounded-full blur-[120px] opacity-20 animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5BC299] rounded-full blur-[150px] opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#9FE870] to-[#5BC299] rounded-full blur-[200px] opacity-10 -translate-x-1/2 -translate-y-1/2" />

            {/* Navigation */}
            <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-lg flex items-center justify-center">
                        <span className="text-black font-bold text-sm">M</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">Matcha</span>
                </div>
                <div className="flex gap-3">
                    <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2">Log In</button>
                    <button className="text-sm font-medium bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center text-center px-4 pt-16 pb-32">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-[#9FE870]/30 bg-[#9FE870]/5 backdrop-blur-sm">
                    <Zap size={14} className="text-[#9FE870]" />
                    <span className="text-[#9FE870] text-xs font-medium tracking-wide uppercase">AI-Powered Ad Marketplace</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-[1.1] max-w-5xl">
                    Where AI Negotiates.
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9FE870] via-[#7DD87F] to-[#5BC299]">
                        Creators Create.
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-16 leading-relaxed">
                    Matcha automates brand-creator deals with autonomous agents.
                    Advertisers get performance. Creators get instant stablecoin payouts via <span className="text-[#9FE870] font-medium">x402 protocol</span>.
                </p>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

                    {/* Advertiser Card */}
                    <div
                        className="group relative overflow-hidden bg-gradient-to-b from-[#161616] to-[#0E0E0E] border border-[#252525] p-8 rounded-3xl text-left cursor-pointer transition-all duration-300 hover:border-[#9FE870]/50 hover:shadow-[0_0_60px_rgba(159,232,112,0.1)] hover:-translate-y-1"
                        onClick={() => navigate('/signup/advertiser')}
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#9FE870] opacity-0 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:opacity-20 transition-opacity duration-500"></div>

                        <div className="relative z-10">
                            <div className="mb-6 w-14 h-14 bg-gradient-to-br from-[#232323] to-[#1A1A1A] border border-[#333] rounded-2xl flex items-center justify-center group-hover:border-[#9FE870]/50 group-hover:shadow-[0_0_20px_rgba(159,232,112,0.2)] transition-all duration-300">
                                <Layers size={24} className="text-[#9FE870]" />
                            </div>

                            <h3 className="text-2xl font-bold mb-3">I'm an Advertiser</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">Launch campaigns, set your rules, and let AI agents negotiate the best deals for your brand.</p>

                            <div className="flex items-center gap-2 text-[#9FE870] font-medium group-hover:gap-3 transition-all duration-300">
                                Start Campaign <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Creator Card */}
                    <div
                        className="group relative overflow-hidden bg-gradient-to-b from-[#161616] to-[#0E0E0E] border border-[#252525] p-8 rounded-3xl text-left cursor-pointer transition-all duration-300 hover:border-[#5BC299]/50 hover:shadow-[0_0_60px_rgba(91,194,153,0.1)] hover:-translate-y-1"
                        onClick={() => navigate('/signup/creator')}
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5BC299] opacity-0 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:opacity-20 transition-opacity duration-500"></div>

                        <div className="relative z-10">
                            <div className="mb-6 w-14 h-14 bg-gradient-to-br from-[#232323] to-[#1A1A1A] border border-[#333] rounded-2xl flex items-center justify-center group-hover:border-[#5BC299]/50 group-hover:shadow-[0_0_20px_rgba(91,194,153,0.2)] transition-all duration-300">
                                <Rocket size={24} className="text-[#5BC299]" />
                            </div>

                            <h3 className="text-2xl font-bold mb-3">I'm a Creator</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">Connect your socials, get matched automatically, and receive instant stablecoin payouts.</p>

                            <div className="flex items-center gap-2 text-[#5BC299] font-medium group-hover:gap-3 transition-all duration-300">
                                Join Network <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Features Strip */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#9FE870]/10 flex items-center justify-center mb-4">
                            <Zap size={20} className="text-[#9FE870]" />
                        </div>
                        <h4 className="font-semibold mb-1">AI Negotiation</h4>
                        <p className="text-sm text-gray-500">Autonomous agents handle all deal-making</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#5BC299]/10 flex items-center justify-center mb-4">
                            <DollarSign size={20} className="text-[#5BC299]" />
                        </div>
                        <h4 className="font-semibold mb-1">Instant Payouts</h4>
                        <p className="text-sm text-gray-500">USDC payments via x402 protocol</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Shield size={20} className="text-white" />
                        </div>
                        <h4 className="font-semibold mb-1">On-Chain Audit</h4>
                        <p className="text-sm text-gray-500">Transparent performance verification</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 p-8 text-center border-t border-[#1A1A1A]">
                <span className="text-gray-600 text-sm">&copy; 2026 Matcha Protocol. Built for the Agentic Web.</span>
            </footer>
        </div>
    );
};

export default LandingPage;
