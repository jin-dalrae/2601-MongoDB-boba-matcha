import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import AdvertiserNav from './components/AdvertiserNav';
import Dashboard from './pages/Dashboard';
import Discovery from './pages/Discovery';
import Deals from './pages/Deals';
import ActiveCampaigns from './pages/ActiveCampaigns';
import Profile from './pages/Profile';
import Loading from './pages/Loading';
import { OnboardingFlow } from './pages/onboarding';
import AdvertiserDashboard from './pages/advertiser/AdvertiserDashboard';
import AdvertiserCampaigns from './pages/advertiser/AdvertiserCampaigns';
import AdvertiserShortlist from './pages/advertiser/AdvertiserShortlist';
import './index.css';

// Legacy route redirect component
function LegacyDealsRedirect() {
  const { campaignId } = useParams();
  return <Navigate to={`/creator/deals/${campaignId}`} replace />;
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user has completed onboarding
    // FORCE RESET for demo:
    localStorage.removeItem('matcha_onboarding_complete');

    const onboardingComplete = localStorage.getItem('matcha_onboarding_complete');
    if (!onboardingComplete) {
      setShowOnboarding(true);
      setIsLoading(false);
    } else {
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

  // Show onboarding for new users
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show loading for returning users
  if (isLoading) {
    return <Loading onComplete={handleLoadingComplete} />;
  }

  // Determine if current route is advertiser or creator
  const isAdvertiserRoute = location.pathname.startsWith('/advertiser');
  
  return (
    <div className="app">
      <Routes>
        {/* Creator Routes */}
        <Route path="/creator" element={<Dashboard />} />
        <Route path="/creator/campaigns" element={<Discovery />} />
        <Route path="/creator/deals" element={<Deals />} />
        <Route path="/creator/deals/:campaignId" element={<Deals />} />
        <Route path="/creator/contracts" element={<ActiveCampaigns />} />
        <Route path="/creator/profile" element={<Profile />} />
        
        {/* Advertiser Routes */}
        <Route path="/advertiser" element={<AdvertiserDashboard />} />
        <Route path="/advertiser/campaigns" element={<AdvertiserCampaigns />} />
        <Route path="/advertiser/shortlist" element={<AdvertiserShortlist />} />
        
        {/* Legacy routes - redirect to new structure */}
        <Route path="/campaigns" element={<Navigate to="/creator/campaigns" replace />} />
        <Route path="/deals" element={<Navigate to="/creator/deals" replace />} />
        <Route path="/deals/:campaignId" element={<LegacyDealsRedirect />} />
        <Route path="/contracts" element={<Navigate to="/creator/contracts" replace />} />
        <Route path="/profile" element={<Navigate to="/creator/profile" replace />} />
      </Routes>
      {isAdvertiserRoute ? <AdvertiserNav /> : <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}