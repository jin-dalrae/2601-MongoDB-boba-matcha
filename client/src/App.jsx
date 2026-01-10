import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './Dashboard';
import Campaigns from './Campaigns';
import Payments from './Payments';
import CampaignDetail from './CampaignDetail';
import LandingPage from './LandingPage';
import AdvertiserSignup from './AdvertiserSignup';
import CreatorSignup from './CreatorSignup';

// Wrapper for Layout to keep syntax clean
const AppLayout = ({ children }) => <Layout>{children}</Layout>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Signup Flows */}
        <Route path="/signup/advertiser" element={<AdvertiserSignup />} />
        <Route path="/signup/creator" element={<CreatorSignup />} />

        {/* Advertiser Routes */}
        <Route path="/advertiser" element={<Navigate to="/advertiser/overview" replace />} />

        <Route path="/advertiser/overview" element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        } />

        <Route path="/advertiser/campaigns" element={
          <AppLayout>
            <Campaigns />
          </AppLayout>
        } />

        <Route path="/advertiser/campaigns/:id" element={
          <AppLayout>
            <CampaignDetail />
          </AppLayout>
        } />

        <Route path="/advertiser/payments" element={
          <AppLayout>
            <Payments />
          </AppLayout>
        } />

        {/* Creator Routes */}
        <Route path="/creator" element={<Navigate to="/creator/dashboard" replace />} />
        <Route path="/creator/dashboard" element={<div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">Creator Dashboard Coming Soon</div>} />

        {/* Legacy Redirects */}
        <Route path="/campaigns" element={<Navigate to="/advertiser/campaigns" replace />} />
        <Route path="/payments" element={<Navigate to="/advertiser/payments" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
