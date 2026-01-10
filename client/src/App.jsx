import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './Dashboard';
import Campaigns from './Campaigns';
import Payments from './Payments';
import CampaignDetail from './CampaignDetail';

import CreateCampaign from './CreateCampaign';
import CampaignDetails from './CampaignDetails';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
