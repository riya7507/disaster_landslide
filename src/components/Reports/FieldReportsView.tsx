import React, { useState } from 'react';
import { FieldReport, HazardType, ReportStatus, Role, User } from '../../types';
import { api } from '../../services/api';
import {
  FileText,
  Camera,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  Upload,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Check,
  Filter,
} from 'lucide-react';

interface FieldReportsViewProps {
  reports: FieldReport[];
  currentUser: User | null;
  onRefreshReports: () => void;
  onOpenAuthModal: () => void;
}

export const FieldReportsView: React.FC<FieldReportsViewProps> = ({
  reports,
  currentUser,
  onRefreshReports,
  onOpenAuthModal,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Form state
  const [hazardType, setHazardType] = useState<HazardType>('Ground Crack');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [latitude, setLatitude] = useState<string>('27.3389');
  const [longitude, setLongitude] = useState<string>('88.6065');
  const [locationName, setLocationName] = useState<string>('Gangtok Bypass Hillside, Sikkim');
  const [reporterName, setReporterName] = useState<string>(currentUser?.name || 'Field Scout');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hazardOptions: HazardType[] = [
    'Ground Crack',
    'Slope Movement',
    'Rockfall',
    'Road Blockage',
    'Water Seepage',
    'Landslide',
    'Other',
  ];

  // Browser Geolocation
  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(4));
          setLongitude(pos.coords.longitude.toFixed(4));
          setLocationName('GPS Geolocation Pin (NER Field)');
        },
        () => {
          // Fallback to demo coordinate in Northeast India
          setLatitude('27.3450');
          setLongitude('88.6120');
          setLocationName('Sikkim Ridge Patrol Sector');
        }
      );
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await api.submitFieldReport({
        hazardType,
        description: description.trim(),
        severity,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationName,
        reporterName,
        reporterRole: currentUser?.role || 'CITIZEN',
        photoUrl: photoPreview || undefined,
      });

      setSuccessMessage('Field report logged and analyzed! Real-time spatial risk grid updated.');
      setDescription('');
      setPhotoPreview(null);
      onRefreshReports();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus) => {
    try {
      await api.updateReportStatus(reportId, newStatus, `Verified by ${currentUser?.name || 'Duty Officer'}`);
      onRefreshReports();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (selectedStatusFilter === 'ALL') return true;
    return r.status === selectedStatusFilter;
  });

  const canVerify = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'DISASTER_AUTHORITY' || currentUser.role === 'FIELD_OPERATOR');

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Crowdsourced & Patrol Intelligence
          </span>
          <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Field Incident & Hazard Reporting Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log ground anomalies, tension cracks, rockfalls, and water seepages to feed real-time ML risk refinement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!currentUser && (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              Sign In as Authority / Operator
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column: Left Submission Form, Right Reports Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Reporting Form (1 Col) */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-400" />
              Submit Ground Hazard Observation
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              Offline Capable ✓
            </span>
          </div>

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* Hazard Type */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Observed Hazard Type:</label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value as HazardType)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-emerald-500"
              >
                {hazardOptions.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Severity Rating:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`py-1 rounded-md text-[11px] font-bold transition ${
                      severity === s
                        ? s === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : s === 'HIGH'
                          ? 'bg-orange-500 text-white'
                          : s === 'MEDIUM'
                          ? 'bg-yellow-500 text-black'
                          : 'bg-emerald-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Geolocation Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 font-medium">Location & Coordinates:</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 font-semibold"
                >
                  <MapPin className="w-3 h-3" /> Auto-Detect GPS
                </button>
              </div>

              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="District or Landmark Name"
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400">Latitude:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Longitude:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Field Observation Details:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe ground cracks (width/length), muddy water seepage, bulging slope, tilting trees..."
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Photo Upload with Preview */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Photo Evidence:</label>
              <label className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 cursor-pointer transition">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Evidence Preview"
                    className="h-28 w-full object-cover rounded-md"
                  />
                ) : (
                  <div className="text-center py-2">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-400 font-medium">
                      Upload hillside photo or ground crack snapshot
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-emerald-950/50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting...' : 'Register Hazard Report'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Reports Feed & Verification Workflow (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Filter Bar */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Status Filter:</span>
              {(['ALL', 'NEW', 'UNDER_REVIEW', 'VERIFIED', 'RESOLVED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    selectedStatusFilter === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-mono">
              {filteredReports.length} Reports Found
            </span>
          </div>

          {/* Reports List */}
          <div className="space-y-3 max-h-[640px] overflow-y-auto no-scrollbar pr-1">
            {filteredReports.map((report) => {
              const isVerified = report.status === 'VERIFIED';
              const isNew = report.status === 'NEW';
              const isResolved = report.status === 'RESOLVED';

              return (
                <div
                  key={report.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 font-bold text-xs">
                        {report.hazardType}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{report.locationName}</h4>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>Reported by {report.reporterName} ({report.reporterRole})</span>
                          <span>&bull;</span>
                          <span>{new Date(report.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          report.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : report.severity === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}
                      >
                        {report.severity}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isVerified
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isResolved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isNew
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>

                  {/* Body & AI Classification Box */}
                  <p className="text-xs text-slate-300 leading-relaxed">{report.description}</p>

                  {report.aiClassification && (
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-rose-300 flex items-center gap-2">
                          <span>AI Field Analysis: {report.aiClassification.detectedHazard}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Confidence: {report.aiClassification.confidencePercentage}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {report.aiClassification.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Verification Workflow Actions (for Operators & Authorities) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-500 font-mono">
                      GPS: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'VERIFIED')}
                          className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Check className="w-3 h-3" />
                          <span>Verify Hazard</span>
                        </button>
                      )}

                      {report.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                          className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mark Resolved</span>
                        </button>
                      )}

                      {report.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'REJECTED')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
