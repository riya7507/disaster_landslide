import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Activity,
  History,
  PieChart as PieIcon,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    api
      .getAnalytics()
      .then((res) => {
        if (isMounted) {
          setAnalyticsData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Analytics load error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const riskPieData = analyticsData
    ? [
        { name: 'Critical (≥80%)', value: analyticsData.riskCounts.CRITICAL, color: '#ef4444' },
        { name: 'High (60-80%)', value: analyticsData.riskCounts.HIGH, color: '#f97316' },
        { name: 'Moderate (40-60%)', value: analyticsData.riskCounts.MODERATE, color: '#eab308' },
        { name: 'Low (<40%)', value: analyticsData.riskCounts.LOW, color: '#22c55e' },
      ]
    : [];

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Regional Telemetry & Geospatial Statistics
          </span>
          <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            Northeast India Landslide Analytics & Vulnerability Trends
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical distributions computed directly from live spatial risk grids and historical disaster catalogs.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Last Processed: {analyticsData ? new Date(analyticsData.generatedAt).toLocaleTimeString() : '...'}
        </div>
      </div>

      {/* Grid of 4 Key Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Rainfall vs Landslide Risk Correlation Curve */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Precipitation Trigger Sensitivity Curve
            </h3>
            <span className="text-[10px] text-slate-500">ML Empirical Thresholds</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.rainfallRiskCurve || []}>
                <XAxis dataKey="rainMm" stroke="#64748b" fontSize={10} unit=" mm" />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="riskPercent"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  name="Landslide Risk %"
                  dot={{ r: 4, fill: '#0284c7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400">
            Critical inflection occurs above 80 mm/24h where soil pore-water pressure rapidly overcomes slope cohesion.
          </p>
        </div>

        {/* 2. Risk Distribution Pie Chart */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-rose-400" />
              Risk Category Breakdown (Active Grid Sectors)
            </h3>
            <span className="text-[10px] text-slate-500">Live Database</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            {analyticsData?.riskCounts.CRITICAL || 0} Critical Sectors &bull;{' '}
            {analyticsData?.riskCounts.HIGH || 0} High Risk Sectors
          </p>
        </div>

        {/* 3. State-wise Risk Distribution across NER States */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              State-wise Vulnerability Comparison (NER States)
            </h3>
            <span className="text-[10px] text-slate-500">Sectors &amp; Critical Ratio</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.stateDistribution || []}>
                <XAxis dataKey="state" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="totalZones" fill="#64748b" name="Monitored Sectors" radius={[3, 3, 0, 0]} />
                <Bar dataKey="criticalZones" fill="#ef4444" name="Critical / High Zones" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400">
            Sikkim, Meghalaya, and Manipur exhibit highest concentration of active slope instability zones.
          </p>
        </div>

        {/* 4. Historical Landslide Casualties & Events */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              Historical Major Events (Trigger Rain vs Casualties)
            </h3>
            <span className="text-[10px] text-slate-500">GSI / SDMA Archive</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.historicalByYear || []}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="rainfall" fill="#38bdf8" name="Trigger Rain (mm)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="casualties" fill="#f43f5e" name="Recorded Casualties" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400">
            Noney 2022 railway camp and Malin 2014 show catastrophic impact of unmitigated mass movement.
          </p>
        </div>
      </div>
    </div>
  );
};
