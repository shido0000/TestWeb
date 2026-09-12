import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Targets from './pages/Targets';
import Scans from './pages/Scans';
import Findings from './pages/Findings';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/scans" element={<Scans />} />
            <Route path="/findings" element={<Findings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
