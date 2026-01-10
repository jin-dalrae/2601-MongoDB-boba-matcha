import React, { useState } from 'react';
import { mockData } from './mockData';
import { CheckCircle, Clock } from 'lucide-react';

const Payments = () => {
    // Group pending and paid for clarity
    const pending = mockData.payments.filter(p => p.status === 'Pending');
    const paid = mockData.payments.filter(p => p.status === 'Paid');

    return (
        <div className="p-4">
            <h1 className="text-page-title mb-6">Payments</h1>

            {/* Pending Section */}
            <div className="mb-6">
                <h2 className="text-section-header mb-4 flex items-center gap-2">
                    <div style={{ width: 8, height: 8, background: '#EDA040', borderRadius: '50%' }}></div>
                    Pending Approval
                </h2>

                {pending.length === 0 ? (
                    <div className="text-body text-muted">No pending payments.</div>
                ) : (
                    <div className="flex flex-col gap-4 grid-cols-1 md:grid-cols-2">
                        {pending.map(p => (
                            <div key={p.id} className="card p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-body" style={{ fontWeight: 600 }}>{p.campaignName}</div>
                                        <div className="text-label" style={{ marginTop: 2 }}>To: {p.creatorName}</div>
                                    </div>
                                    <div className="text-metric text-accent" style={{ fontSize: 20 }}>${p.amount}</div>
                                </div>
                                <div className="flex justify-between items-center bg-[#1E2020] p-2 rounded-lg mt-2">
                                    <span className="text-label">Audit Score: {p.auditScore}</span>
                                    <span className="pill" style={{ color: '#EDA040', border: '1px solid #EDA040' }}>Pending Payout</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Paid Section */}
            <div>
                <h2 className="text-section-header mb-4 flex items-center gap-2">
                    <div style={{ width: 8, height: 8, background: '#9FE870', borderRadius: '50%' }}></div>
                    Settled History
                </h2>
                <div className="flex flex-col gap-4">
                    {paid.map(p => (
                        <div key={p.id} className="card p-4 flex justify-between items-center">
                            <div>
                                <div className="text-body" style={{ fontWeight: 600 }}>{p.campaignName}</div>
                                <div className="text-label mt-1">Paid to {p.creatorName} on {p.date}</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-body" style={{ fontWeight: 600 }}>${p.amount}</span>
                                <div className="flex items-center gap-1 text-accent text-label mt-1">
                                    <CheckCircle size={12} />
                                    <span>Settled</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Payments;
