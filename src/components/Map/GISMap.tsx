import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  FieldReport,
  Infrastructure,
  LandslideEvent,
  RiskZone,
  Road,
  Village,
} from '../../types';
import {
  Layers,
  MapPin,
  Eye,
  Activity,
  AlertTriangle,
  Compass,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface GISMapProps {
  riskZones: RiskZone[];
  villages?: Village[];
  roads?: Road[];
  infrastructure?: Infrastructure[];
  historicalLandslides?: LandslideEvent[];
  fieldReports?: FieldReport[];
  selectedZoneId?: string | null;
  onSelectZone?: (zone: RiskZone) => void;
  selectedRadiusKm?: number;
  highlightCoordinates?: [number, number] | null;
  className?: string;
  showLayerControls?: boolean;
}

export const GISMap: React.FC<GISMapProps> = ({
  riskZones,
  villages = [],
  roads = [],
  infrastructure = [],
  historicalLandslides = [],
  fieldReports = [],
  selectedZoneId,
  onSelectZone,
  selectedRadiusKm = 2.0,
  highlightCoordinates,
  className = 'h-[540px] w-full',
  showLayerControls = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer toggles
  const [layers, setLayers] = useState({
    riskZones: true,
    villages: true,
    roads: true,
    infrastructure: true,
    historical: true,
    reports: true,
  });

  const [tileMode, setTileMode] = useState<'streets' | 'satellite' | 'terrain'>('terrain');
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isGoogleMapsActive = Boolean(googleApiKey && googleApiKey.trim() !== '');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Northeast India (Assam, Meghalaya, Sikkim, Manipur hub)
    const map = L.map(mapContainerRef.current, {
      center: [26.1, 92.4],
      zoom: 7,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenTopoMap, &copy; OpenStreetMap contributors';

    if (tileMode === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (tileMode === 'streets') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CARTO &copy; OpenStreetMap';
    }

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 18,
    }).addTo(map);
  }, [tileMode]);

  // Render Spatial Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const selectedZone = riskZones.find((z) => z.id === selectedZoneId);

    // 1. Draw Impact Radius Circle around Selected Zone
    if (selectedZone) {
      const radiusMeters = (selectedRadiusKm || 2.0) * 1000;
      const radiusCircle = L.circle([selectedZone.latitude, selectedZone.longitude], {
        radius: radiusMeters,
        color: '#f43f5e',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#f43f5e',
        fillOpacity: 0.12,
      }).addTo(layerGroup);

      radiusCircle.bindTooltip(
        `<strong>Impact Evaluation Perimeter</strong><br/>Radius: ${selectedRadiusKm} km (${radiusMeters.toLocaleString()} m)`,
        { sticky: true }
      );
    }

    // 2. Road Polylines
    if (layers.roads) {
      roads.forEach((road) => {
        const isHighway = road.type === 'National Highway';
        const polyline = L.polyline(road.coordinates, {
          color: isHighway ? '#38bdf8' : '#64748b',
          weight: isHighway ? 4 : 2.5,
          opacity: 0.85,
        }).addTo(layerGroup);

        polyline.bindTooltip(
          `<div class="text-xs"><strong>${road.name}</strong><br/>Type: ${road.type} | Criticality: ${road.criticality}</div>`
        );
      });
    }

    // 3. Risk Zones (Spatial Grid Cells)
    if (layers.riskZones) {
      riskZones.forEach((zone) => {
        const isSelected = zone.id === selectedZoneId;
        const color =
          zone.riskCategory === 'CRITICAL'
            ? '#ef4444'
            : zone.riskCategory === 'HIGH'
            ? '#f97316'
            : zone.riskCategory === 'MODERATE'
            ? '#eab308'
            : '#22c55e';

        // Outer pulse circle for Critical / High
        if (zone.riskCategory === 'CRITICAL') {
          L.circle([zone.latitude, zone.longitude], {
            radius: 3500,
            color: '#ef4444',
            weight: 1,
            fillColor: '#ef4444',
            fillOpacity: 0.15,
          }).addTo(layerGroup);
        }

        const marker = L.circleMarker([zone.latitude, zone.longitude], {
          radius: isSelected ? 12 : 9,
          color: isSelected ? '#ffffff' : color,
          weight: isSelected ? 3 : 2,
          fillColor: color,
          fillOpacity: 0.88,
        }).addTo(layerGroup);

        const popupContent = `
          <div class="p-1 text-slate-900 font-sans leading-tight">
            <div class="flex items-center gap-1.5 font-bold text-sm text-slate-900 mb-1">
              <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
              ${zone.name}
            </div>
            <div class="text-xs text-slate-600 mb-1.5">${zone.district}, ${zone.state}</div>
            <div class="grid grid-cols-2 gap-2 text-xs py-1 border-t border-slate-200">
              <div>Risk Probability: <strong>${Math.round(zone.probability * 100)}%</strong></div>
              <div>Category: <strong style="color: ${color}">${zone.riskCategory}</strong></div>
              <div>Priority: <strong>${zone.priorityLevel} (${zone.priorityScore}/100)</strong></div>
              <div>24h Rain: <strong>${zone.rainfall24h} mm</strong></div>
              <div>Slope: <strong>${zone.slope}°</strong></div>
              <div>Soil Moisture: <strong>${zone.soilMoisture}%</strong></div>
            </div>
            <div class="mt-2 text-[11px] text-slate-500 italic">Click to focus & inspect nearby impacted infrastructure</div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectZone) onSelectZone(zone);
        });
      });
    }

    // 4. Villages Layer
    if (layers.villages) {
      villages.forEach((v) => {
        const vMarker = L.circleMarker([v.latitude, v.longitude], {
          radius: 4.5,
          color: '#38bdf8',
          weight: 1.5,
          fillColor: '#0284c7',
          fillOpacity: 0.8,
        }).addTo(layerGroup);

        vMarker.bindTooltip(
          `<div class="text-xs"><strong>${v.name}</strong><br/>Est. Population: ${v.populationEstimate.toLocaleString()} (${v.households} households)<br/>Shelter: ${v.shelterAvailable ? 'Available ✓' : 'None'}</div>`
        );
      });
    }

    // 5. Critical Infrastructure Layer
    if (layers.infrastructure) {
      infrastructure.forEach((infra) => {
        const isHospital = infra.type === 'Hospital' || infra.type === 'Primary Health Center';
        const isBridge = infra.type === 'Bridge';

        const color = isHospital ? '#a855f7' : isBridge ? '#f59e0b' : '#3b82f6';

        const infraMarker = L.circleMarker([infra.latitude, infra.longitude], {
          radius: 5,
          color: '#ffffff',
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.9,
        }).addTo(layerGroup);

        infraMarker.bindTooltip(
          `<div class="text-xs"><strong>${infra.name}</strong><br/>Type: ${infra.type} | Status: ${infra.operationalStatus}</div>`
        );
      });
    }

    // 6. Historical Landslide Events Layer
    if (layers.historical) {
      historicalLandslides.forEach((ev) => {
        const histMarker = L.circleMarker([ev.latitude, ev.longitude], {
          radius: 6,
          color: '#1e293b',
          weight: 1.5,
          fillColor: '#64748b',
          fillOpacity: 0.75,
        }).addTo(layerGroup);

        histMarker.bindTooltip(
          `<div class="text-xs"><strong>Historical Event: ${ev.locationName}</strong><br/>Date: ${ev.date} | Trigger: ${ev.triggerRainfallMm} mm<br/>Severity: ${ev.severity} | Casualties: ${ev.casualties}</div>`
        );
      });
    }

    // 7. Field Reports Layer
    if (layers.reports) {
      fieldReports.forEach((rep) => {
        const color =
          rep.status === 'VERIFIED'
            ? '#ef4444'
            : rep.status === 'RESOLVED'
            ? '#22c55e'
            : '#eab308';

        const repMarker = L.circleMarker([rep.latitude, rep.longitude], {
          radius: 7,
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: 0.95,
        }).addTo(layerGroup);

        repMarker.bindTooltip(
          `<div class="text-xs"><strong>Citizen/Field Report: ${rep.hazardType}</strong><br/>Status: <strong>${rep.status}</strong><br/>Severity: ${rep.severity}<br/>${rep.description.substring(0, 75)}...</div>`
        );
      });
    }

    // If highlightCoordinates or selectedZone changed, pan map smoothly
    if (highlightCoordinates && map) {
      map.flyTo(highlightCoordinates, 10, { duration: 1.2 });
    } else if (selectedZone && map) {
      map.flyTo([selectedZone.latitude, selectedZone.longitude], 10, { duration: 1.2 });
    }
  }, [
    riskZones,
    villages,
    roads,
    infrastructure,
    historicalLandslides,
    fieldReports,
    selectedZoneId,
    selectedRadiusKm,
    highlightCoordinates,
    layers,
  ]);

  const handleRecenterNER = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([26.1, 92.4], 7, { duration: 1 });
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl ${className}`}>
      {/* Map Header Overlay Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        {/* Mode Badge */}
        <div className="flex items-center gap-2 rounded-lg bg-slate-950/85 backdrop-blur-md px-3 py-1.5 border border-slate-800 shadow-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-200">
            {isGoogleMapsActive ? 'Google Maps JavaScript API' : 'DEMO MAP MODE'}
          </span>
          <span className="text-[11px] text-slate-400 border-l border-slate-700 pl-2">
            {isGoogleMapsActive ? 'Satellite / Contours' : 'Leaflet + OpenTopoMap (NER Terrain)'}
          </span>
        </div>

        {/* Tile Switcher */}
        <div className="flex items-center rounded-lg bg-slate-950/85 backdrop-blur-md p-0.5 border border-slate-800 text-xs">
          <button
            onClick={() => setTileMode('terrain')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              tileMode === 'terrain'
                ? 'bg-rose-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => setTileMode('satellite')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              tileMode === 'satellite'
                ? 'bg-rose-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setTileMode('streets')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              tileMode === 'streets'
                ? 'bg-rose-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Streets
          </button>
        </div>
      </div>

      {/* Top-Right Quick Actions */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5">
        <button
          onClick={handleRecenterNER}
          className="flex items-center gap-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 text-xs text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white transition shadow-md"
          title="Reset to Northeast India view"
        >
          <Compass className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Center NER</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Bottom Layer Controls & Legend */}
      {showLayerControls && (
        <div className="absolute bottom-3 left-3 z-[1000] max-w-[calc(100%-24px)] flex flex-wrap items-center gap-2">
          {/* Layer toggles pill */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-950/90 backdrop-blur-md px-3 py-1.5 border border-slate-800 shadow-lg text-xs">
            <span className="text-slate-400 flex items-center gap-1 mr-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-slate-300" /> Layers:
            </span>
            <button
              onClick={() => setLayers((l) => ({ ...l, riskZones: !l.riskZones }))}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                layers.riskZones ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              Risk Zones
            </button>
            <button
              onClick={() => setLayers((l) => ({ ...l, villages: !l.villages }))}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                layers.villages ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              Villages
            </button>
            <button
              onClick={() => setLayers((l) => ({ ...l, roads: !l.roads }))}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                layers.roads ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              Highways
            </button>
            <button
              onClick={() => setLayers((l) => ({ ...l, infrastructure: !l.infrastructure }))}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                layers.infrastructure ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              Hospitals & Bridges
            </button>
            <button
              onClick={() => setLayers((l) => ({ ...l, reports: !l.reports }))}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                layers.reports ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              Citizen Reports
            </button>
          </div>

          {/* Quick Legend */}
          <div className="hidden md:flex items-center gap-3 rounded-lg bg-slate-950/90 backdrop-blur-md px-3 py-1.5 border border-slate-800 text-[11px] text-slate-300 shadow-lg">
            <span className="text-slate-400">Risk:</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical (≥80%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> High (60-80%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
