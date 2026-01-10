import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, FileText, Loader } from 'lucide-react';

const CampaignDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('matches');
    const [selectedContract, setSelectedContract] = useState(null);

    useEffect(() => {
        fetch(`/api/campaigns/${id}`)
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-8 flex justify-center"><Loader className="animate-spin" /></div>;
    if (!data || !data.campaign) return <div className="p-4">Campaign not found</div>;

    const { campaign, matches, contracts } = data;

    // Render Contract Detail Modal/Overlay
    const renderContractDetail = () => {
        if (!selectedContract) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center p-4 z-50" style={{ backdropFilter: 'blur(4px)' }}>
                <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 flex flex-col">
                    <div className="p-6 border-b border-[#232626] flex justify-between items-start sticky top-0 bg-[#161818] z-10">
                        <div>
                            <div className="text-label mb-1">{selectedContract.type}</div>
                            <h2 className="text-section-header text-xl">{selectedContract.title}</h2>
                            <div className="flex gap-2 mt-2">
                                <span className={`pill ${selectedContract.status === 'Active' ? 'active' : ''}`}>{selectedContract.status}</span>
                                <span className="text-label flex items-center">v{selectedContract.version}</span>
                            </div>
                        </div>
                        <button onClick={() => setSelectedContract(null)} className="p-2 hover:bg-[#232626] rounded-full">
                            <ChevronLeft size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <div className="mb-6 bg-[#1E2020] p-4 rounded-lg">
                            <div className="text-label mb-2">Parties Involved</div>
                            {selectedContract.parties.map((p, i) => (
                                <div key={i} className="text-body flex items-center gap-2 mb-1">
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9FE870' }}></div>
                                    {p}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-6">
                            {selectedContract.clauses.map((clause, i) => (
                                <div key={i}>
                                    <h3 className="text-body font-bold mb-2 text-primary">{clause.title}</h3>
                                    <p className="text-body text-secondary leading-relaxed text-sm bg-[#0E0F0F] p-3 rounded border border-[#232626]">
                                        {clause.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 border-t border-[#232626] bg-[#161818] flex justify-end gap-2 sticky bottom-0">
                        <button className="btn" style={{ background: '#232626', color: '#AEB5B2' }} onClick={() => setSelectedContract(null)}>Close</button>
                        <button className="btn">Download PDF</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 relative">
            {selectedContract && renderContractDetail()}

            <button onClick={() => navigate('/campaigns')} className="text-label mb-4 flex items-center gap-2">
                <ChevronLeft size={16} /> Back to Campaigns
            </button>

            {/* Campaign Header */}
            <div className="card mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-page-title mb-1">{campaign.name}</h1>
                        <span className={`pill ${campaign.status === 'Live' ? 'active' : ''}`}>{campaign.status}</span>
                    </div>
                </div>
                <div className="flex gap-8 text-label">
                    <div>
                        <div style={{ color: '#AEB5B2' }}>Creators</div>
                        <div className="text-body" style={{ fontWeight: 600 }}>{campaign.creators}</div>
                    </div>
                    <div>
                        <div style={{ color: '#AEB5B2' }}>Spend</div>
                        <div className="text-body" style={{ fontWeight: 600 }}>${campaign.spent}</div>
                    </div>
                </div>
            </div>

            {/* Sub-Navigation */}
            <div className="flex gap-4 mb-6 border-b border-[#232626]">
                <div
                    className={`pb-2 px-2 cursor-pointer ${activeTab === 'matches' ? 'border-b-2 border-accent text-accent' : 'text-muted'}`}
                    onClick={() => setActiveTab('matches')}
                >
                    Matches
                </div>
                <div
                    className={`pb-2 px-2 cursor-pointer ${activeTab === 'contracts' ? 'border-b-2 border-accent text-accent' : 'text-muted'}`}
                    onClick={() => setActiveTab('contracts')}
                >
                    Contracts
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'matches' && (
                <div>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {matches.length === 0 ? <div className="text-muted p-4">No matches yet.</div> : matches.map(creator => (
                            <div key={creator.id} className="card p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div style={{ width: 32, height: 32, background: '#232626', borderRadius: '50%' }}></div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{creator.name}</div>
                                            <div className="text-label" style={{ fontSize: 10 }}>{creator.platform}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-accent" style={{ fontWeight: 700 }}>{creator.fitScore}% Fit</div>
                                        <div className="text-label">${creator.bid}</div>
                                    </div>
                                </div>
                                <div className="bg-[#1E2020] p-2 rounded text-label text-center">
                                    View Negotiation
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'contracts' && (
                <div className="flex flex-col gap-4">
                    {contracts.length === 0 ? <div className="text-muted p-4">No contracts found.</div> : contracts.map(contract => (
                        <div key={contract.id} className="card p-4 flex gap-4 items-center">
                            <FileText size={24} className={contract.status === 'Active' ? 'text-accent' : 'text-muted'} />
                            <div style={{ flex: 1 }}>
                                <div className="text-body" style={{ fontWeight: 600 }}>{contract.title}</div>
                                <div className="text-label">{contract.status} • v{contract.version} • {contract.lastUpdated}</div>
                            </div>
                            <button className="pill" onClick={() => setSelectedContract(contract)}>View</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampaignDetail;
