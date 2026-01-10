import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3000/api/campaigns')
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
        setProcessingId(id);

        // Let's use the simulation for consistent UI behavior for now, or redirect to Payments page.
        // Redirecting is safer.
        navigate('/payments');
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader className="animate-spin" /></div>;

    return (
        <div className="p-4">
            <h1 className="text-page-title mb-6">Campaigns</h1>

            <div className="flex flex-col gap-4 grid-cols-1 md:grid-cols-2"> {/* Added responsive grid here too */}
                {campaigns.map(c => (
                    <div
                        key={c.id}
                        className="card cursor-pointer hover:border-accent transition-colors"
                        style={{ border: '1px solid transparent' }}
                        onClick={(e) => {
                            // Prevent navigation if clicking the Pay button
                            if (e.target.closest('button')) return;
                            navigate(`/campaigns/${c.id}`);
                        }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-section-header">{c.name}</div>
                                <div className="text-label mt-1">{c.creators} Creators Active</div>
                            </div>
                            <span className={`pill ${c.status === 'Live' ? 'active' : ''} `}>{c.status}</span>
                        </div>

                        {/* Timeline / Status visualization */}
                        <div className="flex justify-between items-center mb-4 text-label text-muted" style={{ fontSize: 10 }}>
                            <div className="flex flex-col items-center gap-1">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9FE870' }}></div>
                                Brief
                            </div>
                            <div style={{ height: 1, flex: 1, background: '#232626' }}></div>
                            <div className="flex flex-col items-center gap-1">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ['Live', 'Audit Complete', 'Settled', 'Review'].includes(c.status) ? '#9FE870' : '#232626' }}></div>
                                Creation
                            </div>
                            <div style={{ height: 1, flex: 1, background: '#232626' }}></div>
                            <div className="flex flex-col items-center gap-1">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ['Audit Complete', 'Settled'].includes(c.status) ? '#9FE870' : '#232626' }}></div>
                                Audit
                            </div>
                            <div style={{ height: 1, flex: 1, background: '#232626' }}></div>
                            <div className="flex flex-col items-center gap-1">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.status === 'Settled' ? '#9FE870' : '#232626' }}></div>
                                Pay
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-[#1E2020] p-3 rounded-lg">
                            <div>
                                <span className="text-label" style={{ display: 'block', marginBottom: 2 }}>Spend so far</span>
                                <span className="text-body" style={{ fontWeight: 600 }}>${c.spent}</span>
                            </div>

                            {/* Payment Action */}
                            {c.status === 'Audit Complete' && (
                                <button
                                    className="btn"
                                    style={{
                                        padding: '8px 16px',
                                        background: processingId === c.id ? '#7C8481' : '#9FE870',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8
                                    }}
                                    onClick={() => handlePayment(c.id)}
                                    disabled={processingId === c.id}
                                >
                                    {processingId === c.id ? 'Processing...' : (
                                        <>
                                            <CreditCard size={16} />
                                            <span>Pay via x402</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {c.status === 'Settled' && (
                                <div className="flex items-center gap-2 text-accent" style={{ fontSize: 12 }}>
                                    <CheckCircle size={16} />
                                    <span>Paid</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Campaigns;
