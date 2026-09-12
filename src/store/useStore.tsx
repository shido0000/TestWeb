import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Project, Scan, Finding, Target, Integration, DashboardStats, CrawlResult, PerformanceMetrics, AccessibilityResult, SecurityResult, VisualDiff, E2EFlow, CICDConfig, ApiKey, AIInsight, AIPattern, AIPrediction, VisualAnomaly, Tenant, BillingPlan, Invoice, PaymentMethod } from '../types';
import {
  projects as mockProjects, scans as mockScans, findings as mockFindings, targets as mockTargets,
  integrations as mockIntegrations, dashboardStats as mockStats, crawlResults as mockCrawl,
  performanceMetrics as mockPerf, accessibilityResults as mockA11y, securityResults as mockSecurity,
  visualDiffs as mockVisual, e2eFlows as mockE2E, cicdConfigs as mockCICD, apiKeys as mockApiKeys,
} from '../data/mockData';
import {
  aiInsights as mockAIInsights, aiPatterns as mockAIPatterns, aiPredictions as mockAIPredictions,
  visualAnomalies as mockAnomalies, tenants as mockTenants, billingPlans as mockPlans,
  invoices as mockInvoices, paymentMethods as mockPayments,
} from '../data/phase3Data';

interface AppState {
  projects: Project[];
  scans: Scan[];
  findings: Finding[];
  targets: Target[];
  integrations: Integration[];
  stats: DashboardStats;
  crawlResults: CrawlResult[];
  performanceMetrics: PerformanceMetrics[];
  accessibilityResults: AccessibilityResult[];
  securityResults: SecurityResult[];
  visualDiffs: VisualDiff[];
  e2eFlows: E2EFlow[];
  cicdConfigs: CICDConfig[];
  apiKeys: ApiKey[];
  aiInsights: AIInsight[];
  aiPatterns: AIPattern[];
  aiPredictions: AIPrediction[];
  visualAnomalies: VisualAnomaly[];
  tenants: Tenant[];
  activeTenantId: string;
  billingPlans: BillingPlan[];
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  setActiveTenant: (id: string) => void;
  updateAnomalyStatus: (id: string, status: VisualAnomaly['status']) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'findingsCount' | 'targets'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTarget: (target: Omit<Target, 'id' | 'createdAt'>) => void;
  deleteTarget: (id: string) => void;
  startScan: (scan: Omit<Scan, 'id' | 'status' | 'progress' | 'findingsSummary' | 'pagesScanned' | 'totalRequests'>) => void;
  updateFindingStatus: (id: string, status: Finding['status']) => void;
  addE2EFlow: (flow: Omit<E2EFlow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateE2EFlow: (id: string, updates: Partial<E2EFlow>) => void;
  deleteE2EFlow: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [scans, setScans] = useState<Scan[]>(mockScans);
  const [findings, setFindings] = useState<Finding[]>(mockFindings);
  const [targets, setTargets] = useState<Target[]>(mockTargets);
  const [integrations] = useState<Integration[]>(mockIntegrations);
  const [stats] = useState<DashboardStats>(mockStats);
  const [crawlResults] = useState<CrawlResult[]>(mockCrawl);
  const [performanceMetrics] = useState<PerformanceMetrics[]>(mockPerf);
  const [accessibilityResults] = useState<AccessibilityResult[]>(mockA11y);
  const [securityResults] = useState<SecurityResult[]>(mockSecurity);
  const [visualDiffs] = useState<VisualDiff[]>(mockVisual);
  const [e2eFlows, setE2EFlows] = useState<E2EFlow[]>(mockE2E);
  const [cicdConfigs] = useState<CICDConfig[]>(mockCICD);
  const [apiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [aiInsights] = useState<AIInsight[]>(mockAIInsights);
  const [aiPatterns] = useState<AIPattern[]>(mockAIPatterns);
  const [aiPredictions] = useState<AIPrediction[]>(mockAIPredictions);
  const [visualAnomalies, setVisualAnomalies] = useState<VisualAnomaly[]>(mockAnomalies);
  const [tenants] = useState<Tenant[]>(mockTenants);
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant1');
  const [billingPlans] = useState<BillingPlan[]>(mockPlans);
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [paymentMethods] = useState<PaymentMethod[]>(mockPayments);

  const setActiveTenant = useCallback((id: string) => { setActiveTenantId(id); }, []);

  const updateAnomalyStatus = useCallback((id: string, status: VisualAnomaly['status']) => {
    setVisualAnomalies(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'findingsCount' | 'targets'>) => {
    const newProject: Project = { ...project, id: `p${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), findingsCount: { critical: 0, high: 0, medium: 0, low: 0, info: 0, warning: 0 }, targets: [] };
    setProjects(prev => [newProject, ...prev]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  }, []);

  const deleteProject = useCallback((id: string) => { setProjects(prev => prev.filter(p => p.id !== id)); }, []);

  const addTarget = useCallback((target: Omit<Target, 'id' | 'createdAt'>) => {
    const newTarget: Target = { ...target, id: `t${Date.now()}`, createdAt: new Date().toISOString() };
    setTargets(prev => [newTarget, ...prev]);
  }, []);

  const deleteTarget = useCallback((id: string) => { setTargets(prev => prev.filter(t => t.id !== id)); }, []);

  const startScan = useCallback((scan: Omit<Scan, 'id' | 'status' | 'progress' | 'findingsSummary' | 'pagesScanned' | 'totalRequests'>) => {
    const newScan: Scan = { ...scan, id: `s${Date.now()}`, status: 'pending', progress: 0, findingsSummary: { critical: 0, high: 0, medium: 0, low: 0, info: 0, warning: 0 }, pagesScanned: 0, totalRequests: 0 };
    setScans(prev => [newScan, ...prev]);
  }, []);

  const updateFindingStatus = useCallback((id: string, status: Finding['status']) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status, updatedAt: new Date().toISOString() } : f));
  }, []);

  const addE2EFlow = useCallback((flow: Omit<E2EFlow, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFlow: E2EFlow = { ...flow, id: `e2e${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setE2EFlows(prev => [newFlow, ...prev]);
  }, []);

  const updateE2EFlow = useCallback((id: string, updates: Partial<E2EFlow>) => {
    setE2EFlows(prev => prev.map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f));
  }, []);

  const deleteE2EFlow = useCallback((id: string) => { setE2EFlows(prev => prev.filter(f => f.id !== id)); }, []);

  return (
    <AppContext.Provider value={{
      projects, scans, findings, targets, integrations, stats, crawlResults,
      performanceMetrics, accessibilityResults, securityResults, visualDiffs,
      e2eFlows, cicdConfigs, apiKeys,
      aiInsights, aiPatterns, aiPredictions, visualAnomalies,
      tenants, activeTenantId, billingPlans, invoices, paymentMethods,
      addProject, updateProject, deleteProject, addTarget, deleteTarget, startScan,
      updateFindingStatus, addE2EFlow, updateE2EFlow, deleteE2EFlow,
      setActiveTenant, updateAnomalyStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
