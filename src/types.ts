export type Role = 'ADMIN' | 'DISASTER_AUTHORITY' | 'FIELD_OPERATOR' | 'CITIZEN';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

export type ReportStatus = 'NEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'RESOLVED';

export type HazardType =
  | 'Ground Crack'
  | 'Slope Movement'
  | 'Rockfall'
  | 'Road Blockage'
  | 'Water Seepage'
  | 'Landslide'
  | 'Other';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organization?: string;
  phone?: string;
}

export interface FeatureContributor {
  feature: string;
  contribution: number;
  value?: number | string;
  description?: string;
}

export interface RiskZone {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  elevation: number;
  slope: number;
  soilMoisture: number;
  rainfall24h: number;
  rainfall7d: number;
  currentRainfall: number;
  historicalEventsCount: number;
  distanceToFaultKm: number;
  probability: number;
  riskCategory: RiskLevel;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  lastUpdated: string;
  contributors: FeatureContributor[];
}

export interface Village {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  populationEstimate: number;
  households: number;
  elevation: number;
  shelterAvailable: boolean;
  distanceKm?: number;
}

export interface Road {
  id: string;
  name: string;
  type: 'National Highway' | 'State Highway' | 'Major District Road' | 'Rural Link Road';
  state: string;
  coordinates: [number, number][];
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  minDistanceKm?: number;
}

export interface Infrastructure {
  id: string;
  name: string;
  type: 'Hospital' | 'Primary Health Center' | 'School' | 'Bridge' | 'Power Substation' | 'Relief Center';
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  capacity?: number;
  operationalStatus: 'OPERATIONAL' | 'VULNERABLE' | 'CLOSED';
  distanceKm?: number;
}

export interface LandslideEvent {
  id: string;
  date: string;
  locationName: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CATASTROPHIC';
  triggerRainfallMm: number;
  casualties: number;
  infrastructureDamaged: string;
  sourceAttribution: string;
}

export interface FieldReport {
  id: string;
  hazardType: HazardType;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: ReportStatus;
  latitude: number;
  longitude: number;
  locationName: string;
  photoUrl?: string;
  aiClassification?: {
    detectedHazard: string;
    confidencePercentage?: number;
    explanation: string;
    status: 'ANALYZED' | 'MANUAL_REVIEW_REQUIRED' | 'NO_MODEL';
  };
  reporterName: string;
  reporterRole: Role;
  reporterContact?: string;
  createdAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface Alert {
  id: string;
  title: string;
  zoneId: string;
  locationName: string;
  state: string;
  district: string;
  riskCategory: RiskLevel;
  probability: number;
  priorityLevel: PriorityLevel;
  affectedVillages: string[];
  affectedInfrastructure: string[];
  primaryReasons: string[];
  recommendedActions: string[];
  issuedAt: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  isOfficialWarning: false;
}

export interface WeatherData {
  locationName: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rainfallMm: number;
  rainfall24h: number;
  condition: string;
  windSpeedKmH: number;
  isDemo: boolean;
  dataSourceLabel: string;
  timestamp: string;
}

export interface DataSourceStatus {
  id?: string;
  name: string;
  type?: string;
  status: 'CONNECTED' | 'DEMO_MODE' | 'STANDBY' | 'DEGRADED';
  label?: string;
  lastSync?: string;
  apiConfigured: boolean;
  envVarName?: string;
  details: string;
}

export interface ImpactAnalysisResult {
  zoneId: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  radiusMeters: number;
  riskProbability: number;
  riskCategory: RiskLevel;
  affectedVillages: Village[];
  totalEstimatedPopulation: number;
  totalEstimatedHouseholds: number;
  affectedRoads: Road[];
  affectedInfrastructure: Infrastructure[];
  priorityScore: number;
  priorityLevel: PriorityLevel;
  priorityBreakdown: {
    hazardRiskComponent: number;
    populationExposureComponent: number;
    criticalInfrastructureComponent: number;
    roadConnectivityComponent: number;
    formula: string;
  };
  recommendedMonitoring: string[];
  disclaimer: string;
}

export interface SimulationResult {
  zone: {
    id: string;
    name: string;
    state: string;
    district: string;
  };
  baselineScenario: {
    rainfall24h: number;
    soilMoisture: number;
    slope: number;
    probability: number;
    riskPercentage: number;
    riskCategory: RiskLevel;
    priorityScore: number;
    priorityLevel: PriorityLevel;
    contributors: FeatureContributor[];
    affectedVillagesCount: number;
    affectedPopulationEstimate: number;
  };
  simulatedScenario: {
    rainfall24h: number;
    soilMoisture: number;
    slope: number;
    probability: number;
    riskPercentage: number;
    riskCategory: RiskLevel;
    priorityScore: number;
    priorityLevel: PriorityLevel;
    contributors: FeatureContributor[];
    affectedVillagesCount: number;
    affectedPopulationEstimate: number;
  };
  delta: {
    probabilityDelta: number;
    priorityScoreDelta: number;
    categoryChanged: boolean;
  };
  disclaimer: string;
}
