import React, { useEffect, useState } from 'react';
import { Loader, Plus, CreditCard, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from './apiClient';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        apiFetch('/api/dashboard')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <Loader className="animate-spin text-[#9FE870]" size={40} />
            </div>
        );
    }

    if (!data || !data.advertiser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="text-center">
                    <p className="text-[#7C8481] text-lg">No data available</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 text-[#9FE870] hover:underline"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    const { advertiser, campaigns, agentActivity } = data;
    const pct = Math.min((advertiser.spent / advertiser.budget) * 100, 100);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-[#7C8481]">Welcome back! Here's what's happening with your campaigns.</p>
                </div>

                {/* Budget Overview Card */}
                <div className="bg-gradient-to-br from-[#1E2020] to-[#161818] border border-[#232626] rounded-2xl p-10 mb-10 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm text-[#7C8481] mb-1">Total Budget</p>
                            <p className="text-4xl font-bold text-white">${advertiser.budget.toLocaleString()}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-[#9FE870] to-[#5BC299] rounded-2xl flex items-center justify-center shadow-lg">
                            <TrendingUp size={32} className="text-[#0E120F]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="bg-[#0A0A0A]/50 rounded-xl p-4 border border-[#232626]">
                            <p className="text-sm text-[#7C8481] mb-1">Spent</p>
                            <p className="text-2xl font-bold text-white">${advertiser.spent.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#0A0A0A]/50 rounded-xl p-4 border border-[#232626]">
                            <p className="text-sm text-[#7C8481] mb-1">Remaining</p>
                            <p className="text-2xl font-bold text-[#9FE870]">${advertiser.remaining.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="w-full h-3 bg-[#0A0A0A] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#9FE870] to-[#5BC299] rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-[#7C8481] mt-2">{pct.toFixed(1)}% of budget used</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <button
                        onClick={() => navigate('/create-campaign')}
                        className="group bg-[#1E2020] hover:bg-[#232626] border border-[#232626] hover:border-[#9FE870]/30 rounded-xl p-6 transition-all text-left"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-[#9FE870]/10 rounded-xl flex items-center justify-center group-hover:bg-[#9FE870]/20 transition-all">
                                <Plus size={24} className="text-[#9FE870]" />
                            </div>
                            <div className="text-2xl">→</div>
                        </div>
                        <h3 className="font-bold text-white mb-1">Create New Campaign</h3>
                        <p className="text-sm text-[#7C8481]">Launch a new influencer marketing campaign</p>
                    </button>

                    <button
                        onClick={() => navigate('/advertiser/payments')}
                        className="group bg-gradient-to-br from-[#9FE870] to-[#5BC299] hover:from-[#8FE060] hover:to-[#4AB188] rounded-xl p-6 transition-all text-left shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-[#0E120F]/20 rounded-xl flex items-center justify-center">
                                <CreditCard size={24} className="text-[#0E120F]" />
                            </div>
                            <div className="text-2xl text-[#0E120F]">→</div>
                        </div>
                        <h3 className="font-bold text-[#0E120F] mb-1">Review & Pay</h3>
                        <p className="text-sm text-[#0E120F]/70">Process pending creator payments</p>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Active Campaigns */}
                    <div className="bg-[#1E2020] border border-[#232626] rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-8">Active Campaigns</h2>
                        <div className="space-y-3">
                            {campaigns.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-[#7C8481] mb-4">No active campaigns yet</p>
                                    <button
                                        onClick={() => navigate('/create-campaign')}
                                        className="text-[#9FE870] hover:underline text-sm"
                                    >
                                        Create your first campaign
                                    </button>
                                </div>
                            ) : (
                                campaigns.map(c => (
                                    <div
                                        key={c.id}
                                        className="bg-[#0A0A0A]/50 border border-[#232626] hover:border-[#9FE870]/30 rounded-xl p-4 cursor-pointer transition-all group"
                                        onClick={() => navigate(`/advertiser/campaigns/${c.id}`)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white mb-1 group-hover:text-[#9FE870] transition-colors">
                                                    {c.name}
                                                </h3>
                                                <p className="text-xs text-[#7C8481]">{c.creators} creators matched</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.status === 'Active'
                                                ? 'bg-[#9FE870]/10 text-[#9FE870] border border-[#9FE870]/20'
                                                : 'bg-[#7C8481]/10 text-[#7C8481] border border-[#7C8481]/20'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="text-[#7C8481]">
                                                Spent: <span className="text-white font-medium">${c.spent}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Agent Activity */}
                    <div className="bg-[#1E2020] border border-[#232626] rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-8">Recent Activity</h2>
                        <div className="space-y-3">
                            {agentActivity.map((log, idx) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 pb-3 border-b border-[#232626] last:border-0"
                                >
                                    <div className="w-8 h-8 bg-[#9FE870]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle size={16} className="text-[#9FE870]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white mb-1">{log.text}</p>
                                        <div className="flex items-center gap-2 text-xs text-[#7C8481]">
                                            <Clock size={12} />
                                            <span>{new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Dashboard;
