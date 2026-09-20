import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  FieldReport,
  Infrastructure,
  LandslideEvent,
  RiskZone,
  Road,
  User,
  Village,
  WeatherData,
} from './types';
import { api } from './services/api';
import { Navbar, NavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CommandCenterView } from './components/CommandCenter/CommandCenterView';
import { RiskMapView } from './components/RiskMap/RiskMapView';
import { ImpactAnalysisView } from './components/Impact/ImpactAnalysisView';
import { PriorityEngineView } from './components/Priority/PriorityEngineView';
import { AlertsView } from './components/Alerts/AlertsView';
import { FieldReportsView } from './components/Reports/FieldReportsView';
import { SimulationView } from './components/Simulation/SimulationView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { DataSourcesView } from './components/DataSources/DataSourcesView';
import { GuidedDemoModal } from './components/Demo/GuidedDemoModal';
import { AuthModal } from './components/Auth/AuthModal';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('command_center');
  const [showLandingPage, setShowLandingPage] = useState<boolean>(false);

  // Core Data States
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [historicalLandslides, setHistoricalLandslides] = useState<LandslideEvent[]>([]);
  const [fieldReports, setFieldReports] = useState<FieldReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);

  // Selected Zone for Inspection across Map, Impact, Simulation
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);

  // Auth & Modals
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isGuidedDemoOpen, setIsGuidedDemoOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  // Load all primary data from backend API
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [zonesRes, histRes, reportsRes, alertsRes, weatherRes] = await Promise.all([
        api.getRiskZones(),
        api.getHistoricalLandslides(),
        api.getFieldReports(),
        api.getAlerts(),
        api.getCurrentWeather(27.3389, 88.6065, 'Dikchu-Gangtok Corridor, Sikkim'),
      ]);

      setRiskZones(zonesRes.zones);
      setHistoricalLandslides(histRes.events);
      setFieldReports(reportsRes.reports);
      setAlerts(alertsRes.alerts);
      setCurrentWeather(weatherRes);

      // Default selected zone to the highest priority / critical zone
      if (zonesRes.zones.length > 0) {
        const topCritical = zonesRes.zones.find((z) => z.riskCategory === 'CRITICAL') || zonesRes.zones[0];
        setSelectedZone((prev) => prev || topCritical);

        // Fetch detailed spatial impact for default zone
        try {
          const detailRes = await api.getRiskZoneDetails(topCritical.id, 2.0);
          setVillages(detailRes.impact.affectedVillages);
          setRoads(detailRes.impact.affectedRoads);
          setInfrastructure(detailRes.impact.affectedInfrastructure);
        } catch (e) {
          // fallback
        }
      }

      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error('Failed to load LANDGUARD data from server:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial Boot
  useEffect(() => {
    loadAllData();

    // Check stored user session
    api.getCurrentUser().then((res) => {
      if (res?.user) {
        setCurrentUser(res.user);
      } else {
        // Auto-login default Disaster Authority demo profile for seamless evaluation
        api.login('authority@landguard.demo', 'AuthorityPass2026!').then((auth) => {
          setCurrentUser(auth.user);
        }).catch(() => {});
      }
    });
  }, [loadAllData]);

  // When selectedZone changes, update affected regional items
  const handleSelectZone = useCallback(async (zone: RiskZone) => {
    setSelectedZone(zone);
    try {
      const res = await api.getRiskZoneDetails(zone.id, 2.0);
      setVillages(res.impact.affectedVillages);
      setRoads(res.impact.affectedRoads);
      setInfrastructure(res.impact.affectedInfrastructure);
    } catch (err) {
      console.error('Error fetching zone impact:', err);
    }
  }, []);

  const handleNavigateToImpact = (zone: RiskZone) => {
    handleSelectZone(zone);
    setActiveTab('impact_analysis');
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setShowLandingPage(false);
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onStartGuidedDemo={() => setIsGuidedDemoOpen(true)}
        onRefreshAll={loadAllData}
        isRefreshing={isRefreshing}
        activeAlertsCount={alerts.filter((a) => a.status === 'ACTIVE').length}
        newReportsCount={fieldReports.filter((r) => r.status === 'NEW').length}
      />

      {/* Main View Switcher */}
      <main className="flex-1 pb-10">
        {showLandingPage ? (
          <LandingPage
            onOpenCommandCenter={() => {
              setShowLandingPage(false);
              setActiveTab('command_center');
            }}
            onExploreRiskMap={() => {
              setShowLandingPage(false);
              setActiveTab('risk_map');
            }}
            onStartGuidedDemo={() => {
              setShowLandingPage(false);
              setIsGuidedDemoOpen(true);
            }}
          />
        ) : (
          <>
            {activeTab === 'command_center' && (
              <CommandCenterView
                riskZones={riskZones}
                villages={villages}
                roads={roads}
                infrastructure={infrastructure}
                historicalLandslides={historicalLandslides}
                fieldReports={fieldReports}
                alerts={alerts}
                currentWeather={currentWeather}
                selectedZone={selectedZone}
                onSelectZone={handleSelectZone}
                onNavigateTab={(tab) => setActiveTab(tab)}
                lastUpdated={lastUpdated}
              />
            )}

            {activeTab === 'risk_map' && (
              <RiskMapView
                riskZones={riskZones}
                villages={villages}
                roads={roads}
                infrastructure={infrastructure}
                historicalLandslides={historicalLandslides}
                fieldReports={fieldReports}
                selectedZone={selectedZone}
                onSelectZone={handleSelectZone}
                onNavigateToImpact={handleNavigateToImpact}
              />
            )}

            {activeTab === 'impact_analysis' && (
              <ImpactAnalysisView
                riskZones={riskZones}
                selectedZone={selectedZone}
                onSelectZone={handleSelectZone}
                onNavigateToSimulation={() => setActiveTab('simulation')}
                onNavigateToAlerts={() => setActiveTab('alerts')}
              />
            )}

            {activeTab === 'priority_engine' && (
              <PriorityEngineView
                riskZones={riskZones}
                onSelectZone={handleSelectZone}
                onNavigateToImpact={handleNavigateToImpact}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsView
                alerts={alerts}
                riskZones={riskZones}
                onRefreshAlerts={loadAllData}
                onNavigateToImpact={handleNavigateToImpact}
              />
            )}

            {activeTab === 'field_reports' && (
              <FieldReportsView
                reports={fieldReports}
                currentUser={currentUser}
                onRefreshReports={loadAllData}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            )}

            {activeTab === 'simulation' && (
              <SimulationView
                riskZones={riskZones}
                selectedZone={selectedZone}
                onSelectZone={handleSelectZone}
              />
            )}

            {activeTab === 'analytics' && <AnalyticsView />}

            {activeTab === 'data_sources' && <DataSourcesView />}
          </>
        )}
      </main>

      {/* Guided Demo Interactive Modal */}
      <GuidedDemoModal
        isOpen={isGuidedDemoOpen}
        onClose={() => setIsGuidedDemoOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Authentication & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Sticky Bottom Bar for Landing Page Toggle */}
      <div className="fixed bottom-3 left-3 z-40">
        <button
          onClick={() => setShowLandingPage(!showLandingPage)}
          className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 shadow-xl backdrop-blur-md transition flex items-center gap-1.5"
        >
          <span>{showLandingPage ? '← Return to Active System' : 'View SIH Landing Page'}</span>
        </button>
      </div>
    </div>
  );
}

export default App;
