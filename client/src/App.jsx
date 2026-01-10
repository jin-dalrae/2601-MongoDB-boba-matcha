import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './Dashboard';
import Shortlist from './Shortlist';
import Campaigns from './Campaigns';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/shortlist" element={<Shortlist />} />
          <Route path="/campaigns" element={<Campaigns />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
