import { useState } from 'react';
import TopBar from '../components/TopBar';
import FilterChips from '../components/FilterChips';
import CampaignCard from '../components/CampaignCard';
import './Discovery.css';

const categoryFilters = [
    { value: 'all', label: 'All', hasDropdown: false },
    { value: 'category', label: 'Category', hasDropdown: true },
    { value: 'platform', label: 'Platform', hasDropdown: true },
    { value: 'budget', label: 'Budget', hasDropdown: true },
];

import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import FilterChips from '../components/FilterChips';
import CampaignCard from '../components/CampaignCard';
import './Discovery.css';

const categoryFilters = [
    { value: 'all', label: 'All', hasDropdown: false },
    { value: 'category', label: 'Category', hasDropdown: true },
    { value: 'platform', label: 'Platform', hasDropdown: true },
    { value: 'budget', label: 'Budget', hasDropdown: true },
];

export default function Discovery({ onSelectCampaign }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/campaigns')
            .then(res => res.json())
            .then(data => setCampaigns(data))
            .catch(err => console.error(err));
    }, []);

    const getTimeLeft = (deadline) => {
        if (!deadline) return null;
        const diff = new Date(deadline) - new Date();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        if (diff < 0) return 'Ended';
        return `${days}d ${hours}h left`;
    };

    return (
        <div className="page discovery">
            <TopBar
                showAvatar={false}
                showNotification={false}
                title="Discover Jobs"
            />

            <section className="discovery-filters">
                <FilterChips
                    options={categoryFilters}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
            </section>

            <section className="discovery-campaigns mt-lg">
                <div className="campaign-grid">
                    {campaigns.length === 0 && <div className="empty-state">No campaigns found.</div>}
                    {campaigns.map((campaign) => (
                        <div key={campaign._id} className="relative">
                            <CampaignCard
                                brand={campaign.title} // Mapping title to brand for existing card
                                summary={campaign.product_info?.description || 'No description'}
                                budgetRange={`$${campaign.budget_limit}`}
                                onClick={() => onSelectCampaign?.(campaign)}
                            />
                            {/* Overlay Deadline Badge */}
                            <div style={{ position: 'absolute', top: 10, right: 10, background: '#00000080', padding: '4px 8px', borderRadius: 4, fontSize: 10, color: '#9FE870', backdropFilter: 'blur(4px)' }}>
                                {getTimeLeft(campaign.deadline)}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
