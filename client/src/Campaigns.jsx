import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Loader, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/campaigns')
            .then(res => res.json())
            .then(data => {
                setCampaigns(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handlePayment = (id) => {
        // Redirecting to payments page
        navigate('/payments');
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader className="animate-spin" /></div>;

    return (
        <div className="p-4 page-container">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-page-title text-accent">All Campaigns</h1>
                <button
                    onClick={() => navigate('/create-campaign')} // Placeholder route
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
                            key={c.id}
                            className="card cursor-pointer hover:border-accent transition-colors"
                            onClick={(e) => {
                                if (e.target.closest('button')) return;
                                navigate(`/campaigns/${c.id}`);
                            }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-section-header">{c.name}</div>
                                    <div className="text-label mt-1">Budget: ${c.budget}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`pill ${c.status === 'Matching' ? 'active' : ''}`}>{c.status}</span>
                                    <span className="text-label text-muted">{c.creators} Creators</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-[#1E2020] p-3 rounded-lg">
                                <div>
                                    <span className="text-label" style={{ display: 'block', marginBottom: 2 }}>Spent</span>
                                    <span className="text-body text-sm">${c.spent}</span>
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
