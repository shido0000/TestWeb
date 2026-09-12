import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Targets from './pages/Targets';
import Scans from './pages/Scans';
import Findings from './pages/Findings';
import Crawler from './pages/Crawler';
import Performance from './pages/Performance';
import Accessibility from './pages/Accessibility';
import Security from './pages/Security';
import VisualRegression from './pages/VisualRegression';
import E2ETests from './pages/E2ETests';
import AIInsights from './pages/AIInsights';
import AnomalyDetection from './pages/AnomalyDetection';
import Tenants from './pages/Tenants';
import Billing from './pages/Billing';
import CICD from './pages/CICD';
import ApiDocs from './pages/ApiDocs';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Overview */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/scans" element={<Scans />} />
            <Route path="/findings" element={<Findings />} />

            {/* Testing Suites */}
            <Route path="/crawler" element={<Crawler />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/security" element={<Security />} />
            <Route path="/visual-regression" element={<VisualRegression />} />
            <Route path="/e2e" element={<E2ETests />} />

            {/* Intelligence (Phase 3) */}
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/anomalies" element={<AnomalyDetection />} />

            {/* Platform (Phase 3) */}
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/billing" element={<Billing />} />

            {/* Integration */}
            <Route path="/cicd" element={<CICD />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
