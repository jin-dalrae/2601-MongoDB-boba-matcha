import React, { useState } from 'react';
import { Filter, ChevronRight, Check, X } from 'lucide-react';
import { mockData } from './mockData';

const Shortlist = () => {
    const [selectedCreatorId, setSelectedCreatorId] = useState(null);

    // Detail View Helper
    const renderDetail = () => {
        const creator = mockData.creators.find(c => c.id === selectedCreatorId);
        if (!creator) return null;

        return (
            <div className="p-4" style={{ height: '100%' }}>
                {/* Header */}
                <button onClick={() => setSelectedCreatorId(null)} className="text-label mb-4 flex items-center gap-2">
                    &larr; Back to Shortlist
                </button>

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-page-title">{creator.name}</h1>
                        <div className="text-label">{creator.platform} &bull; {creator.handle}</div>
                    </div>
                    <div className="text-metric text-accent">{creator.fitScore}%</div>
                </div>

                {/* Analysis Cards */}
                <div className="card">
                    <div className="text-section-header mb-2 text-accent">Why this creator?</div>
                    <div className="text-body text-secondary">{creator.aiReasoning}</div>
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-section-header">Negotiation Plan</span>
                        <span className="pill active">{creator.negotiation.history.length > 0 ? 'In Progress' : 'Pending'}</span>
                    </div>

                    {/* Timeline */}
                    <div className="flex flex-col gap-4">
                        {creator.negotiation.history.map((step, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9FE870' }}></div>
                                    <div style={{ width: 1, flex: 1, background: '#232626', minHeight: 20 }}></div>
                                </div>
                                <div>
                                    <div className="text-body" style={{ fontWeight: 500 }}>{step.step}</div>
                                    <div className="text-label">${step.val}</div>
                                </div>
                            </div>
                        ))}

                        {/* Current Step */}
                        <div className="flex gap-4 opacity-50">
                            <div className="flex flex-col items-center">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1px solid #9FE870' }}></div>
                            </div>
                            <div>
                                <div className="text-body">Next: Confirm Agreement</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                    <div className="flex gap-4">
                        <button className="btn" style={{ flex: 1, backgroundColor: '#232626', color: '#E87070' }}>Reject</button>
                        <button className="btn" style={{ flex: 2 }}>Approve & Hire (${creator.bid})</button>
                    </div>
                </div>
            </div>
        );
    };

    if (selectedCreatorId) return renderDetail();

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-page-title">Shortlist</h1>
                <Filter size={20} color="#AEB5B2" />
            </div>

            {/* Campaign Context Card */}
            <div className="card" style={{ borderLeft: '4px solid #9FE870' }}>
                <div className="text-label mb-1">Active Campaign</div>
                <div className="text-section-header mb-2">Summer Launch</div>
                <div className="flex gap-4 text-label">
                    <span>Budget: $2k-$5k</span>
                    <span>&bull;</span>
                    <span>Deadline: Jun 30</span>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {mockData.creators.map(creator => (
                    <div key={creator.id} className="card p-4" onClick={() => setSelectedCreatorId(creator.id)}>
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

                        <div className="flex gap-2 mb-4 flex-wrap">
                            <span className="pill" style={{ fontSize: 10, padding: '2px 8px' }}>AI Recommended</span>
                            {creator.tags.map(tag => (
                                <span key={tag} className="pill" style={{ fontSize: 10, borderRadius: 4, background: '#1E2020', color: '#7C8481' }}>{tag}</span>
                            ))}
                        </div>

                        <div className="flex justify-between items-center bg-[#1E2020] p-2 rounded-lg">
                            <span className="text-label">Agent Status</span>
                            <span className="text-label text-accent">Negotiating...</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shortlist;
