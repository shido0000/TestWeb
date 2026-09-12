import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Target, Scan, AlertTriangle,
  FileText, Settings, Zap, Menu, X, Bell, Search, ChevronDown
} from 'lucide-react';
import { currentUser } from '../data/mockData';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/targets', icon: Target, label: 'Targets' },
  { to: '/scans', icon: Scan, label: 'Scans' },
  { to: '/findings', icon: AlertTriangle, label: 'Findings' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-surface-light border-r border-border transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight">TestHub</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-widest">Web Testing Platform</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-text-secondary hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20 shadow-sm shadow-primary-500/5'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-lighter/50'
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-surface/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{currentUser.name}</p>
                <p className="text-xs text-text-muted truncate">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-3 border-b border-border bg-surface-light/50 backdrop-blur-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-text-secondary hover:text-text-primary">
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search projects, findings, scans..."
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-lighter rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-critical rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-lighter transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-sm text-text-secondary hidden sm:block">{currentUser.name}</span>
                <ChevronDown className="w-3 h-3 text-text-muted" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-light border border-border rounded-lg shadow-xl z-50 py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-lighter">Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-lighter">Settings</a>
                  <hr className="my-1 border-border" />
                  <a href="#" className="block px-4 py-2 text-sm text-critical hover:bg-surface-lighter">Sign Out</a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
