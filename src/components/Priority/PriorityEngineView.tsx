import React from 'react';
import { PriorityLevel, RiskZone } from '../../types';
import {
  Sliders,
  Info,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Layers,
  MapPin,
  CheckCircle2,
  Users,
  Building2,
  GitCommit,
  History,
} from 'lucide-react';

interface PriorityEngineViewProps {
  riskZones: RiskZone[];
  onSelectZone: (zone: RiskZone) => void;
  onNavigateToImpact: (zone: RiskZone) => void;
}

export const PriorityEngineView: React.FC<PriorityEngineViewProps> = ({
  riskZones,
  onSelectZone,
  onNavigateToImpact,
}) => {
  // Sort zones by priority score descending
  const sortedZones = [...riskZones].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header & Formula Breakdown Box */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Deterministic Decision Support Logic
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              LANDGUARD Priority Scoring Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent, accountable risk prioritization designed to assist emergency authorities allocate limited response resources.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-right">
            <span className="text-slate-400 block text-[10px]">Active Monitored Locations:</span>
            <span className="text-base font-black text-rose-400">{riskZones.length} Key Sectors</span>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Prototype Priority Score for decision support — not official disaster classification.</strong> Priority scores quantify relative urgency by fusing ML failure probabilities with multi-criteria infrastructure and demographic exposure metrics.
          </p>
        </div>

        {/* Mathematical Formula Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {/* Component 1: Hazard Risk */}
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 1. Hazard Risk (55%)
              </span>
              <span className="text-[10px] font-mono text-slate-500">Weight: 0.55</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Direct physical probability output from the Gradient-Boosted ML model based on 24h precipitation, slope gradient, and moisture saturation.
            </p>
          </div>

          {/* Component 2: Population Exposure */}
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> 2. Population (15.75%)
              </span>
              <span className="text-[10px] font-mono text-slate-500">Sub-weight: 35%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Habitation population density within 2 km buffer, weighted inversely by community emergency shelter availability.
            </p>
          </div>

          {/* Component 3: Critical Facilities */}
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> 3. Infrastructure (18.0%)
              </span>
              <span className="text-[10px] font-mono text-slate-500">Sub-weight: 40%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Vulnerability of hospitals, primary health centers, electrical grid substations, and critical bridges within proximity.
            </p>
          </div>

          {/* Component 4: Lifeline Highways */}
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <GitCommit className="w-3.5 h-3.5" /> 4. Road Lifelines (11.25%)
              </span>
              <span className="text-[10px] font-mono text-slate-500">Sub-weight: 25%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Strategic National Highways (e.g. NH-10 Sikkim lifeline, NH-29 Nagaland/Manipur) essential for relief supply lines.
            </p>
          </div>
        </div>

        {/* Complete Formula Equation */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-center text-slate-300">
          <span className="text-rose-400 font-bold">Priority Score</span> = (
          <span className="text-rose-300">HazardProbability</span> &times; 0.55) + [
          (<span className="text-sky-300">PopulationExposure</span> &times; 0.35 +{' '}
          <span className="text-purple-300">InfraCriticality</span> &times; 0.40 +{' '}
          <span className="text-cyan-300">RoadLifeline</span> &times; 0.25) &times; 0.45 ]
        </div>
      </div>

      {/* Priority Level Threshold Definitions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900 border border-red-500/30 text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-black text-red-400 text-sm">P1 — URGENT ACTION</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
              Score &ge; 75
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            High failure probability intersecting high population or critical highway lifelines. Immediate field patrol and shelter readiness.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-orange-500/30 text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-black text-orange-400 text-sm">P2 — HEIGHTENED WATCH</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">
              Score 55 - 74
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Elevated slope moisture with moderate infrastructure proximity. Frequent sensor polling and road clearance alerts.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-yellow-500/30 text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-black text-yellow-400 text-sm">P3 — ADVISORY MONITORING</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold">
              Score 35 - 54
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Moderate rainfall or slope angle. Routine monitoring with community awareness notifications.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-black text-emerald-400 text-sm">P4 — ROUTINE SURVEILLANCE</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              Score &lt; 35
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Low baseline risk and stable geotechnical readings. Standard periodic meteorological review.
          </p>
        </div>
      </div>

      {/* Priority Ranked Table of Monitored Locations */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-500" />
            Ranked Operational Priority Registry (All NER Sectors)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Sorted by Composite Priority Score</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Location / Sector</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Priority Level</th>
                <th className="py-2.5 px-3">Priority Score</th>
                <th className="py-2.5 px-3">Hazard Prob</th>
                <th className="py-2.5 px-3">24h Rain</th>
                <th className="py-2.5 px-3">Slope</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedZones.map((zone, idx) => {
                const isP1 = zone.priorityLevel === 'P1';
                const isP2 = zone.priorityLevel === 'P2';
                return (
                  <tr key={zone.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {zone.name}
                      <span className="block text-[10px] font-normal text-slate-400">
                        {zone.district}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{zone.state}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-black text-[11px] ${
                          isP1
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isP2
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {zone.priorityLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-black text-white text-sm">
                      {zone.priorityScore}
                      <span className="text-[10px] text-slate-500 font-normal"> / 100</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-rose-300">
                      {Math.round(zone.probability * 100)}%
                    </td>
                    <td className="py-3 px-3 text-slate-300">{zone.rainfall24h} mm</td>
                    <td className="py-3 px-3 text-slate-300">{zone.slope}°</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectZone(zone);
                          onNavigateToImpact(zone);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <span>Analyze</span>
                        <ArrowRight className="w-3 h-3 text-rose-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
