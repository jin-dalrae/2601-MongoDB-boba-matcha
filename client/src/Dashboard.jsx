import React, { useState, useEffect } from 'react';
import { User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockData } from './mockData'; // Keep for some widgets if API doesn't cover all yet
const Dashboard = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/campaigns');
                if (res.ok) {
                    const data = await res.json();
                    setCampaigns(data);
                }
            } catch (err) {
                console.error("Failed to fetch campaigns", err);
            }
        };
        fetchCampaigns();
    }, []);

    const pct = (mockData.advertiser.spent / mockData.advertiser.budget) * 100;

    return (
        <div className="p-4 page-container">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-page-title text-accent">Dashboard</h1>
                <div style={{ background: '#232626', padding: 8, borderRadius: '50%' }}>
                    <User size={20} color="#9FE870" />
                </div>
            </div>

            {/* Primary Card: Budget */}
            <div className="card mb-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-section-header">Total Budget</span>
                    <span className="text-label">${mockData.advertiser.budget.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-end mb-2">
                    <div>
                        <div className="text-label" style={{ marginBottom: 4 }}>Spent</div>
                        <div className="text-metric" style={{ fontSize: 24 }}>${mockData.advertiser.spent.toLocaleString()}</div>
                    </div>
                    <div>
                        {/* Placeholder for now */}
                    </div>
                </div>

                <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
            </div>

            {/* Actions */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/create-campaign')}
                    className="w-full bg-[#1E1E1E] border border-accent/20 text-accent py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-accent/10 transition-colors"
                >
                    <Plus size={20} />
                    <span>Create New Campaign</span>
                </button>
            </div>

            {/* Second Section: Campaign Status */}
            <div className="mb-6">
                <h2 className="text-section-header mb-4">Active Campaigns</h2>
                <div className="flex flex-col gap-3">
                    {campaigns.length === 0 ? (
                        <div className="text-muted text-center py-4">No active campaigns</div>
                    ) : (
                        campaigns.map(c => (
                            <div
                                key={c._id}
                                className="card p-3 flex justify-between items-center cursor-pointer hover:border-accent/50 transition-colors"
                                onClick={() => navigate(`/campaigns/${c._id}`)}
                            >
                                <div>
                                    <div className="font-semibold text-white mb-1">{c.title}</div>
                                    <div className="text-xs text-muted">Budget: ${c.budget_limit}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`pill ${c.status === 'Matching' ? 'active' : ''}`}>{c.status}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Third Section: Agent Activity */}
            <div>
                <h2 className="text-section-header mb-4">Recent Activity</h2>
                <div className="card" style={{ padding: '8px 16px' }}>
                    {/* Keep mock activity for now as backend doesn't serve logs yet */}
                    {mockData.agentActivity.map((log, idx) => (
                        <div key={log.id}>
                            <div className="flex justify-between items-center" style={{ padding: '12px 0' }}>
                                <span className="text-body" style={{ color: '#AEB5B2' }}>{log.text}</span>
                                <span className="text-label" style={{ color: '#7C8481', fontSize: 10 }}>{log.time}</span>
                            </div>
                            {idx < mockData.agentActivity.length - 1 && (
                                <div style={{ height: 1, background: '#232626' }}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
