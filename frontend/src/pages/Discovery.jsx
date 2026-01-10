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

const discoveryCampaigns = [
    {
        id: 1,
        brand: 'Glossier',
        summary: 'Looking for beauty creators to showcase our new Summer Collection. Focus on skincare and natural makeup looks.',
        budgetRange: '$500 - $1,000',
        category: 'Beauty',
    },
    {
        id: 2,
        brand: 'Notion',
        summary: 'Productivity app tutorial. Show your workflow and organization tips for content creators.',
        budgetRange: '$200 - $500',
        category: 'Tech',
    },
    {
        id: 3,
        brand: 'Lululemon',
        summary: 'Fitness content featuring our new activewear line. Looking for workout routines and lifestyle content.',
        budgetRange: '$800 - $1,500',
        category: 'Fitness',
    },
    {
        id: 4,
        brand: 'Canva',
        summary: 'Design tutorial showcasing creative process. Target audience: aspiring designers and small business owners.',
        budgetRange: '$300 - $600',
        category: 'Design',
    },
];

export default function Discovery({ onSelectCampaign }) {
    const [activeFilter, setActiveFilter] = useState('all');

    return (
        <div className="page discovery">
            <TopBar
                showAvatar={false}
                showNotification={false}
                title="Discover"
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
                    {discoveryCampaigns.map((campaign) => (
                        <CampaignCard
                            key={campaign.id}
                            brand={campaign.brand}
                            summary={campaign.summary}
                            budgetRange={campaign.budgetRange}
                            onClick={() => onSelectCampaign?.(campaign)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
