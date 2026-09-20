import React, { useState, useMemo } from 'react';
import {
  FieldReport,
  Infrastructure,
  LandslideEvent,
  RiskLevel,
  RiskZone,
  Road,
  Village,
} from '../../types';
import { GISMap } from '../Map/GISMap';
import {
  Filter,
  Search,
  MapPin,
  Flame,
  AlertTriangle,
  Compass,
  Layers,
  Activity,
  Sliders,
  X,
  ArrowRight,
} from 'lucide-react';

interface RiskMapViewProps {
  riskZones: RiskZone[];
  villages: Village[];
  roads: Road[];
  infrastructure: Infrastructure[];
  historicalLandslides: LandslideEvent[];
  fieldReports: FieldReport[];
  selectedZone: RiskZone | null;
  onSelectZone: (zone: RiskZone) => void;
  onNavigateToImpact: (zone: RiskZone) => void;
}

export const RiskMapView: React.FC<RiskMapViewProps> = ({
  riskZones,
  villages,
  roads,
  infrastructure,
  historicalLandslides,
  fieldReports,
  selectedZone,
  onSelectZone,
  onNavigateToImpact,
}) => {
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const statesList = [
    'ALL',
    'Sikkim',
    'Meghalaya',
    'Manipur',
    'Mizoram',
    'Nagaland',
    'Arunachal Pradesh',
    'Assam',
    'Tripura',
  ];

  const filteredZones = useMemo(() => {
    return riskZones.filter((zone) => {
      const matchState = selectedState === 'ALL' || zone.state.toLowerCase() === selectedState.toLowerCase();
      const matchCategory = selectedRiskCategory === 'ALL' || zone.riskCategory === selectedRiskCategory;
      const matchSearch =
        !searchQuery ||
        zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.state.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchCategory && matchSearch;
    });
  }, [riskZones, selectedState, selectedRiskCategory, searchQuery]);

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto w-full">
      {/* Top Filter & Search Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search district, corridor, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Middle: State Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
          >
            {statesList.map((st) => (
              <option key={st} value={st}>
                {st === 'ALL' ? 'All 8 NER States' : st}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Risk Category Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">Risk:</span>
          {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedRiskCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                selectedRiskCategory === cat
                  ? cat === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : cat === 'HIGH'
                    ? 'bg-orange-500 text-white'
                    : cat === 'MODERATE'
                    ? 'bg-yellow-500 text-black'
                    : cat === 'LOW'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Map + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Full Interactive Map (3 cols on large) */}
        <div className="lg:col-span-3 space-y-2">
          <GISMap
            riskZones={filteredZones}
            villages={villages}
            roads={roads}
            infrastructure={infrastructure}
            historicalLandslides={historicalLandslides}
            fieldReports={fieldReports}
            selectedZoneId={selectedZone?.id}
            onSelectZone={onSelectZone}
            className="h-[620px] w-full"
          />
        </div>

        {/* Right Sidebar: Zone Inspector & Quick List */}
        <div className="space-y-4">
          {/* Selected Zone Card */}
          {selectedZone ? (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-rose-300">
                    Inspecting Sector
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">{selectedZone.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedZone.district}, {selectedZone.state}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    selectedZone.riskCategory === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400'
                      : selectedZone.riskCategory === 'HIGH'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {selectedZone.riskCategory}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800">
                <div>
                  <span className="text-slate-500">Hazard Prob:</span>
                  <div className="font-bold text-rose-400">{Math.round(selectedZone.probability * 100)}%</div>
                </div>
                <div>
                  <span className="text-slate-500">Priority Score:</span>
                  <div className="font-bold text-white">{selectedZone.priorityLevel} ({selectedZone.priorityScore}/100)</div>
                </div>
                <div>
                  <span className="text-slate-500">Slope:</span>
                  <div className="font-bold text-slate-200">{selectedZone.slope}° gradient</div>
                </div>
                <div>
                  <span className="text-slate-500">Soil Moisture:</span>
                  <div className="font-bold text-slate-200">{selectedZone.soilMoisture}%</div>
                </div>
                <div>
                  <span className="text-slate-500">24h Rainfall:</span>
                  <div className="font-bold text-slate-200">{selectedZone.rainfall24h} mm</div>
                </div>
                <div>
                  <span className="text-slate-500">Elevation:</span>
                  <div className="font-bold text-slate-200">{selectedZone.elevation} m</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onNavigateToImpact(selectedZone)}
                className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-lg shadow-rose-950/40"
              >
                <span>Run Impact & Priority Evaluation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center py-8 text-slate-400 text-xs">
              <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-medium text-slate-300">Click any risk zone marker on the map to inspect its geotechnical characteristics.</p>
            </div>
          )}

          {/* List of Matched Sectors */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Active Grid Sectors</span>
              <span className="text-[11px] text-slate-500">{filteredZones.length} Sectors</span>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
              {filteredZones.map((zone) => {
                const isSelected = selectedZone?.id === zone.id;
                return (
                  <div
                    key={zone.id}
                    onClick={() => onSelectZone(zone)}
                    className={`p-2 rounded-lg cursor-pointer transition text-xs flex items-center justify-between border ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold truncate max-w-[140px]">{zone.name}</div>
                      <div className="text-[10px] text-slate-400">{zone.state}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          zone.riskCategory === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400'
                            : zone.riskCategory === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {Math.round(zone.probability * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
