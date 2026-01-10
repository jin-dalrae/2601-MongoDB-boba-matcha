import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [processingId, setProcessingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/campaigns');
            const data = await res.json();
            setCampaigns(data);
        } catch (err) {
            console.error("Failed to fetch campaigns", err);
        }
    };

    const handlePayment = (id) => {
        setProcessingId(id);
        setTimeout(() => {
            setCampaigns(prev => prev.map(c =>
                c._id === id ? { ...c, status: 'Settled', spent: (c.spent || 0) + 1500 } : c
            ));
            setProcessingId(null);
            alert("Payment released via x402 Protocol!");
        }, 2000);
    };

    return (
        <div className="p-4 page-container">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-page-title text-accent">All Campaigns</h1>
                <button
                    onClick={() => navigate('/create-campaign')}
                    className="bg-accent text-black font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <Plus size={18} />
                    <span>Create New</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.length === 0 ? (
                    <div className="col-span-2 text-center text-muted py-10">
                        No campaigns yet. Create one to get started!
                    </div>
                ) : (
                    campaigns.map(c => (
                        <div
                            key={c._id}
                            className="card cursor-pointer hover:border-accent transition-colors"
                            onClick={(e) => {
                                if (e.target.closest('button')) return;
                                navigate(`/campaigns/${c._id}`);
                            }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-section-header">{c.title}</div>
                                    <div className="text-label mt-1">Budget: ${c.budget_limit}</div>
                                </div>
                                <span className={`pill ${c.status === 'Matching' ? 'active' : ''}`}>{c.status}</span>
                            </div>

                            <div className="flex justify-between items-center bg-[#1E2020] p-3 rounded-lg">
                                <div>
                                    <span className="text-label" style={{ display: 'block', marginBottom: 2 }}>Product</span>
                                    <span className="text-body text-sm">{c.product_info?.name || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Campaigns;
