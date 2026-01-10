import TopBar from '../components/TopBar';
import EarningsCard from '../components/EarningsCard';
import FilterChips from '../components/FilterChips';
import CampaignCard from '../components/CampaignCard';
import './Dashboard.css';

const timeFilters = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this-week', label: 'This week' },
];

const campaigns = [
    {
        id: 1,
        brand: 'Sephora',
        summary: 'Beauty product showcase',
        status: 'Active',
        amount: 120,
    },
    {
        id: 2,
        brand: 'Nike',
        summary: 'Athletic wear promotion',
        status: 'Pending',
        amount: 86,
    },
    {
        id: 3,
        brand: 'Spotify',
        summary: 'Music streaming campaign',
        status: 'Active',
        amount: 200,
    },
];

export default function Dashboard({ activeFilter, onFilterChange }) {
    return (
        <div className="page dashboard">
            <TopBar showAvatar={true} showNotification={true} />

            <EarningsCard
                total={306.00}
                available={220.00}
                pending={86.00}
            />

            <section className="dashboard-section mt-xl">
                <FilterChips
                    options={timeFilters}
                    activeFilter={activeFilter || 'today'}
                    onFilterChange={onFilterChange || (() => { })}
                />
            </section>

            <section className="dashboard-section mt-lg">
                <h2 className="section-title">Recent Campaigns</h2>
                <div className="campaign-list">
                    {campaigns.map((campaign) => (
                        <CampaignCard
                            key={campaign.id}
                            brand={campaign.brand}
                            summary={campaign.summary}
                            status={campaign.status}
                            amount={campaign.amount}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
