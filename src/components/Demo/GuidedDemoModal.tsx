import React, { useState } from 'react';
import {
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  MapPin,
  Flame,
  Layers,
  Sliders,
  Cpu,
  Bell,
  FileText,
  Shield,
  Smartphone,
  Info,
} from 'lucide-react';
import { NavTab } from '../Navbar';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

interface DemoStep {
  stepNumber: number;
  title: string;
  tab: NavTab;
  explanation: string;
  highlightAction: string;
  badge: string;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  if (!isOpen) return null;

  const steps: DemoStep[] = [
    {
      stepNumber: 1,
      title: 'Northeast India Regional Overview',
      tab: 'command_center',
      badge: 'Command Center',
      explanation:
        'Welcome to LANDGUARD (SIH26001). The Command Center provides high-density executive situational awareness over 8 North Eastern Region (NER) states, tracking real-time meteorological rainfall, slope moisture, and critical zones.',
      highlightAction: 'Reviewing top KPIs: Critical zones, Active alerts, and monitored villages.',
    },
    {
      stepNumber: 2,
      title: 'Identification of High-Risk Zone',
      tab: 'risk_map',
      badge: 'GIS Risk Map',
      explanation:
        'The GIS Map visualizes spatial micro-sector grid cells color-coded by hazard probability. Notice the red pulsing markers indicating critical sectors such as Dikchu-Singtam Corridor in Sikkim and Tupul Railway Sector in Manipur.',
      highlightAction: 'Inspecting spatial sector coordinates and elevation topography.',
    },
    {
      stepNumber: 3,
      title: 'Geotechnical & Weather Factor Decomposition',
      tab: 'command_center',
      badge: 'Explainable AI',
      explanation:
        'LANDGUARD uses Explainable AI (XGBoost Feature Contributors). Instead of a black-box number, authorities see exact percentage drivers: 24h Rainfall (48.5%), Slope Gradient (24.2%), and Soil Saturation Rate (18.1%).',
      highlightAction: 'Observing the feature contributor waterfall on the inspection card.',
    },
    {
      stepNumber: 4,
      title: 'Impact Analysis: Affected Habitations & Lifelines',
      tab: 'impact_analysis',
      badge: 'Spatial Impact',
      explanation:
        'Selecting a sector calculates Great-Circle buffer perimeters (500m to 5km). LANDGUARD immediately intersects census settlements, estimated populations, hospitals, and national highways (e.g. NH-10).',
      highlightAction: 'Switching between 1 km, 2 km, and 5 km radius buffers to see dynamic population exposure.',
    },
    {
      stepNumber: 5,
      title: 'Priority Score Calculation & Transparency',
      tab: 'priority_engine',
      badge: 'Decision Support',
      explanation:
        'Hazard probability alone is not enough for emergency triage. The Priority Engine computes: Priority Score = (HazardProb * 0.55) + (ExposureIndex * 0.45). This ranks sectors from P1 (Urgent) down to P4 (Routine).',
      highlightAction: 'Viewing the transparent mathematical formula and ranked priority registry.',
    },
    {
      stepNumber: 6,
      title: 'Simulation: Cloudburst Rainfall Increase Scenario',
      tab: 'simulation',
      badge: 'What-If Engine',
      explanation:
        'Disaster authorities can stress-test geotechnical thresholds before the monsoon peaks. Drag the 24h rainfall slider up to 180 mm or soil moisture up to 95%.',
      highlightAction: 'Adjusting sliders to trigger synthetic slope supersaturation.',
    },
    {
      stepNumber: 7,
      title: 'Before vs After Real-Time Comparison',
      tab: 'simulation',
      badge: 'Sensitivity Output',
      explanation:
        'The ML engine recalculates failure probabilities and priority deltas instantly. Notice how probability leaps from 65% up to 94%, transitioning the sector into P1 CRITICAL status.',
      highlightAction: 'Comparing the Baseline vs Simulated bar charts.',
    },
    {
      stepNumber: 8,
      title: 'Citizen & Operator Ground Hazard Report',
      tab: 'field_reports',
      badge: 'Ground Intelligence',
      explanation:
        'Local scouts and citizens submit GPS-tagged reports with photo evidence of ground tension cracks, road blockages, or muddy water seepages. The offline-ready queue ensures reports are stored even in deep valleys without cell coverage.',
      highlightAction: 'Inspecting field observations and AI hazard classification outputs.',
    },
    {
      stepNumber: 9,
      title: 'Updated Regional Risk Picture',
      tab: 'risk_map',
      badge: 'Closed-Loop Feedback',
      explanation:
        'Once a report is verified by an operator, the sector hazard weight is updated on the map, illustrating true human-in-the-loop disaster management.',
      highlightAction: 'Viewing verified report markers alongside automated sensor zones.',
    },
    {
      stepNumber: 10,
      title: 'Prototype Alert Generation',
      tab: 'alerts',
      badge: 'Early Warning',
      explanation:
        'Emergency early warning advisories are synthesized with explicit primary triggers and non-authoritative recommended responses, preserving official authority oversight.',
      highlightAction: 'Reviewing active warnings and the prototype alert generation workflow.',
    },
    {
      stepNumber: 11,
      title: 'Historical Landslide Data Verification',
      tab: 'analytics',
      badge: 'Historical Validation',
      explanation:
        'The system benchmarks current hazard conditions against verified historical mass movement disasters in Northeast India (e.g. Noney Manipur 2022, Gangtok 2020) to validate trigger rainfall thresholds.',
      highlightAction: 'Examining past event casualties and precipitation triggers.',
    },
    {
      stepNumber: 12,
      title: 'Role-Based Access & Governance (RBAC)',
      tab: 'command_center',
      badge: 'Security & Governance',
      explanation:
        'LANDGUARD implements distinct operational roles: DISASTER_AUTHORITY (issue alerts, coordinate shelters), FIELD_OPERATOR (verify ground cracks), CITIZEN (submit observations), and ADMIN.',
      highlightAction: 'Demonstrating quick role switching via the top navigation bar.',
    },
    {
      stepNumber: 13,
      title: 'Mobile-Responsive Responsive Layout',
      tab: 'command_center',
      badge: 'Field Ergonomics',
      explanation:
        'Field operators in mountain patrols can access the entire application from rugged smartphones or field tablets with touch-optimized controls (≥44px touch targets).',
      highlightAction: 'Adaptive viewport and collapsible drawers for field mobility.',
    },
    {
      stepNumber: 14,
      title: 'System Limitations & Production Roadmap',
      tab: 'data_sources',
      badge: 'Engineering Integrity',
      explanation:
        'LANDGUARD displays total transparency regarding connected APIs vs DEMO modes, recognizing that high-mountain geology requires real InSAR satellite radar and piezometer telemetry for production deployment.',
      highlightAction: 'Reviewing data ingestion status and SIH production roadmap.',
    },
  ];

  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      onNavigateTab(steps[nextIdx].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      onNavigateTab(steps[prevIdx].tab);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-[calc(100%-32px)] sm:w-full">
      <div className="rounded-2xl bg-slate-900/95 border-2 border-rose-500/60 backdrop-blur-xl shadow-2xl p-4 text-slate-100 space-y-3 animate-in fade-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-black text-xs uppercase tracking-wider text-rose-400">
              Guided Judge Tour ({currentStep.stepNumber} of {steps.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-white">{currentStep.title}</h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-rose-300">
              {currentStep.badge}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{currentStep.explanation}</p>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            <strong className="text-rose-400">Active View: </strong>
            {currentStep.highlightAction}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold disabled:opacity-40 flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStepIndex ? 'w-4 bg-rose-500' : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-rose-950/50 transition"
          >
            <span>{currentStepIndex === steps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
