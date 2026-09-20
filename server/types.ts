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
  passwordHash: string;
  name: string;
  role: Role;
  organization?: string;
  phone?: string;
  createdAt: string;
}

export interface FeatureContributor {
  feature: string;
  contribution: number; // percentage
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
  elevation: number; // meters
  slope: number; // degrees
  soilMoisture: number; // percentage
  rainfall24h: number; // mm
  rainfall7d: number; // mm
  currentRainfall: number; // mm/hr
  historicalEventsCount: number;
  distanceToFaultKm: number;
  probability: number; // 0.0 to 1.0
  riskCategory: RiskLevel;
  priorityScore: number; // 0 to 100
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
  populationEstimate: number; // labelled demo/census estimate
  households: number;
  elevation: number;
  shelterAvailable: boolean;
}

export interface Road {
  id: string;
  name: string; // e.g. NH-10, State Highway 4
  type: 'National Highway' | 'State Highway' | 'Major District Road' | 'Rural Link Road';
  state: string;
  coordinates: [number, number][]; // lat, lng points along road
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
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
  sourceAttribution: string; // e.g. "Geological Survey of India (GSI) Historical Bulletin / Prototype Archive"
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
  isOfficialWarning: false; // strictly flagged as prototype alert
}

export interface WeatherData {
  locationName: string;
  latitude: number;
  longitude: number;
  temperature: number; // Celsius
  humidity: number; // %
  rainfallMm: number; // current mm/hr
  rainfall24h: number;
  condition: string;
  windSpeedKmH: number;
  isDemo: boolean;
  dataSourceLabel: string;
  timestamp: string;
}

export interface DataSourceStatus {
  name: string;
  category: 'Weather' | 'Mapping' | 'ML Engine' | 'Database' | 'Satellite' | 'Field Sensors';
  status: 'CONNECTED' | 'DEMO_MODE' | 'STANDBY' | 'DEGRADED';
  provider: string;
  lastUpdated: string;
  apiConfigured: boolean;
  details: string;
}
