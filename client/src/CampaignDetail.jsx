import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, FileText, Loader } from 'lucide-react';

const CampaignDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState([]);
    const [activeTab, setActiveTab] = useState('matches');
    const [selectedContract, setSelectedContract] = useState(null);

    useEffect(() => {
        // Fetch Campaign Data
        const p1 = fetch(`/api/campaigns/${id}`).then(res => res.json());
        // Fetch Content Submissions (Demo: Fetch all for now)
        const p2 = fetch('/api/content').then(res => res.json());

        Promise.all([p1, p2])
            .then(([campaignData, contentData]) => {
                setData(campaignData);
                setSubmissions(contentData || []);
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

    // ... (keep renderContractDetail same) ...

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
                <div
                    className={`pb-2 px-2 cursor-pointer ${activeTab === 'submissions' ? 'border-b-2 border-accent text-accent' : 'text-muted'}`}
                    onClick={() => setActiveTab('submissions')}
                >
                    Submissions <span className="text-xs bg-[#232626] px-1 rounded ml-1">{submissions.length}</span>
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

            {activeTab === 'submissions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {submissions.length === 0 ? <div className="col-span-3 text-muted">No content submissions yet.</div> : submissions.map((sub, i) => (
                        <div key={i} className="card p-0 overflow-hidden group">
                            <div className="aspect-[9/16] bg-black relative">
                                <video
                                    src={sub.content_url}
                                    controls
                                    className="w-full h-full object-cover"
                                    poster={sub.thumbnail || ''}
                                />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs border border-white/10">
                                    AI Score: <span className="text-accent">98.5%</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-sm mb-1 line-clamp-1">{sub.title || sub.filename}</h3>
                                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                    {sub.tags && sub.tags.map(t => (
                                        <span key={t} className="text-[10px] bg-[#232626] text-gray-400 px-2 py-1 rounded-full">#{t}</span>
                                    ))}
                                </div>

                                <div className="border-t border-[#232626] pt-3 mt-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Brand Safety</span>
                                        <span className={sub.ai_audit?.brand_safe ? "text-accent" : "text-red-500"}>
                                            {sub.ai_audit?.brand_safe ? "Pass" : "Fail"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs mt-1">
                                        <span className="text-gray-500">Sentiment</span>
                                        <span className="text-white">{sub.ai_audit?.sentiment || 'Neutral'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampaignDetail;
