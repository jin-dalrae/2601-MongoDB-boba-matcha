import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Check, Loader } from 'lucide-react';

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

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In real app: POST to /api/users with role: 'Advertiser'
        console.log('Advertiser signup:', formData);

        setStep(3); // Success
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0E0F0F] via-[#161818] to-[#0E0F0F] text-white flex flex-col">
            {/* Top Bar */}
            <div className="p-6 flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-[#232626] transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <span className="text-sm text-gray-400">Advertiser Sign Up</span>
            </div>

            <div className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md">

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`w-3 h-3 rounded-full transition-all ${step >= s ? 'bg-[#9FE870]' : 'bg-[#232626]'}`}></div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Briefcase size={32} className="text-black" />
                            </div>
                            <h1 className="text-3xl font-bold text-center mb-2">Welcome, Advertiser</h1>
                            <p className="text-gray-400 text-center mb-8">Let's set up your AI-powered campaign agent.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Your Brand"
                                        className="w-full bg-[#1E2020] border border-[#232626] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#9FE870] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Work Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@company.com"
                                        className="w-full bg-[#1E2020] border border-[#232626] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#9FE870] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.companyName || !formData.email}
                                className="w-full mt-8 bg-[#9FE870] text-black font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="animate-fadeIn">
                            <h1 className="text-3xl font-bold text-center mb-2">Campaign Preferences</h1>
                            <p className="text-gray-400 text-center mb-8">Tell us about your marketing goals.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Industry</label>
                                    <select
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        className="w-full bg-[#1E2020] border border-[#232626] rounded-lg px-4 py-3 text-white focus:border-[#9FE870] focus:outline-none transition-colors appearance-none"
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
                                    <label className="block text-sm text-gray-400 mb-2">Monthly Budget (USD)</label>
                                    <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        placeholder="5000"
                                        className="w-full bg-[#1E2020] border border-[#232626] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#9FE870] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.industry || !formData.budget}
                                className="w-full mt-8 bg-[#9FE870] text-black font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader size={20} className="animate-spin" /> : 'Create Account'}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="text-center animate-fadeIn">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={40} className="text-black" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">You're In!</h1>
                            <p className="text-gray-400 mb-8">Your agent is ready to start matching with creators.</p>

                            <button
                                onClick={() => navigate('/advertiser/overview')}
                                className="w-full bg-[#9FE870] text-black font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdvertiserSignup;
