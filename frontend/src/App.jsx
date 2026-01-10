import { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Discovery from './pages/Discovery';
import Deals from './pages/Deals';
import ActiveCampaigns from './pages/ActiveCampaigns';
import Profile from './pages/Profile';
import Loading from './pages/Loading';
import { OnboardingFlow } from './pages/onboarding';
import './index.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem('matcha_onboarding_complete');
    if (!onboardingComplete) {
      setShowOnboarding(true);
      setIsLoading(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleOnboardingComplete = (userData) => {
    console.log('Onboarding complete:', userData);
    setShowOnboarding(false);
  };

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setActiveTab('bidding');
  };

  const handleBackFromBidding = () => {
    setSelectedCampaign(null);
    setActiveTab('campaigns');
  };

  // Show onboarding for new users
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show loading for returning users
  if (isLoading) {
    return <Loading onComplete={handleLoadingComplete} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'campaigns':
        return <Discovery onSelectCampaign={handleSelectCampaign} />;
      case 'bidding':
        return selectedCampaign ? (
          <Deals onBack={handleBackFromBidding} />
        ) : (
          <Deals />
        );
      case 'profile':
        return <Profile />;
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
