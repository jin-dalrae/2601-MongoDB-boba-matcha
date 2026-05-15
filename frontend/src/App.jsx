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
import LandingPage from './pages/LandingPage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { OnboardingFlow } from './pages/onboarding';
import AdvertiserDashboard from './pages/advertiser/AdvertiserDashboard';
import AdvertiserCampaigns from './pages/advertiser/AdvertiserCampaigns';
import AdvertiserShortlist from './pages/advertiser/AdvertiserShortlist';
import AdvertiserResults from './pages/advertiser/AdvertiserResults';
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
    // Don't force reset - let users access the landing page
    const onboardingComplete = localStorage.getItem('matcha_onboarding_complete');
    if (!onboardingComplete && location.pathname !== '/') {
      // Only show onboarding if they're trying to access app routes
      const isAppRoute = location.pathname.startsWith('/creator') || location.pathname.startsWith('/advertiser');
      const isLegalRoute = location.pathname === '/terms' || location.pathname === '/privacy';
      if (isAppRoute && !isLegalRoute) {
        setShowOnboarding(true);
      }
    }
    setIsLoading(false);
  }, [location.pathname]);

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
  const isLandingPage = location.pathname === '/';
  const isLegalRoute = location.pathname === '/terms' || location.pathname === '/privacy';

  // Full-width container for landing, legal, and advertiser routes.
  // Only advertiser routes render the left sidebar, so only they get the
  // sidebar offset.
  const useFullWidth = isLandingPage || isAdvertiserRoute || isLegalRoute;
  const useSidebarOffset = isAdvertiserRoute;

  return (
    <div className={`app${useFullWidth ? ' app-full' : ''}${useSidebarOffset ? ' app-sidebar' : ''}`}>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Legal */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

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
        <Route path="/advertiser/results" element={<AdvertiserResults />} />

        {/* Legacy routes - redirect to new structure */}
        <Route path="/campaigns" element={<Navigate to="/creator/campaigns" replace />} />
        <Route path="/deals" element={<Navigate to="/creator/deals" replace />} />
        <Route path="/deals/:campaignId" element={<LegacyDealsRedirect />} />
        <Route path="/contracts" element={<Navigate to="/creator/contracts" replace />} />
        <Route path="/profile" element={<Navigate to="/creator/profile" replace />} />
      </Routes>
      {!isLandingPage && !isLegalRoute && (isAdvertiserRoute ? <AdvertiserNav /> : <BottomNav />)}
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
