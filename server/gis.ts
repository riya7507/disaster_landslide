import { Infrastructure, PriorityLevel, RiskLevel, Road, Village } from './types';

/**
 * Calculates Great-Circle distance in kilometers between two lat/lng pairs using Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks minimum distance from a point to a segmented polyline (e.g., road network).
 */
export function calculateDistanceToPolylineKm(
  lat: number,
  lng: number,
  coordinates: [number, number][]
): number {
  if (!coordinates || coordinates.length === 0) return 9999;
  let minDistance = Infinity;
  for (const point of coordinates) {
    const dist = calculateHaversineDistanceKm(lat, lng, point[0], point[1]);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
}

export interface ImpactAnalysisResult {
  zoneId: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  radiusMeters: number;
  riskProbability: number;
  riskCategory: RiskLevel;
  affectedVillages: (Village & { distanceKm: number })[];
  totalEstimatedPopulation: number;
  totalEstimatedHouseholds: number;
  affectedRoads: (Road & { minDistanceKm: number })[];
  affectedInfrastructure: (Infrastructure & { distanceKm: number })[];
  priorityScore: number;
  priorityLevel: PriorityLevel;
  priorityBreakdown: {
    hazardRiskComponent: number; // 0-100
    populationExposureComponent: number; // 0-100
    criticalInfrastructureComponent: number; // 0-100
    roadConnectivityComponent: number; // 0-100
    formula: string;
  };
  recommendedMonitoring: string[];
  disclaimer: string;
}

/**
 * Computes spatial impact and priority evaluation for any given coordinate and radius.
 */
export function evaluateImpactAndPriority(
  zoneId: string,
  lat: number,
  lng: number,
  radiusKm: number,
  probability: number,
  villages: Village[],
  roads: Road[],
  infrastructure: Infrastructure[]
): ImpactAnalysisResult {
  // Find affected villages within radius
  const affectedVillages = villages
    .map((v) => ({
      ...v,
      distanceKm: Math.round(calculateHaversineDistanceKm(lat, lng, v.latitude, v.longitude) * 100) / 100,
    }))
    .filter((v) => v.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const totalEstimatedPopulation = affectedVillages.reduce((sum, v) => sum + v.populationEstimate, 0);
  const totalEstimatedHouseholds = affectedVillages.reduce((sum, v) => sum + v.households, 0);

  // Find affected roads within radius (or slightly wider buffer for lifeline impact)
  const affectedRoads = roads
    .map((r) => ({
      ...r,
      minDistanceKm:
        Math.round(calculateDistanceToPolylineKm(lat, lng, r.coordinates) * 100) / 100,
    }))
    .filter((r) => r.minDistanceKm <= radiusKm + 0.5)
    .sort((a, b) => a.minDistanceKm - b.minDistanceKm);

  // Find affected infrastructure within radius
  const affectedInfrastructure = infrastructure
    .map((item) => ({
      ...item,
      distanceKm:
        Math.round(calculateHaversineDistanceKm(lat, lng, item.latitude, item.longitude) * 100) / 100,
    }))
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Priority Calculation Model
  // Priority is NOT equal to probability!
  // It separates Hazard from Vulnerability & Exposure:
  // Priority = Hazard Risk * (0.35 * Exposure + 0.40 * Infrastructure Criticality + 0.25 * Road Lifeline)
  const hazardRiskComponent = Math.round(probability * 100);

  // Exposure scale based on estimated affected people (0 to 100)
  const populationExposureComponent = Math.min(
    100,
    Math.round((totalEstimatedPopulation / 3000) * 100)
  );

  // Critical infrastructure scale: Hospitals & relief centers weight heavily
  let infraPoints = 0;
  for (const item of affectedInfrastructure) {
    if (item.type === 'Hospital') infraPoints += 45;
    else if (item.type === 'Primary Health Center') infraPoints += 30;
    else if (item.type === 'Relief Center') infraPoints += 30;
    else if (item.type === 'Bridge') infraPoints += 35;
    else if (item.type === 'School') infraPoints += 20;
    else infraPoints += 15;
  }
  const criticalInfrastructureComponent = Math.min(100, infraPoints);

  // Road lifeline scale: National Highways are critical arterial lifelines for NER
  let roadPoints = 0;
  for (const r of affectedRoads) {
    if (r.type === 'National Highway') roadPoints += 50;
    else if (r.type === 'State Highway') roadPoints += 30;
    else roadPoints += 15;
  }
  const roadConnectivityComponent = Math.min(100, roadPoints);

  // Composite Priority Score calculation (0 to 100)
  const exposureFactor =
    0.35 * (populationExposureComponent / 100) +
    0.40 * (criticalInfrastructureComponent / 100) +
    0.25 * (roadConnectivityComponent / 100);

  // Base raw score
  // If probability is very high, priority is scaled; even moderate risk with dense hospital/highway gets P2
  const rawPriorityScore = (probability * 0.55 + exposureFactor * 0.45) * 100;
  const priorityScore = Math.min(100, Math.max(5, Math.round(rawPriorityScore)));

  // Categorize Priority Levels:
  // P1: Immediate Priority (Score >= 75)
  // P2: High Monitoring & Preparedness (Score >= 55)
  // P3: Moderate Observation (Score >= 35)
  // P4: Routine Survey (Score < 35)
  let priorityLevel: PriorityLevel = 'P4';
  if (priorityScore >= 75) {
    priorityLevel = 'P1';
  } else if (priorityScore >= 55) {
    priorityLevel = 'P2';
  } else if (priorityScore >= 35) {
    priorityLevel = 'P3';
  }

  let riskCategory: RiskLevel = 'LOW';
  if (probability >= 0.80) riskCategory = 'CRITICAL';
  else if (probability >= 0.60) riskCategory = 'HIGH';
  else if (probability >= 0.30) riskCategory = 'MODERATE';

  const recommendedMonitoring: string[] = [];
  if (priorityLevel === 'P1') {
    recommendedMonitoring.push(
      'Deploy field operator for ground crack and pore-pressure verification',
      'Notify State Disaster Management Authority (SDMA) & district administration',
      'Pre-position earthmoving and clearance equipment along arterial highway corridor',
      'Place designated community shelter facilities on heightened standby'
    );
  } else if (priorityLevel === 'P2') {
    recommendedMonitoring.push(
      'Increase weather radar and rain-gauge polling to 15-minute intervals',
      'Issue advisory to local road transport division regarding vulnerable cuts',
      'Verify culvert and mountain drainage clearance for runoff capacity'
    );
  } else {
    recommendedMonitoring.push(
      'Maintain standard automated sensor telemetry observation',
      'Periodic photographic survey during weekly field patrols'
    );
  }

  return {
    zoneId,
    centerLatitude: lat,
    centerLongitude: lng,
    radiusKm,
    radiusMeters: radiusKm * 1000,
    riskProbability: probability,
    riskCategory,
    affectedVillages,
    totalEstimatedPopulation,
    totalEstimatedHouseholds,
    affectedRoads,
    affectedInfrastructure,
    priorityScore,
    priorityLevel,
    priorityBreakdown: {
      hazardRiskComponent,
      populationExposureComponent,
      criticalInfrastructureComponent,
      roadConnectivityComponent,
      formula:
        'Score = (Probability * 0.55) + ((0.35*PopExposure + 0.40*InfraCriticality + 0.25*RoadLifeline) * 0.45)',
    },
    recommendedMonitoring,
    disclaimer:
      'LANDGUARD Prototype Priority Score is an analytical decision-support metric and NOT an official government emergency allocation order.',
  };
}
