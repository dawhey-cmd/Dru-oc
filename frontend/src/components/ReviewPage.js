import React, { useState } from 'react';
import { ArrowLeft, Download, Copy, CheckCircle2, Loader2, Package, KeyRound, Shield, Zap, Terminal } from 'lucide-react';

function ReviewPage({ config, updateConfig, goPrev, apiUrl, skills }) {
  const [script, setScript] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [installRunning, setInstallRunning] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installLogs, setInstallLogs] = useState([]);

  const generateScript = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${apiUrl}/api/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setScript(data);
    } catch (e) {
      console.error('Script generation failed:', e);
    }
    setGenerating(false);
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await fetch(`${apiUrl}/api/save-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch (e) {
      console.error('Save failed:', e);
    }
    setSaving(false);
  };

  const downloadScript = () => {
    if (!script) return;
    const blob = new Blob([script.script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = script.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyScript = async () => {
    if (!script) return;
    await navigator.clipboard.writeText(script.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateInstall = () => {
    setInstallRunning(true);
    setInstallProgress(0);
    setInstallLogs([]);
    const logs = [
      '[INFO] Starting OpenClaw installation...',
      '[OK] Windows 11 (Build 22631) detected',
      '[OK] PowerShell 7.4.6 available',
      '[INFO] Checking disk space...',
      '[OK] 124 GB available on C:\\',
      '[INFO] Checking Node.js...',
      '[OK] Node.js v22.12.0 found',
      '[WARN] pnpm not found - installing...',
      '[OK] pnpm installed successfully',
      '[OK] Git v2.47.1 found',
      `[INFO] Installing OpenClaw via ${config.install_method}...`,
      '[OK] OpenClaw core installed',
      `[INFO] Configuring security (${config.security_preset})...`,
      '[OK] Sandbox mode configured',
      '[OK] Windows Defender exclusion added',
      '[OK] Firewall rules configured',
      ...(Object.keys(config.api_keys).length > 0 ? ['[INFO] Setting API keys...', '[OK] API keys configured'] : []),
      ...(config.selected_skills.length > 0 ? [`[INFO] Installing ${config.selected_skills.length} skills...`, '[OK] Skills installed'] : []),
      '[OK] Installation complete!',
      '[INFO] Run "openclaw onboard" to start your AI assistant',
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setInstallLogs(prev => [...prev, logs[i]]);
        setInstallProgress(Math.round(((i + 1) / logs.length) * 100));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 600);
  };

  const selectedSkillNames = config.selected_skills
    .map(id => skills.find(s => s.id === id)?.name)
    .filter(Boolean);

  return (
    <div data-testid="review-page">
      <div className="step-header">
        <h1>Review & Install</h1>
        <p>Review your configuration, generate the install script, and run the installer</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
        <SummaryCard
          icon={<Package size={18} />}
          title="Install Method"
          value={config.install_method}
          detail={config.install_path}
          testId="summary-method"
        />
        <SummaryCard
          icon={<KeyRound size={18} />}
          title="API Keys"
          value={`${Object.keys(config.api_keys).filter(k => config.api_keys[k]).length} configured`}
          detail={Object.keys(config.api_keys).filter(k => config.api_keys[k]).join(', ') || 'None'}
          testId="summary-keys"
        />
        <SummaryCard
          icon={<Shield size={18} />}
          title="Security"
          value={config.security_preset}
          detail={`AI: ${config.ai_provider} / ${config.model_name}`}
          testId="summary-security"
        />
        <SummaryCard
          icon={<Zap size={18} />}
          title="Skills"
          value={`${config.selected_skills.length} selected`}
          detail={selectedSkillNames.slice(0, 4).join(', ') + (selectedSkillNames.length > 4 ? ` +${selectedSkillNames.length - 4} more` : '') || 'None'}
          testId="summary-skills"
        />
      </div>

      {/* Actions */}
      <div className="panel" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" data-testid="generate-script-btn" onClick={generateScript} disabled={generating}>
          {generating ? <><Loader2 size={14} className="spin" /> Generating...</> : <><Terminal size={14} /> Generate Script</>}
        </button>
        <button className="btn btn-secondary" data-testid="save-config-btn" onClick={saveConfig} disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        {!installRunning && (
          <button className="btn btn-secondary" data-testid="simulate-install-btn" onClick={simulateInstall} style={{ background: 'rgba(0,229,255,0.08)', borderColor: 'rgba(0,229,255,0.3)', color: '#00E5FF' }}>
            Simulate Install
          </button>
        )}
      </div>

      {/* Script Preview */}
      {script && (
        <div className="panel" data-testid="script-preview" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
              {script.filename}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" data-testid="copy-script-btn" onClick={copyScript}>
                {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
              <button className="btn btn-primary" data-testid="download-script-btn" onClick={downloadScript}>
                <Download size={14} /> Download .ps1
              </button>
            </div>
          </div>
          <div className="terminal-block" style={{ maxHeight: 300, fontSize: '0.75rem' }}>
            {script.script}
          </div>
        </div>
      )}

      {/* Install Simulation */}
      {installRunning && (
        <div className="panel" data-testid="install-simulation" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
              Installation Progress
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: installProgress === 100 ? '#00E676' : '#00E5FF' }}>
              {installProgress}%
            </span>
          </div>
          <div className="progress-bar" style={{ marginBottom: 16 }}>
            <div className="progress-fill" style={{ width: `${installProgress}%`, background: installProgress === 100 ? '#00E676' : undefined }} />
          </div>
          <div className="terminal-block" style={{ maxHeight: 250, fontSize: '0.78rem' }}>
            {installLogs.map((log, i) => (
              <div key={i}>
                <span className={log.includes('[OK]') ? 'success' : log.includes('[WARN]') ? 'warn' : log.includes('[ERROR]') ? 'prompt' : ''}>
                  {log}
                </span>
              </div>
            ))}
            {installProgress < 100 && <span className="terminal-cursor" />}
          </div>
        </div>
      )}

      <div className="step-nav">
        <button className="btn btn-ghost" data-testid="review-back-btn" onClick={goPrev}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function SummaryCard({ icon, title, value, detail, testId }) {
  return (
    <div className="panel" data-testid={testId} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: 'rgba(255,45,45,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF2D2D', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.78rem', color: '#5A6480', marginBottom: 2 }}>{title}</div>
        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', textTransform: 'capitalize' }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: '#7A849C', marginTop: 2 }}>{detail}</div>
      </div>
    </div>
  );
}

export default ReviewPage;
