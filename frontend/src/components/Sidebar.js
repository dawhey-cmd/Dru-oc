import React from 'react';
import { Home, ScanSearch, Settings, KeyRound, Shield, Zap, Rocket, ChevronRight, Save, Share2, Store, BarChart3, Monitor } from 'lucide-react';
import { LanguageSelector } from '../context/I18nContext';
import { TelemetryToggle } from '../context/TelemetryContext';

const iconMap = {
  home: Home, scan: ScanSearch, settings: Settings, key: KeyRound,
  shield: Shield, zap: Zap, rocket: Rocket, save: Save,
  share: Share2, store: Store, chart: BarChart3, monitor: Monitor,
};

function Sidebar({ steps, currentStep, setCurrentStep }) {
  return (
    <aside className="sidebar" data-testid="sidebar">
      <div className="sidebar-brand" data-testid="sidebar-brand">
        <div className="brand-icon">&#129438;</div>
        <div>
          <div className="brand-name">OpenClaw</div>
          <div className="brand-sub">Installer</div>
        </div>
      </div>

      <nav className="sidebar-nav" data-testid="sidebar-nav">
        {steps.map((step, idx) => {
          if (step.section === 'divider') {
            return (
              <div key="divider" style={{ padding: '8px 20px', margin: '4px 0' }}>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ fontSize: '0.65rem', color: '#3A4260', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: 10, marginBottom: 2 }}>
                  Tools
                </div>
              </div>
            );
          }
          const Icon = iconMap[step.icon] || Home;
          const isActive = idx === currentStep;
          const isDone = step.section === 'wizard' && idx < currentStep && currentStep <= 7;
          return (
            <button
              key={step.id}
              data-testid={`step-${step.id}`}
              className={`nav-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              onClick={() => setCurrentStep(idx)}
            >
              <div className="nav-step-indicator">
                <div className={`indicator-dot ${isActive ? 'pulse' : ''}`} />
                {idx < steps.length - 1 && step.section !== 'divider' && steps[idx + 1]?.section !== 'divider' && (
                  <div className="indicator-line" />
                )}
              </div>
              <div className="nav-step-content">
                <Icon size={15} />
                <span>{step.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="nav-arrow" />}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer" data-testid="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <LanguageSelector />
          <TelemetryToggle />
        </div>
        <div className="footer-version">v2.1.0</div>
        <div className="footer-link">
          <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer">openclaw.ai</a>
        </div>
      </div>

      <style>{`
        .sidebar {
          position: fixed; left: 0; top: 0; width: 260px; height: 100vh;
          background: rgba(6, 8, 16, 0.95); border-right: 1px solid rgba(255, 45, 45, 0.08);
          display: flex; flex-direction: column; z-index: 50; backdrop-filter: blur(20px);
        }
        .sidebar-brand {
          display: flex; align-items: center; gap: 12px; padding: 24px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .brand-icon { font-size: 28px; filter: drop-shadow(0 0 8px rgba(255, 45, 45, 0.4)); }
        .brand-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.15rem; color: #fff; }
        .brand-sub { font-size: 0.7rem; color: #FF2D2D; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; }
        .sidebar-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
        .nav-step {
          display: flex; align-items: center; width: 100%; padding: 9px 20px;
          background: none; border: none; color: #5A6480; cursor: pointer;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; position: relative;
        }
        .nav-step:hover { color: #A0AAC0; background: rgba(255, 255, 255, 0.02); }
        .nav-step.active { color: #fff; background: rgba(255, 45, 45, 0.06); }
        .nav-step.done { color: #00E676; }
        .nav-step-indicator {
          display: flex; flex-direction: column; align-items: center;
          margin-right: 14px; position: relative; min-height: 28px;
        }
        .indicator-dot { width: 7px; height: 7px; border-radius: 50%; background: #2A3050; flex-shrink: 0; }
        .nav-step.active .indicator-dot { background: #FF2D2D; box-shadow: 0 0 10px rgba(255, 45, 45, 0.5); }
        .indicator-dot.pulse { animation: pulse-ring 2s ease infinite; }
        .nav-step.done .indicator-dot { background: #00E676; }
        .indicator-line { width: 2px; height: 14px; background: #1A2038; margin-top: 3px; }
        .nav-step.done .indicator-line { background: rgba(0, 230, 118, 0.3); }
        .nav-step-content { display: flex; align-items: center; gap: 10px; }
        .nav-arrow { position: absolute; right: 16px; color: #FF2D2D; }
        .sidebar-footer {
          padding: 16px 20px; border-top: 1px solid rgba(255, 255, 255, 0.04);
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-version { font-size: 0.7rem; color: #3A4260; font-family: 'JetBrains Mono', monospace; }
        .footer-link a { font-size: 0.75rem; color: #5A6480; text-decoration: none; transition: color 0.2s; }
        .footer-link a:hover { color: #FF2D2D; }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 45, 45, 0.5); }
          50% { box-shadow: 0 0 0 6px rgba(255, 45, 45, 0); }
        }
        @media (max-width: 1024px) {
          .sidebar { width: 100%; height: auto; position: fixed; top: 0; flex-direction: row; overflow-x: auto; padding: 0; }
          .sidebar-brand { display: none; }
          .sidebar-footer { display: none; }
          .sidebar-nav { display: flex; padding: 0; }
          .nav-step { padding: 12px 16px; white-space: nowrap; }
          .nav-step-indicator { display: none; }
          .nav-arrow { display: none; }
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
