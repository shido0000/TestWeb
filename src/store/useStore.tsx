import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Project, Scan, Finding, Target, Integration, DashboardStats } from '../types';
import {
  projects as mockProjects,
  scans as mockScans,
  findings as mockFindings,
  targets as mockTargets,
  integrations as mockIntegrations,
  dashboardStats as mockStats,
} from '../data/mockData';

interface AppState {
  projects: Project[];
  scans: Scan[];
  findings: Finding[];
  targets: Target[];
  integrations: Integration[];
  stats: DashboardStats;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'findingsCount' | 'targets'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTarget: (target: Omit<Target, 'id' | 'createdAt'>) => void;
  deleteTarget: (id: string) => void;
  startScan: (scan: Omit<Scan, 'id' | 'status' | 'progress' | 'findingsSummary' | 'pagesScanned' | 'totalRequests'>) => void;
  updateFindingStatus: (id: string, status: Finding['status']) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [scans, setScans] = useState<Scan[]>(mockScans);
  const [findings, setFindings] = useState<Finding[]>(mockFindings);
  const [targets, setTargets] = useState<Target[]>(mockTargets);
  const [integrations] = useState<Integration[]>(mockIntegrations);
  const [stats] = useState<DashboardStats>(mockStats);

  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'findingsCount' | 'targets'>) => {
    const newProject: Project = {
      ...project,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      findingsCount: { critical: 0, high: 0, medium: 0, low: 0, info: 0, warning: 0 },
      targets: [],
    };
    setProjects(prev => [newProject, ...prev]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const addTarget = useCallback((target: Omit<Target, 'id' | 'createdAt'>) => {
    const newTarget: Target = {
      ...target,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTargets(prev => [newTarget, ...prev]);
  }, []);

  const deleteTarget = useCallback((id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  }, []);

  const startScan = useCallback((scan: Omit<Scan, 'id' | 'status' | 'progress' | 'findingsSummary' | 'pagesScanned' | 'totalRequests'>) => {
    const newScan: Scan = {
      ...scan,
      id: `s${Date.now()}`,
      status: 'pending',
      progress: 0,
      findingsSummary: { critical: 0, high: 0, medium: 0, low: 0, info: 0, warning: 0 },
      pagesScanned: 0,
      totalRequests: 0,
    };
    setScans(prev => [newScan, ...prev]);
  }, []);

  const updateFindingStatus = useCallback((id: string, status: Finding['status']) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status, updatedAt: new Date().toISOString() } : f));
  }, []);

  return (
    <AppContext.Provider value={{
      projects, scans, findings, targets, integrations, stats,
      addProject, updateProject, deleteProject,
      addTarget, deleteTarget, startScan, updateFindingStatus,
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
