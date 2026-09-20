import React, { useState, useEffect } from 'react';
import { RiskZone, SimulationResult } from '../../types';
import { api } from '../../services/api';
import {
  Cpu,
  Sliders,
  TrendingUp,
  Flame,
  ArrowRight,
  Info,
  RotateCcw,
  CloudRain,
  Droplets,
  Mountain,
  History,
  CheckCircle2,
  Users,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface SimulationViewProps {
  riskZones: RiskZone[];
  selectedZone: RiskZone | null;
  onSelectZone: (zone: RiskZone) => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  riskZones,
  selectedZone,
  onSelectZone,
}) => {
  const currentZone = selectedZone || riskZones[0];

  // Sliders state
  const [rainfall24h, setRainfall24h] = useState<number>(currentZone?.rainfall24h || 60);
  const [soilMoisture, setSoilMoisture] = useState<number>(currentZone?.soilMoisture || 65);
  const [slope, setSlope] = useState<number>(currentZone?.slope || 35);
  const [historicalEvents, setHistoricalEvents] = useState<number>(currentZone?.historicalEventsCount || 2);

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync sliders when selected zone changes
  useEffect(() => {
    if (currentZone) {
      setRainfall24h(currentZone.rainfall24h);
      setSoilMoisture(currentZone.soilMoisture);
      setSlope(currentZone.slope);
      setHistoricalEvents(currentZone.historicalEventsCount);
    }
  }, [currentZone]);

  // Recalculate simulation
  useEffect(() => {
    if (!currentZone) return;

    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(() => {
      api
        .runSimulation({
          zoneId: currentZone.id,
          simulatedRainfall24h: rainfall24h,
          simulatedSoilMoisture: soilMoisture,
          simulatedSlope: slope,
          simulatedHistoricalEvents: historicalEvents,
        })
        .then((res) => {
          if (isMounted) {
            setSimulationResult(res);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Simulation error:', err);
          if (isMounted) setLoading(false);
        });
    }, 150); // small debounce

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentZone, rainfall24h, soilMoisture, slope, historicalEvents]);

  const handleResetBaseline = () => {
    if (!currentZone) return;
    setRainfall24h(currentZone.rainfall24h);
    setSoilMoisture(currentZone.soilMoisture);
    setSlope(currentZone.slope);
    setHistoricalEvents(currentZone.historicalEventsCount);
  };

  const chartComparisonData = [
    {
      metric: 'Hazard Probability (%)',
      Baseline: simulationResult?.baselineScenario.riskPercentage ?? 65,
      Simulated: simulationResult?.simulatedScenario.riskPercentage ?? 88,
    },
    {
      metric: 'Priority Score (1-100)',
      Baseline: simulationResult?.baselineScenario.priorityScore ?? 68,
      Simulated: simulationResult?.simulatedScenario.priorityScore ?? 92,
    },
    {
      metric: 'Soil Saturation (%)',
      Baseline: simulationResult?.baselineScenario.soilMoisture ?? 65,
      Simulated: simulationResult?.simulatedScenario.soilMoisture ?? 85,
    },
  ];

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Geotechnical What-If Laboratory
          </span>
          <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            Landslide Risk Simulation & Sensitivity Testing
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test extreme cloudburst scenarios, soil supersaturation, and slope shear thresholds in real-time.
          </p>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Target Zone:</span>
          <select
            value={currentZone?.id}
            onChange={(e) => {
              const z = riskZones.find((item) => item.id === e.target.value);
              if (z) onSelectZone(z);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-purple-500"
          >
            {riskZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} ({z.state})
              </option>
            ))}
          </select>

          <button
            onClick={handleResetBaseline}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Reset sliders to actual recorded baseline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>LANDGUARD Simulation Engine Notice:</strong> This interactive sandbox runs the calibrated Gradient-Boosted ML risk equations on synthetic or modified inputs. It is an experimental demonstration model designed for disaster preparedness drills, not an official meteorological forecast.
        </p>
      </div>

      {/* Main Grid: Left Sliders (1 Col), Right Comparison (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Interactive Controls */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              Hypothetical Forcing Parameters
            </h3>
            {loading && <span className="text-[10px] text-purple-400 animate-pulse font-mono">Calculating...</span>}
          </div>

          {/* Slider 1: 24h Rainfall */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-slate-300 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-cyan-400" /> Simulated 24h Rainfall
              </span>
              <span className="font-mono text-cyan-400 font-bold">{rainfall24h} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="250"
              value={rainfall24h}
              onChange={(e) => setRainfall24h(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 mm (Dry)</span>
              <span>100 mm (Monsoon)</span>
              <span>250 mm (Extreme Cloudburst)</span>
            </div>
          </div>

          {/* Slider 2: Soil Moisture */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-400" /> Simulated Soil Moisture
              </span>
              <span className="font-mono text-sky-400 font-bold">{soilMoisture}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="99"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>10% (Desiccated)</span>
              <span>60% (Normal)</span>
              <span>99% (Complete Liquefaction)</span>
            </div>
          </div>

          {/* Slider 3: Slope Angle */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Mountain className="w-4 h-4 text-amber-400" /> Topographic Slope Angle
              </span>
              <span className="font-mono text-amber-400 font-bold">{slope}°</span>
            </div>
            <input
              type="range"
              min="5"
              max="65"
              value={slope}
              onChange={(e) => setSlope(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>5° (Valley Flat)</span>
              <span>30° (Moderate Hill)</span>
              <span>65° (Cliff Face)</span>
            </div>
          </div>

          {/* Slider 4: Historical Past Landslides */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-slate-300 flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-400" /> Past Landslide Incidents
              </span>
              <span className="font-mono text-purple-400 font-bold">{historicalEvents} events</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={historicalEvents}
              onChange={(e) => setHistoricalEvents(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 (Stable History)</span>
              <span>5 (Repeated Scarp)</span>
              <span>10 (Chronic Zone)</span>
            </div>
          </div>

          {/* Quick Scenario Presets */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Quick Simulation Presets:</span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => {
                  setRainfall24h(165);
                  setSoilMoisture(94);
                  setSlope(48);
                  setHistoricalEvents(4);
                }}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 text-left text-[11px] font-medium"
              >
                Cloudburst Flash Flood
              </button>
              <button
                onClick={() => {
                  setRainfall24h(15);
                  setSoilMoisture(35);
                  setSlope(25);
                  setHistoricalEvents(1);
                }}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-left text-[11px] font-medium"
              >
                Dry Winter Baseline
              </button>
            </div>
          </div>
        </div>

        {/* Right: Before vs After Side-by-Side Comparison (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Side-by-Side Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Baseline Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Recorded Baseline</span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300">
                  {simulationResult?.baselineScenario.riskCategory || 'MODERATE'}
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400">Baseline Failure Probability:</div>
                <div className="text-3xl font-black text-slate-200 mt-0.5">
                  {simulationResult?.baselineScenario.riskPercentage ?? 65}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800">
                <div>
                  <span className="text-slate-500">24h Rain:</span>
                  <div className="font-bold text-slate-300">
                    {simulationResult?.baselineScenario.rainfall24h ?? 60} mm
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Soil Moisture:</span>
                  <div className="font-bold text-slate-300">
                    {simulationResult?.baselineScenario.soilMoisture ?? 65}%
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Priority Score:</span>
                  <div className="font-bold text-slate-300">
                    {simulationResult?.baselineScenario.priorityLevel} (
                    {simulationResult?.baselineScenario.priorityScore}/100)
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Pop. Exposed:</span>
                  <div className="font-bold text-slate-300">
                    {simulationResult?.baselineScenario.affectedPopulationEstimate?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-purple-400">Simulated Outcome</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    simulationResult?.simulatedScenario.riskCategory === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : simulationResult?.simulatedScenario.riskCategory === 'HIGH'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {simulationResult?.simulatedScenario.riskCategory || 'HIGH'}
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400">Simulated Failure Probability:</div>
                <div className="text-3xl font-black text-rose-400 mt-0.5 flex items-baseline gap-2">
                  <span>{simulationResult?.simulatedScenario.riskPercentage ?? 88}%</span>
                  {simulationResult?.delta.probabilityDelta !== undefined && (
                    <span
                      className={`text-xs font-bold font-mono ${
                        simulationResult.delta.probabilityDelta > 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {simulationResult.delta.probabilityDelta > 0 ? '+' : ''}
                      {simulationResult.delta.probabilityDelta}%
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800">
                <div>
                  <span className="text-slate-500">Sim Rain:</span>
                  <div className="font-bold text-cyan-300">{rainfall24h} mm</div>
                </div>
                <div>
                  <span className="text-slate-500">Sim Moisture:</span>
                  <div className="font-bold text-sky-300">{soilMoisture}%</div>
                </div>
                <div>
                  <span className="text-slate-500">Priority Score:</span>
                  <div className="font-bold text-purple-300">
                    {simulationResult?.simulatedScenario.priorityLevel} (
                    {simulationResult?.simulatedScenario.priorityScore}/100)
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Pop. Exposed:</span>
                  <div className="font-bold text-slate-200">
                    {simulationResult?.simulatedScenario.affectedPopulationEstimate?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Comparison Chart */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Sensitivity Metric Delta (Baseline vs Simulated Scenario)
            </h4>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartComparisonData}>
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
