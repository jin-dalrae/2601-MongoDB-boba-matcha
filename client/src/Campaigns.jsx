import React from 'react';
import { mockData } from './mockData';

const Campaigns = () => {
    return (
        <div className="p-4">
            <h1 className="text-page-title mb-6">Campaigns</h1>

            <div className="flex flex-col gap-4">
                {mockData.campaigns.map(c => (
                    <div key={c.id} className="card">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-section-header">{c.name}</div>
                                <div className="text-label mt-1">{c.creators} Creators Active</div>
                            </div>
                            <span className={`pill ${c.status === 'Live' ? 'active' : ''}`}>{c.status}</span>
                        </div>

                        {/* Timeline / Status visualization */}
                        <div className="flex justify-between items-center mb-4 text-label text-muted" style={{ fontSize: 10 }}>
                            <div className="flex flex-col items-center gap-1">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9FE870' }}></div>
                                Brief
                            </div>
                            <div style={{ height: 1, flex: 1, background: '#232626' }}></div>
                            <div className="flex flex-col items-center gap-1">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.status === 'Live' ? '#9FE870' : '#232626' }}></div>
                                Creation
                            </div>
                            <div style={{ height: 1, flex: 1, background: '#232626' }}></div>
                            <div className="flex flex-col items-center gap-1">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#232626' }}></div>
                                Audit
                            </div>
                            <div style={{ height: 1, flex: 1, background: '#232626' }}></div>
                            <div className="flex flex-col items-center gap-1">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#232626' }}></div>
                                Pay
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-[#1E2020] p-3 rounded-lg">
                            <span className="text-label">Spend so far</span>
                            <span className="text-body" style={{ fontWeight: 600 }}>${c.spent}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Campaigns;
