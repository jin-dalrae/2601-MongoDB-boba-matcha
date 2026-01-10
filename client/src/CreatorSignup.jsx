import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Check, Loader, Link2, Instagram, Youtube } from 'lucide-react';

const CreatorSignup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        handle: '',
        platform: '',
        minRate: ''
    });
    const [connectedPlatforms, setConnectedPlatforms] = useState([]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const connectPlatform = (platform) => {
        // Simulate OAuth connection
        setLoading(true);
        setTimeout(() => {
            setConnectedPlatforms([...connectedPlatforms, platform]);
            setLoading(false);
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In real app: POST to /api/users with role: 'Creator'
        console.log('Creator signup:', formData, connectedPlatforms);

        setStep(4); // Success
        setLoading(false);
    };

    const platforms = [
        { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#00F2EA' },
        { id: 'instagram', name: 'Instagram', icon: <Instagram size={20} />, color: '#E1306C' },
        { id: 'youtube', name: 'YouTube', icon: <Youtube size={20} />, color: '#FF0000' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0E0F0F] via-[#161818] to-[#0E0F0F] text-white flex flex-col">
            {/* Top Bar */}
            <div className="p-6 flex items-center gap-4">
                <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="p-2 rounded-full hover:bg-[#232626] transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <span className="text-sm text-gray-400">Creator Sign Up</span>
            </div>

            <div className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md">

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`w-3 h-3 rounded-full transition-all ${step >= s ? 'bg-[#5BC299]' : 'bg-[#232626]'}`}></div>
                        ))}
                    </div>

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#5BC299] to-[#3A8F78] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Rocket size={32} className="text-black" />
                            </div>
                            <h1 className="text-3xl font-bold text-center mb-2">Join as Creator</h1>
                            <p className="text-gray-400 text-center mb-8">Get matched with brands and receive instant payouts.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Creator Name"
                                        className="w-full bg-[#1E2020] border border-[#232626] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#5BC299] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@email.com"
                                        className="w-full bg-[#1E2020] border border-[#232626] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#5BC299] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.name || !formData.email}
                                className="w-full mt-8 bg-[#5BC299] text-black font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Connect Socials */}
                    {step === 2 && (
                        <div className="animate-fadeIn">
                            <div className="w-16 h-16 bg-[#232626] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Link2 size={32} className="text-[#5BC299]" />
                            </div>
                            <h1 className="text-3xl font-bold text-center mb-2">Connect Your Socials</h1>
                            <p className="text-gray-400 text-center mb-8">Connect at least one platform to verify your reach.</p>

                            <div className="space-y-3">
                                {platforms.map(platform => (
                                    <div
                                        key={platform.id}
                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${connectedPlatforms.includes(platform.id)
                                                ? 'bg-[#5BC299]/10 border-[#5BC299]'
                                                : 'bg-[#1E2020] border-[#232626] hover:border-[#5BC299]/50'
                                            }`}
                                        onClick={() => !connectedPlatforms.includes(platform.id) && connectPlatform(platform.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{platform.icon}</span>
                                            <span className="font-medium">{platform.name}</span>
                                        </div>
                                        {connectedPlatforms.includes(platform.id) ? (
                                            <Check size={20} className="text-[#5BC299]" />
                                        ) : loading ? (
                                            <Loader size={20} className="animate-spin text-gray-400" />
                                        ) : (
                                            <span className="text-sm text-gray-400">Connect</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(3)}
                                disabled={connectedPlatforms.length === 0}
                                className="w-full mt-8 bg-[#5BC299] text-black font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 3: Pricing Preferences */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="animate-fadeIn">
                            <h1 className="text-3xl font-bold text-center mb-2">Set Your Preferences</h1>
                            <p className="text-gray-400 text-center mb-8">Your AI agent will negotiate on your behalf.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Minimum Rate per Post (USD)</label>
                                    <input
                                        type="number"
                                        name="minRate"
                                        value={formData.minRate}
                                        onChange={handleChange}
                                        placeholder="200"
                                        className="w-full bg-[#1E2020] border border-[#232626] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#5BC299] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Content Niche</label>
                                    <select
                                        name="niche"
                                        onChange={handleChange}
                                        className="w-full bg-[#1E2020] border border-[#232626] rounded-lg px-4 py-3 text-white focus:border-[#5BC299] focus:outline-none transition-colors appearance-none"
                                    >
                                        <option value="">Select your niche</option>
                                        <option value="lifestyle">Lifestyle</option>
                                        <option value="fashion">Fashion & Beauty</option>
                                        <option value="tech">Tech & Gaming</option>
                                        <option value="fitness">Fitness & Health</option>
                                        <option value="food">Food & Cooking</option>
                                        <option value="travel">Travel</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.minRate}
                                className="w-full mt-8 bg-[#5BC299] text-black font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader size={20} className="animate-spin" /> : 'Complete Setup'}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="text-center animate-fadeIn">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#5BC299] to-[#3A8F78] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={40} className="text-black" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Welcome Aboard!</h1>
                            <p className="text-gray-400 mb-8">Your agent is live. Brands can now find and match with you.</p>

                            <button
                                onClick={() => navigate('/creator/dashboard')}
                                className="w-full bg-[#5BC299] text-black font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity"
                            >
                                Go to Creator Hub
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CreatorSignup;
