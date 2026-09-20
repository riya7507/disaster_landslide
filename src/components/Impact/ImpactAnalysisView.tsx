import React, { useState, useEffect } from 'react';
import {
  ImpactAnalysisResult,
  Infrastructure,
  RiskZone,
  Road,
  Village,
} from '../../types';
import { api } from '../../services/api';
import { GISMap } from '../Map/GISMap';
import {
  Layers,
  MapPin,
  Users,
  ShieldAlert,
  AlertCircle,
  Building2,
  GitCommit,
  Info,
  Sliders,
  CheckCircle,
  Activity,
  HeartPulse,
  School,
  ArrowRight,
} from 'lucide-react';

interface ImpactAnalysisViewProps {
  riskZones: RiskZone[];
  selectedZone: RiskZone | null;
  onSelectZone: (zone: RiskZone) => void;
  onNavigateToSimulation: () => void;
  onNavigateToAlerts: () => void;
}

export const ImpactAnalysisView: React.FC<ImpactAnalysisViewProps> = ({
  riskZones,
  selectedZone,
  onSelectZone,
  onNavigateToSimulation,
  onNavigateToAlerts,
}) => {
  const currentZone = selectedZone || riskZones[0];
  const [radiusKm, setRadiusKm] = useState<number>(2.0);
  const [impactData, setImpactData] = useState<ImpactAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!currentZone) return;
    let isMounted = true;
    setLoading(true);

    api
      .getRiskZoneDetails(currentZone.id, radiusKm)
      .then((res) => {
        if (isMounted) {
          setImpactData(res.impact);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load impact details:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentZone, radiusKm]);

  const radiusOptions = [
    { label: '500 m', value: 0.5 },
    { label: '1.0 km', value: 1.0 },
    { label: '2.0 km', value: 2.0 },
    { label: '5.0 km', value: 5.0 },
  ];

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto w-full">
      {/* Zone Selector and Radius Controls Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        {/* Zone Dropdown */}
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Target Hazard Zone:</span>
            <select
              value={currentZone?.id}
              onChange={(e) => {
                const z = riskZones.find((item) => item.id === e.target.value);
                if (z) onSelectZone(z);
              }}
              className="block mt-0.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-rose-500"
            >
              {riskZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.district}, {z.state}) &bull; {z.riskCategory}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Configurable Impact Radius Slider */}
        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] font-medium">Prototype Impact Radius:</span>
            <span className="font-bold text-rose-400 text-xs">{radiusKm >= 1 ? `${radiusKm} km` : `${radiusKm * 1000} m`} Buffer</span>
          </div>

          <div className="flex items-center gap-1">
            {radiusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRadiusKm(opt.value)}
                className={`px-3 py-1 text-xs rounded-lg font-bold transition ${
                  radiusKm === opt.value
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Limitations Notice */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">Prototype Impact Estimation Disclaimer:</span>
          <p className="text-amber-200/90 text-[11px] mt-0.5">
            Geographic perimeter buffering uses Great-Circle spatial intersection and prototype demographic estimates. Exact runout distances depend on complex lithology, rainfall volume, and slope morphology. Consider official geological verification and authorized response.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Map + Right Impact Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive GIS Map with Drawn Radius (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-500" />
              Spatial Impact Perimeter & Lifeline Intersection
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Perimeter Area: &asymp; {(Math.PI * Math.pow(radiusKm, 2)).toFixed(1)} km&sup2;
            </span>
          </div>

          <GISMap
            riskZones={riskZones}
            villages={impactData?.affectedVillages || []}
            roads={impactData?.affectedRoads || []}
            infrastructure={impactData?.affectedInfrastructure || []}
            selectedZoneId={currentZone?.id}
            selectedRadiusKm={radiusKm}
            className="h-[520px] w-full"
          />
        </div>

        {/* Right Column: Key Impact Metrics & Affected Assets */}
        <div className="space-y-4">
          {/* Priority & Hazard Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400">Prototype Priority Score</span>
              <span className="text-xs px-2.5 py-0.5 rounded font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {impactData?.priorityLevel || 'P1'} PRIORITY
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">
                {impactData?.priorityScore ?? 92}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>

            {/* Formula visualizer */}
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">LANDGUARD Priority Formula:</div>
              <div className="font-mono text-[10px] text-rose-300/90 break-all">
                Score = (HazardProb &times; 0.55) + (ExposureIndex &times; 0.45)
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                Separates Hazard from Vulnerability: Areas with hospital or highway access receive elevated preparedness priority.
              </div>
            </div>
          </div>

          {/* Affected Assets Summary Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Intersected Regional Assets ({radiusKm} km radius)
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                  <Users className="w-3 h-3 text-sky-400" /> Est. Population
                </div>
                <div className="font-bold text-base text-sky-300 mt-0.5">
                  {(impactData?.totalEstimatedPopulation ?? 4650).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">Demo Census Estimate</div>
              </div>

              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                  <Building2 className="w-3 h-3 text-purple-400" /> Habitations
                </div>
                <div className="font-bold text-base text-purple-300 mt-0.5">
                  {impactData?.affectedVillages.length ?? 2} Villages
                </div>
                <div className="text-[10px] text-slate-500">Within Perimeter</div>
              </div>

              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                  <GitCommit className="w-3 h-3 text-cyan-400" /> Lifeline Highways
                </div>
                <div className="font-bold text-base text-cyan-300 mt-0.5">
                  {impactData?.affectedRoads.length ?? 1} Intersected
                </div>
                <div className="text-[10px] text-slate-500">NH / SH Lifelines</div>
              </div>

              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                  <HeartPulse className="w-3 h-3 text-rose-400" /> Hospitals / Bridges
                </div>
                <div className="font-bold text-base text-rose-300 mt-0.5">
                  {impactData?.affectedInfrastructure.length ?? 3} Critical
                </div>
                <div className="text-[10px] text-slate-500">Facilities at Risk</div>
              </div>
            </div>

            {/* List of Affected Habitations */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-slate-300">Potentially Affected Villages:</span>
              <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
                {(impactData?.affectedVillages || []).length > 0 ? (
                  impactData?.affectedVillages.map((v) => (
                    <div
                      key={v.id}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{v.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Pop: {v.populationEstimate.toLocaleString()} &bull; {v.distanceKm} km away
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-medium">
                        {v.shelterAvailable ? 'Shelter ✓' : 'No Shelter'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-2 text-center">
                    No habitations found within {radiusKm} km radius.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Monitoring Section */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          Recommended Operational Monitoring Actions (Non-Authoritative)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {(impactData?.recommendedMonitoring || [
            'Deploy field operator for ground crack and pore-pressure verification',
            'Notify State Disaster Management Authority (SDMA) & district administration',
            'Pre-position earthmoving and clearance equipment along arterial highway corridor',
            'Place designated community shelter facilities on heightened standby',
          ]).map((action, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-300">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
