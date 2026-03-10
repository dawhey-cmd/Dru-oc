import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Info, Monitor, Box, Package, GitBranch, HardDrive, Cpu, Wifi, Shield, ShieldCheck, Terminal as TerminalIcon } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const iconMap = {
  'monitor': Monitor, 'box': Box, 'package': Package, 'git-branch': GitBranch,
  'hard-drive': HardDrive, 'cpu': Cpu, 'wifi': Wifi, 'shield': Shield,
  'shield-check': ShieldCheck, 'terminal': TerminalIcon,
};

const statusIcon = {
  pass: <CheckCircle2 size={16} style={{ color: '#00E676' }} />,
  warn: <AlertTriangle size={16} style={{ color: '#FFD54F' }} />,
  fail: <XCircle size={16} style={{ color: '#FF5252' }} />,
  info: <Info size={16} style={{ color: '#00E5FF' }} />,
};

function SystemCheckPage({ goNext, goPrev, apiUrl, systemChecks, setSystemChecks }) {
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const runChecks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/system-check`);
      const data = await res.json();
      setSystemChecks(data);
    } catch (e) { console.error('System check failed:', e); }
    setLoading(false);
  }, [apiUrl, setSystemChecks]);

  useEffect(() => { if (!systemChecks) runChecks(); }, [systemChecks, runChecks]);

  return (
    <div data-testid="system-check-page">
      <div className="step-header">
        <h1>{t('system.title')}</h1>
        <p>{t('system.subtitle')}</p>
      </div>

      {systemChecks && (
        <div className="panel" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>{t('system.readiness')}</span>
              <span className={`tag ${systemChecks.ready ? 'tag-pass' : 'tag-warn'}`}>
                {systemChecks.ready ? t('system.ready') : t('system.needsAttention')}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(systemChecks.passed / systemChecks.total) * 100}%` }} />
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6A7490', marginTop: 6 }}>
              {systemChecks.passed}/{systemChecks.total} {t('system.checksPassed') ? t('system.checksPassed').replace('{passed}/{total}', '').trim() || 'checks passed' : 'checks passed'}
            </div>
          </div>
          <button className="btn btn-secondary" data-testid="rescan-btn" onClick={runChecks} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> {t('system.rescan')}
          </button>
        </div>
      )}

      <div className="panel" data-testid="checks-panel">
        {loading && !systemChecks && (
          <div style={{ textAlign: 'center', padding: 40, color: '#8892A8' }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: 12 }} />
            <div>{t('system.scanning')}</div>
          </div>
        )}
        {systemChecks && systemChecks.checks.map((check) => {
          const Icon = iconMap[check.icon] || Monitor;
          return (
            <div key={check.id} data-testid={`check-${check.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A6480' }}>
                <Icon size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 500, color: '#C4CCE0', fontSize: '0.9rem' }}>{check.name}</span>
                  {check.required && <span style={{ fontSize: '0.65rem', color: '#FF2D2D', fontWeight: 600 }}>{t('system.required')}</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6A7490', marginTop: 2 }}>{check.detail}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`tag tag-${check.status}`}>{check.status.toUpperCase()}</span>
                {statusIcon[check.status]}
              </div>
            </div>
          );
        })}
      </div>

      <div className="step-nav">
        <button className="btn btn-ghost" data-testid="system-back-btn" onClick={goPrev}>
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <button className="btn btn-primary" data-testid="system-next-btn" onClick={goNext}>
          {t('common.continue')} <ArrowRight size={16} />
        </button>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default SystemCheckPage;
