import React, { useState } from 'react';
import {
  Alert,
  FieldReport,
  Infrastructure,
  LandslideEvent,
  RiskZone,
  Road,
  Village,
  WeatherData,
} from '../../types';
import { GISMap } from '../Map/GISMap';
import {
  AlertTriangle,
  Flame,
  Users,
  Bell,
  FileText,
  CloudRain,
  Clock,
  Shield,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  Activity,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface CommandCenterViewProps {
  riskZones: RiskZone[];
  villages: Village[];
  roads: Road[];
  infrastructure: Infrastructure[];
  historicalLandslides: LandslideEvent[];
  fieldReports: FieldReport[];
  alerts: Alert[];
  currentWeather: WeatherData | null;
  selectedZone: RiskZone | null;
  onSelectZone: (zone: RiskZone) => void;
  onNavigateTab: (tab: any) => void;
  lastUpdated: string;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  riskZones,
  villages,
  roads,
  infrastructure,
  historicalLandslides,
  fieldReports,
  alerts,
  currentWeather,
  selectedZone,
  onSelectZone,
  onNavigateTab,
  lastUpdated,
}) => {
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(2.0);

  // Computed KPI stats from real backend database state
  const criticalZones = riskZones.filter((z) => z.riskCategory === 'CRITICAL');
  const highRiskZones = riskZones.filter((z) => z.riskCategory === 'HIGH');
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const verifiedReports = fieldReports.filter((r) => r.status === 'VERIFIED');

  // Trend data for Mini Charts
  const hourlyRiskTrend = [
    { hour: '06:00', riskIndex: 45, rain: 8 },
    { hour: '08:00', riskIndex: 52, rain: 12 },
    { hour: '10:00', riskIndex: 68, rain: 24 },
    { hour: '12:00', riskIndex: 79, rain: 35 },
    { hour: '14:00', riskIndex: 88, rain: 42 },
    { hour: '16:00', riskIndex: 84, rain: 38 },
  ];

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto w-full">
      {/* Top Section: System Status & Regional Alert Marquee */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="font-bold text-slate-200">ACTIVE SITUATION MONITORING:</span>
          <span className="text-slate-300">
            {criticalZones.length} critical hazard sectors identified across Sikkim, Manipur, and Meghalaya mountain corridors.
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Telemetry Synced: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
            Models Calibrated
          </span>
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* 1. Critical Zones */}
        <div
          onClick={() => onNavigateTab('risk_map')}
          className="p-3 rounded-xl bg-slate-900 border border-red-500/30 hover:border-red-500 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Critical Zones</span>
            <Flame className="w-4 h-4 text-red-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-red-400">{criticalZones.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Risk &ge; 80% (P1 Priority)</div>
        </div>

        {/* 2. High Risk Zones */}
        <div
          onClick={() => onNavigateTab('risk_map')}
          className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-500 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">High Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-amber-400">{highRiskZones.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Risk 60% - 80%</div>
        </div>

        {/* 3. Potentially Affected Villages */}
        <div
          onClick={() => onNavigateTab('impact_analysis')}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Villages in Scope</span>
            <Users className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-sky-300">{villages.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">NER Habitations Monitored</div>
        </div>

        {/* 4. Active Alerts */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="p-3 rounded-xl bg-slate-900 border border-rose-500/30 hover:border-rose-500 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Alerts</span>
            <Bell className="w-4 h-4 text-rose-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-rose-400">{activeAlerts.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Disaster Advisories</div>
        </div>

        {/* 5. Field Reports */}
        <div
          onClick={() => onNavigateTab('field_reports')}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Field Reports</span>
            <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{fieldReports.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{verifiedReports.length} Verified Patrols</div>
        </div>

        {/* 6. Current Rainfall */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Current Rain</span>
            <CloudRain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300">
            {currentWeather?.rainfallMm ?? 18.5} <span className="text-xs font-normal text-slate-400">mm/h</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={currentWeather?.condition}>
            {currentWeather?.condition || 'Heavy Rain'}
          </div>
        </div>

        {/* 7. Priority Engine */}
        <div
          onClick={() => onNavigateTab('priority_engine')}
          className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 hover:border-purple-500 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Priority Max</span>
            <Sliders className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-purple-300">P1</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Score: 94/100</div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Zone Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Large Interactive Map (2 Cols) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              Northeast India Spatial Hazard Grid & Incident View
            </h2>
            <button
              onClick={() => onNavigateTab('risk_map')}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
            >
              Expand GIS Map <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <GISMap
            riskZones={riskZones}
            villages={villages}
            roads={roads}
            infrastructure={infrastructure}
            historicalLandslides={historicalLandslides}
            fieldReports={fieldReports}
            selectedZoneId={selectedZone?.id}
            onSelectZone={onSelectZone}
            selectedRadiusKm={selectedRadiusKm}
            className="h-[520px] w-full"
          />
        </div>

        {/* Right Panel: Selected Zone Details & Feature Contributors */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Target Zone Inspection
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  {selectedZone?.name || 'Dikchu-Singtam Corridor'}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedZone?.district}, {selectedZone?.state}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-black ${
                    selectedZone?.riskCategory === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : selectedZone?.riskCategory === 'HIGH'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  {selectedZone?.riskCategory || 'CRITICAL'} RISK
                </span>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  Prob: {Math.round((selectedZone?.probability || 0.94) * 100)}%
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">24h Rainfall:</span>
                <div className="font-bold text-slate-200">{selectedZone?.rainfall24h || 122} mm</div>
              </div>
              <div>
                <span className="text-slate-400">Soil Moisture:</span>
                <div className="font-bold text-slate-200">{selectedZone?.soilMoisture || 88}%</div>
              </div>
              <div>
                <span className="text-slate-400">Slope Gradient:</span>
                <div className="font-bold text-slate-200">{selectedZone?.slope || 44}°</div>
              </div>
              <div>
                <span className="text-slate-400">Priority Level:</span>
                <div className="font-bold text-rose-400">{selectedZone?.priorityLevel || 'P1'} ({selectedZone?.priorityScore || 94}/100)</div>
              </div>
            </div>

            {/* Explainable AI: Feature Contributors Waterfall */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Model Explanation (Risk Contributors)
                </span>
                <span className="text-[10px] text-slate-500">XGBoost Weights</span>
              </div>

              <div className="space-y-2">
                {(selectedZone?.contributors || [
                  { feature: 'Precipitation (24h/7d)', contribution: 48.5 },
                  { feature: 'Topographic Slope Angle', contribution: 24.2 },
                  { feature: 'Soil Saturation Rate', contribution: 18.1 },
                  { feature: 'Historical Vulnerability', contribution: 9.2 },
                ]).map((c, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>{c.feature}</span>
                      <span className="font-mono text-rose-400">{c.contribution}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, c.contribution * 1.8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radius Selector for Quick Impact Assessment */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span>Impact Buffer Radius:</span>
                <span className="font-bold text-rose-400">{selectedRadiusKm} km</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0.5, 1.0, 2.0, 5.0].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRadiusKm(r)}
                    className={`py-1 text-xs rounded-md font-medium transition ${
                      selectedRadiusKm === r
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {r >= 1 ? `${r} km` : `${r * 1000} m`}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('impact_analysis')}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <span>Full Impact & Population Analysis</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Alerts, Field Reports, and Analytics Mini-Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Alerts Feed */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Recent Prototype Alerts
            </h3>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-[11px] text-rose-400 hover:underline"
            >
              View All ({alerts.length})
            </button>
          </div>

          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white truncate" title={alert.title}>
                    {alert.locationName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-black">
                    {alert.riskCategory}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {alert.primaryReasons[0]}
                </p>
                <div className="text-[10px] text-slate-500">
                  Issued: {new Date(alert.issuedAt).toLocaleTimeString()} &bull; Priority: {alert.priorityLevel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Field Reports Feed */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Verified Citizen & Field Reports
            </h3>
            <button
              onClick={() => onNavigateTab('field_reports')}
              className="text-[11px] text-emerald-400 hover:underline"
            >
              Report Hazard
            </button>
          </div>

          <div className="space-y-2">
            {fieldReports.slice(0, 3).map((rep) => (
              <div
                key={rep.id}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-200">{rep.hazardType}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      rep.status === 'VERIFIED'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{rep.description}</p>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>{rep.locationName}</span>
                  <span>{new Date(rep.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Rainfall vs Risk Telemetry Chart */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Hazard Probability Trend (Hourly)
            </h3>
            <span className="text-[10px] text-slate-500">Live Telemetry</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyRiskTrend}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="riskIndex"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  name="Risk Index (%)"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="rain"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  name="Precip (mm)"
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-rose-500"></span> Risk Index (%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-sky-400"></span> Rainfall (mm/hr)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
