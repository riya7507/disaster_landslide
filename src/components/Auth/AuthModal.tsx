import React, { useState } from 'react';
import { Role, User } from '../../types';
import { api } from '../../services/api';
import {
  UserCheck,
  Shield,
  Activity,
  Users,
  Lock,
  X,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState<string>('authority@landguard.demo');
  const [password, setPassword] = useState<string>('AuthorityPass2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickRoles: { role: Role; label: string; email: string; pass: string; icon: React.ReactNode; desc: string }[] = [
    {
      role: 'DISASTER_AUTHORITY',
      label: 'Disaster Authority (SDMA/DDMA)',
      email: 'authority@landguard.demo',
      pass: 'AuthorityPass2026!',
      icon: <Shield className="w-4 h-4 text-rose-400" />,
      desc: 'Issue official alerts, mobilize emergency shelters, view priority rankings.',
    },
    {
      role: 'FIELD_OPERATOR',
      label: 'Field Scout / Operator',
      email: 'operator@landguard.demo',
      pass: 'OperatorPass2026!',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      desc: 'Verify ground tension cracks, assess road blockages, submit patrol notes.',
    },
    {
      role: 'CITIZEN',
      label: 'Citizen / Community Volunteer',
      email: 'citizen@landguard.demo',
      pass: 'CitizenPass2026!',
      icon: <Users className="w-4 h-4 text-sky-400" />,
      desc: 'Submit crowdsourced photos of hillside seepage and localized slips.',
    },
    {
      role: 'ADMIN',
      label: 'System Administrator',
      email: 'admin@landguard.demo',
      pass: 'AdminPass2026!',
      icon: <Lock className="w-4 h-4 text-purple-400" />,
      desc: 'Full administrative access, manage telemetry endpoints, user accounts.',
    },
  ];

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(quickEmail, quickPass);
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-rose-500" />
            <h3 className="font-black text-base text-white">
              Role-Based Access & Demo Credentials
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Profiles for Evaluators */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Instant 1-Click Evaluator Sign-In:
          </span>

          <div className="grid grid-cols-1 gap-2">
            {quickRoles.map((qr) => (
              <button
                key={qr.role}
                type="button"
                onClick={() => handleQuickLogin(qr.email, qr.pass)}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition text-left flex items-start justify-between group"
              >
                <div className="flex items-start gap-2.5">
                  <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {qr.icon}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-rose-400 transition">
                      {qr.label}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{qr.desc}</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-800 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Email Address:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In With Credentials'}
          </button>
        </form>
      </div>
    </div>
  );
};
