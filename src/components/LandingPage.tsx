import React from 'react';
import {
  ShieldAlert,
  MapPin,
  Cpu,
  AlertTriangle,
  Layers,
  ArrowRight,
  PlayCircle,
  Activity,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface LandingPageProps {
  onOpenCommandCenter: () => void;
  onExploreRiskMap: () => void;
  onStartGuidedDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenCommandCenter,
  onExploreRiskMap,
  onStartGuidedDemo,
}) => {
  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 px-4 py-8 md:py-16">
      <div className="max-w-5xl mx-auto w-full">
        {/* Top Tag & SIH Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-center">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Smart India Hackathon 2026 — SIH26001
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
            North Eastern Region (NER) Focus
          </span>
        </div>

        {/* Hero Title & Tagline */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            LANDGUARD
          </h1>
          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
            Predict. Protect. Respond.
          </p>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            AI-powered landslide early warning, high-resolution spatial hazard prediction, and critical infrastructure impact monitoring engineered for the complex mountainous terrain of North East India.
          </p>
        </div>

        {/* Decision Support & Integrity Notice */}
        <div className="max-w-3xl mx-auto mb-10 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 shadow-inner">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300">Prototype Decision-Support System Notice:</span>
            <p className="text-amber-200/90 leading-normal">
              LANDGUARD provides predictive hazard probabilities and prototype priority assessments for disaster authorities and field operators. All outputs represent statistical risk estimations rather than definitive disaster certainty. Emergency response and official alerts remain strictly under authorized State Disaster Management Authorities.
            </p>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={onOpenCommandCenter}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-xl shadow-rose-950/60 transition active:scale-95"
          >
            <span>Open Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreRiskMap}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition active:scale-95 shadow-md"
          >
            <span>Explore Risk Map</span>
            <MapPin className="w-4 h-4 text-sky-400" />
          </button>

          <button
            onClick={onStartGuidedDemo}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-semibold text-sm shadow-xl shadow-amber-950/50 transition active:scale-95"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Guided Judge Demo</span>
          </button>
        </div>

        {/* Core Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-white mb-1">AI Hazard Inference</h2>
            <p className="text-xs text-slate-400 leading-normal">
              Calibrated Gradient-Boosted ensemble evaluating precipitation accumulation, soil moisture, and steep slopes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-white mb-1">Spatial Risk Grid</h2>
            <p className="text-xs text-slate-400 leading-normal">
              Micro-sector hazard evaluation across all 8 NER states, separating physical hazard from exposure.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-white mb-1">Impact & Priority</h2>
            <p className="text-xs text-slate-400 leading-normal">
              Dynamic buffer radius calculations identifying impacted villages, arterial highways, hospitals, and bridges.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-white mb-1">Field Intelligence</h2>
            <p className="text-xs text-slate-400 leading-normal">
              Real-time citizen and operator incident reports with automated tension crack and seepage analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-500 border-t border-slate-800/80 pt-6">
        <p>
          LANDGUARD Disaster Decision Support System &bull; North Eastern Region of India (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura)
        </p>
      </footer>
    </div>
  );
};
