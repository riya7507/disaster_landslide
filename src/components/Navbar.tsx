import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Map,
  Layers,
  AlertCircle,
  FileSpreadsheet,
  Cpu,
  BarChart3,
  Database,
  PlayCircle,
  RefreshCw,
  UserCheck,
  Radio,
  Sliders,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Role, User } from '../types';

export type NavTab =
  | 'command_center'
  | 'risk_map'
  | 'impact_analysis'
  | 'priority_engine'
  | 'alerts'
  | 'field_reports'
  | 'simulation'
  | 'analytics'
  | 'data_sources';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onStartGuidedDemo: () => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  activeAlertsCount: number;
  newReportsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onStartGuidedDemo,
  onRefreshAll,
  isRefreshing,
  activeAlertsCount,
  newReportsCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'command_center', label: 'Command Center', icon: <Radio className="w-4 h-4" /> },
    { id: 'risk_map', label: 'Risk Map', icon: <Map className="w-4 h-4" /> },
    { id: 'impact_analysis', label: 'Impact Analysis', icon: <Layers className="w-4 h-4" /> },
    { id: 'priority_engine', label: 'Priority Engine', icon: <Sliders className="w-4 h-4" /> },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: <AlertCircle className="w-4 h-4" />,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
    },
    {
      id: 'field_reports',
      label: 'Field Reports',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: newReportsCount > 0 ? newReportsCount : undefined,
    },
    { id: 'simulation', label: 'Simulation', icon: <Cpu className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'data_sources', label: 'Data Sources', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {/* Top Banner: Emergency Status & Time */}
      <div className="flex items-center justify-between px-4 py-1 border-b border-slate-900 text-[11px] bg-slate-900/50">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-semibold tracking-wide text-slate-300">
            SIH26001 — AI Landslide Early Warning & Spatial Monitoring (NER)
          </span>
          <span className="hidden md:inline-block text-slate-500">|</span>
          <span className="hidden md:inline-block text-slate-400">
            Target States: Sikkim, Meghalaya, Manipur, Mizoram, Nagaland, Arunachal, Assam, Tripura
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1 font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            {currentTime}
          </div>
          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-1 hover:text-slate-100 transition disabled:opacity-50"
            title="Refresh all real-time data & predictions"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectTab('command_center')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-white">
                  LANDGUARD
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  NER Prototype
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Predict. Protect. Respond.
              </p>
            </div>
          </div>
        </div>

        {/* Guided Demo Button & User Role */}
        <div className="flex items-center gap-2">
          {/* Guided Demo Button */}
          <button
            onClick={onStartGuidedDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 hover:from-rose-500 hover:to-amber-500 transition active:scale-95"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Guided Demo</span>
          </button>

          {/* User Role & Auth */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs hover:bg-slate-800 transition text-slate-200"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-[11px] leading-tight text-white">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-rose-400">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-1 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                    <p className="font-medium text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-rose-300 font-semibold">
                      {currentUser.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onOpenAuthModal();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Switch Demo Role</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-red-500/20 text-red-400 transition flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Demo Sign In
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Tab Navigation */}
      <nav className="flex items-center gap-1 px-4 overflow-x-auto no-scrollbar border-t border-slate-900 bg-slate-950/80">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                isActive
                  ? 'border-rose-500 text-white bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
