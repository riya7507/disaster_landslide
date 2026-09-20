import {
  Alert,
  DataSourceStatus,
  FieldReport,
  ImpactAnalysisResult,
  LandslideEvent,
  RiskZone,
  SimulationResult,
  User,
  WeatherData,
} from '../types';

const BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('landguard_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Risk Zones
  async getRiskZones(params?: { state?: string; category?: string; minPriority?: string }): Promise<{ total: number; zones: RiskZone[] }> {
    const query = new URLSearchParams();
    if (params?.state) query.append('state', params.state);
    if (params?.category) query.append('category', params.category);
    if (params?.minPriority) query.append('minPriority', params.minPriority);

    const res = await fetch(`${BASE_URL}/risk/zones?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch risk zones');
    return res.json();
  },

  async getRiskZoneDetails(id: string, radiusKm = 2.0): Promise<{ zone: RiskZone; impact: ImpactAnalysisResult }> {
    const res = await fetch(`${BASE_URL}/risk/zones/${id}?radius=${radiusKm}`);
    if (!res.ok) throw new Error(`Failed to fetch zone details for ${id}`);
    return res.json();
  },

  async predictCustomRisk(features: {
    rainfall24h: number;
    rainfall7d: number;
    currentRainfall?: number;
    soilMoisture: number;
    slope: number;
    elevation?: number;
    historicalEventsCount?: number;
  }) {
    const res = await fetch(`${BASE_URL}/risk/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
    });
    if (!res.ok) throw new Error('Failed to run ML prediction');
    return res.json();
  },

  // Weather
  async getCurrentWeather(lat = 27.3389, lng = 88.6065, location = 'Gangtok, Sikkim'): Promise<WeatherData> {
    const res = await fetch(`${BASE_URL}/weather/current?lat=${lat}&lng=${lng}&location=${encodeURIComponent(location)}`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    return res.json();
  },

  async getWeatherForecast() {
    const res = await fetch(`${BASE_URL}/weather/forecast`);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
  },

  // Historical
  async getHistoricalLandslides(): Promise<{ total: number; events: LandslideEvent[] }> {
    const res = await fetch(`${BASE_URL}/landslides/history`);
    if (!res.ok) throw new Error('Failed to fetch historical events');
    return res.json();
  },

  // Field Reports
  async getFieldReports(params?: { status?: string; hazardType?: string }): Promise<{ total: number; reports: FieldReport[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.hazardType) query.append('hazardType', params.hazardType);

    const res = await fetch(`${BASE_URL}/reports?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch field reports');
    return res.json();
  },

  async submitFieldReport(reportData: Partial<FieldReport>): Promise<{ message: string; report: FieldReport }> {
    // Offline queue check
    if (!navigator.onLine) {
      const offlineQueue = JSON.parse(localStorage.getItem('landguard_offline_reports') || '[]');
      const queuedReport = {
        ...reportData,
        id: `offline_${Date.now()}`,
        status: 'NEW',
        createdAt: new Date().toISOString(),
      };
      offlineQueue.push(queuedReport);
      localStorage.setItem('landguard_offline_reports', JSON.stringify(offlineQueue));
      return {
        message: 'Saved locally. Will sync automatically when network connectivity is restored.',
        report: queuedReport as FieldReport,
      };
    }

    const res = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(reportData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit report');
    }
    return res.json();
  },

  async updateReportStatus(id: string, status: string, notes?: string): Promise<{ report: FieldReport }> {
    const res = await fetch(`${BASE_URL}/reports/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status, reviewNotes: notes }),
    });
    if (!res.ok) throw new Error('Failed to update report status');
    return res.json();
  },

  // Alerts
  async getAlerts(params?: { status?: string; category?: string }): Promise<{ total: number; alerts: Alert[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);

    const res = await fetch(`${BASE_URL}/alerts?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async createAlert(alertData: Partial<Alert>): Promise<{ alert: Alert }> {
    const res = await fetch(`${BASE_URL}/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(alertData),
    });
    if (!res.ok) throw new Error('Failed to create alert');
    return res.json();
  },

  // Simulation
  async runSimulation(payload: {
    zoneId: string;
    simulatedRainfall24h?: number;
    simulatedSoilMoisture?: number;
    simulatedSlope?: number;
    simulatedHistoricalEvents?: number;
  }): Promise<SimulationResult> {
    const res = await fetch(`${BASE_URL}/simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to execute simulation');
    return res.json();
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Data Sources Status
  async getDataSources(): Promise<{ sources: DataSourceStatus[] }> {
    const res = await fetch(`${BASE_URL}/data-sources`);
    if (!res.ok) throw new Error('Failed to fetch data sources status');
    return res.json();
  },

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('landguard_token', data.token);
    localStorage.setItem('landguard_user', JSON.stringify(data.user));
    return data;
  },

  async getCurrentUser(): Promise<{ user: User } | null> {
    const token = localStorage.getItem('landguard_token');
    if (!token) return null;
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      localStorage.removeItem('landguard_token');
      localStorage.removeItem('landguard_user');
      return null;
    }
    return res.json();
  },

  logout() {
    localStorage.removeItem('landguard_token');
    localStorage.removeItem('landguard_user');
  },
};
