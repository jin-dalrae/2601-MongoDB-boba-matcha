import { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Discovery from './pages/Discovery';
import Bidding from './pages/Bidding';
import ActiveCampaigns from './pages/ActiveCampaigns';
import Loading from './pages/Loading';
import './index.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeFilter, setActiveFilter] = useState('today');

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setActiveTab('bidding');
  };

  const handleBackFromBidding = () => {
    setSelectedCampaign(null);
    setActiveTab('campaigns');
  };

  const handleSubmitBid = (bidData) => {
    console.log('Bid submitted:', bidData);
    setSelectedCampaign(null);
    setActiveTab('home');
  };

  if (isLoading) {
    return <Loading onComplete={handleLoadingComplete} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        );
      case 'campaigns':
        return <Discovery onSelectCampaign={handleSelectCampaign} />;
      case 'bidding':
        return (
          <Bidding
            campaign={selectedCampaign}
            onBack={handleBackFromBidding}
            onSubmit={handleSubmitBid}
          />
        );
      case 'profile':
        return <ActiveCampaigns />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      {renderPage()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
