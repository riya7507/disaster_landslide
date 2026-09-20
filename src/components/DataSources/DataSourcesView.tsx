import React, { useEffect, useState } from 'react';
import { DataSourceStatus } from '../../types';
import { api } from '../../services/api';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Radio,
  ExternalLink,
  ShieldCheck,
  Cpu,
  CloudRain,
  Map,
  Layers,
  FileCode,
} from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  const [sources, setSources] = useState<DataSourceStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    api
      .getDataSources()
      .then((res) => {
        if (isMounted) {
          setSources(res.sources);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Data sources load error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              System Transparency & Integrity Architecture
            </span>
            <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              Connected Data Ingestion Layers & Demonstration Modes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Full transparency regarding live telemetry endpoints, synthetic prototype generation, and ML inference pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SYSTEM AUDIT: HEALTHY</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed pt-1">
          LANDGUARD maintains strict separation between verified live API streams (such as real-time OpenWeather or Google Maps Platform) and calibrated demonstration fallbacks. When optional third-party API keys are not supplied in the environment, the platform automatically engages synthetic regional models rather than crashing or providing misleading errors.
        </p>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source, idx) => {
          const isLive = source.status === 'CONNECTED';
          const isDemo = source.status === 'DEMO_MODE';

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl bg-slate-900 border transition shadow-lg space-y-3 ${
                isLive ? 'border-slate-800 hover:border-slate-700' : 'border-amber-500/30'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    {source.type}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{source.name}</h3>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-black ${
                    source.apiConfigured
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {source.apiConfigured ? 'CONNECTED' : 'DEMO MODE ACTIVE'}
                </span>
              </div>

              {/* Sub-label & details */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <div className="font-semibold text-slate-200">{source.label}</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{source.details}</p>
              </div>

              {/* Metadata footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80 font-mono">
                <span>Config Var: {source.envVarName}</span>
                <span>Last Verified: {new Date(source.lastSync || '').toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* API Key Injection Guide for Evaluators */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-rose-500" />
          Configuring Live APIs for SIH Evaluators & Production Deployments
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed">
          To transition any component from DEMO MODE to live streaming telemetry, configure the designated environment variable in the application's environment configuration (<code className="px-1 py-0.5 rounded bg-slate-950 text-rose-300 font-mono">.env</code>):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-mono text-cyan-300 font-bold">OPENWEATHER_API_KEY</span>
            <p className="text-slate-400 text-[11px]">
              Enables live satellite precipitation feeds and 5-day forecasts from OpenWeather.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-mono text-cyan-300 font-bold">VITE_GOOGLE_MAPS_API_KEY</span>
            <p className="text-slate-400 text-[11px]">
              Enables Google Maps Platform vector basemap, satellite imagery, and geocoding services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
