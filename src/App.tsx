/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router';
import { BrandProvider } from './context/BrandContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import InputPage from './components/InputPage';
import GenerationScreen from './components/GenerationScreen';
import Dashboard from './components/Dashboard';
import AssetDetail from './components/AssetDetail';
import History from './components/History';
import Settings from './components/Settings';
import CampaignEngine from './components/CampaignEngine';

export default function App() {
  return (
    <BrandProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="create" element={<InputPage />} />
            <Route path="generating/:projectId" element={<GenerationScreen />} />
            <Route path="dashboard/:projectId" element={<Dashboard />} />
            <Route path="asset/:projectId/:assetId" element={<AssetDetail />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
            <Route path="campaign/:projectId" element={<CampaignEngine />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </BrandProvider>
  );
}
