import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Check, Loader, Building2, Mail, BadgeDollarSign } from 'lucide-react';
import { apiFetch } from './apiClient';

const AdvertiserSignup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        industry: '',
        budget: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await apiFetch('/api/signup/advertiser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Signup failed');

            setStep(3); // Success
        } catch (error) {
            console.error(error);
            alert("Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0B0F0C] via-[#0F1511] to-[#0D1410] text-white flex flex-col">

            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute w-96 h-96 bg-[#9FE870] rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-[#5BC299] rounded-full blur-3xl bottom-0 right-0 animate-pulse delay-1000"></div>
            </div>

            {/* Top Bar */}
            <div className="relative z-10 p-6 flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors border border-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-lg flex items-center justify-center">
                        <span className="text-[#0E120F] font-bold text-sm">M</span>
                    </div>
                    <span className="font-semibold">Advertiser Sign Up</span>
                </div>
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-lg">

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-3 mb-10">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s
                                    ? 'bg-[#9FE870] text-[#0E120F] shadow-lg shadow-[#9FE870]/50'
                                    : 'bg-white/10 text-[#C3CFC8] border border-white/20'
                                    }`}>
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-12 h-1 rounded-full transition-all ${step > s ? 'bg-[#9FE870]' : 'bg-white/20'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Company Info */}
                    {step === 1 && (
                        <div className="animate-fadeIn bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Briefcase size={36} className="text-[#0E120F]" />
                            </div>
                            <h1 className="text-4xl font-bold text-center mb-3">Welcome to Matcha</h1>
                            <p className="text-[#C3CFC8] text-center mb-10">Let's set up your AI-powered campaign agent.</p>

                            <div className="space-y-5">
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-[#C3CFC8] mb-2 font-medium">
                                        <Building2 size={16} />
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Acme Inc."
                                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-[#7C8481] focus:border-[#9FE870] focus:outline-none focus:ring-2 focus:ring-[#9FE870]/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-[#C3CFC8] mb-2 font-medium">
                                        <Mail size={16} />
                                        Work Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@company.com"
                                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-[#7C8481] focus:border-[#9FE870] focus:outline-none focus:ring-2 focus:ring-[#9FE870]/20 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.companyName || !formData.email}
                                className="w-full mt-8 bg-[#9FE870] hover:bg-[#8FE060] text-[#0E120F] font-bold py-4 rounded-xl shadow-lg shadow-[#9FE870]/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Preferences */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="animate-fadeIn bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <BadgeDollarSign size={36} className="text-[#0E120F]" />
                            </div>
                            <h1 className="text-4xl font-bold text-center mb-3">Campaign Preferences</h1>
                            <p className="text-[#C3CFC8] text-center mb-10">Tell us about your marketing goals.</p>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm text-[#C3CFC8] mb-2 font-medium">Industry</label>
                                    <select
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#9FE870] focus:outline-none focus:ring-2 focus:ring-[#9FE870]/20 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select an industry</option>
                                        <option value="fashion">Fashion & Beauty</option>
                                        <option value="tech">Tech & Gadgets</option>
                                        <option value="food">Food & Beverage</option>
                                        <option value="health">Health & Wellness</option>
                                        <option value="finance">Finance & Crypto</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-[#C3CFC8] mb-2 font-medium">Monthly Budget (USD)</label>
                                    <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        placeholder="5000"
                                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-[#7C8481] focus:border-[#9FE870] focus:outline-none focus:ring-2 focus:ring-[#9FE870]/20 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.industry || !formData.budget}
                                className="w-full mt-8 bg-[#9FE870] hover:bg-[#8FE060] text-[#0E120F] font-bold py-4 rounded-xl shadow-lg shadow-[#9FE870]/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader size={20} className="animate-spin" />
                                        Creating Account...
                                    </>
                                ) : 'Create Account'}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="text-center animate-fadeIn bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                                <Check size={48} className="text-[#0E120F]" strokeWidth={3} />
                            </div>
                            <h1 className="text-4xl font-bold mb-3">You're All Set!</h1>
                            <p className="text-[#C3CFC8] mb-10 text-lg">Your AI agent is ready to start matching with creators.</p>

                            <button
                                onClick={() => navigate('/advertiser/overview')}
                                className="w-full bg-[#9FE870] hover:bg-[#8FE060] text-[#0E120F] font-bold py-4 rounded-xl shadow-lg shadow-[#9FE870]/30 transition-all hover:scale-105"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AdvertiserSignup;
