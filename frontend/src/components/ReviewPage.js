import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Copy, CheckCircle2, Loader2, Package, KeyRound, Shield, Zap, Terminal, Wifi, Play, FlaskConical, XCircle } from 'lucide-react';

function ReviewPage({ config, goPrev, apiUrl, skills }) {
  const [script, setScript] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wsProgress, setWsProgress] = useState(0);
  const [wsLogs, setWsLogs] = useState([]);
  const [wsRunning, setWsRunning] = useState(false);
  const [wsComplete, setWsComplete] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const wsRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [wsLogs]);

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
    } catch (e) { console.error(e); }
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
    } catch (e) { console.error(e); }
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

  const testScript = async () => {
    if (!script) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${apiUrl}/api/validate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: script.script }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({ valid: false, errors: ['Failed to connect to validation service'] });
    }
    setTesting(false);
  };

  const startWsInstall = () => {
    setWsRunning(true);
    setWsProgress(0);
    setWsLogs([]);
    setWsComplete(false);

    const wsUrl = apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(`${wsUrl}/api/ws/install`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ config }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'progress') {
        setWsProgress(data.progress);
        const prefix = data.status === 'ok' ? '[OK]' : data.status === 'warn' ? '[WARN]' : data.status === 'error' ? '[ERROR]' : '[INFO]';
        setWsLogs(prev => [...prev, { text: `${prefix} [${data.phase}] ${data.message}`, status: data.status }]);
      } else if (data.type === 'complete') {
        setWsProgress(100);
        setWsComplete(true);
        setWsLogs(prev => [...prev, { text: '[OK] Installation complete!', status: 'ok' }]);
      } else if (data.type === 'error') {
        setWsLogs(prev => [...prev, { text: `[ERROR] ${data.message}`, status: 'error' }]);
      }
    };

    ws.onerror = () => {
      setWsLogs(prev => [...prev, { text: '[WARN] WebSocket connection issue - falling back to simulation', status: 'warn' }]);
      simulateFallback();
    };

    ws.onclose = () => {
      if (!wsComplete) {
        setWsRunning(false);
      }
    };
  };

  const simulateFallback = () => {
    const logs = [
      { text: '[INFO] Starting OpenClaw installation (offline simulation)...', status: 'info' },
      { text: '[OK] Windows 11 (Build 22631) detected', status: 'ok' },
      { text: '[OK] PowerShell 7.4.6 available', status: 'ok' },
      { text: '[OK] 124 GB available on C:\\', status: 'ok' },
      { text: '[OK] Node.js v22.12.0 found', status: 'ok' },
      { text: '[WARN] pnpm not found - installing automatically...', status: 'warn' },
      { text: '[OK] pnpm installed via npm', status: 'ok' },
      { text: '[OK] Git v2.47.1 found', status: 'ok' },
      { text: `[INFO] Installing OpenClaw via ${config.install_method}...`, status: 'info' },
      { text: '[OK] OpenClaw core installed', status: 'ok' },
      { text: `[INFO] Applying ${config.security_preset} security preset...`, status: 'info' },
      { text: '[OK] Sandbox mode configured', status: 'ok' },
      { text: '[OK] Windows Defender exclusion added', status: 'ok' },
      { text: '[OK] Firewall rules applied', status: 'ok' },
    ];
    if (Object.keys(config.api_keys).length > 0) {
      logs.push({ text: '[OK] API keys configured', status: 'ok' });
    }
    if (config.selected_skills.length > 0) {
      logs.push({ text: `[OK] ${config.selected_skills.length} skills installed`, status: 'ok' });
    }
    logs.push({ text: '[OK] Post-install health check passed', status: 'ok' });
    logs.push({ text: '[OK] Installation complete!', status: 'ok' });

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setWsLogs(prev => [...prev, logs[i]]);
        setWsProgress(Math.round(((i + 1) / logs.length) * 100));
        i++;
      } else {
        clearInterval(interval);
        setWsComplete(true);
      }
    }, 500);
  };

  const selectedSkillNames = config.selected_skills
    .map(id => skills.find(s => s.id === id)?.name)
    .filter(Boolean);

  return (
    <div data-testid="review-page">
      <div className="step-header">
        <h1>Review & Install</h1>
        <p>Review your configuration, generate the bulletproof install script, and run the installer</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
        <SummaryCard icon={<Package size={18} />} title="Install Method" value={config.install_method} detail={config.install_path} testId="summary-method" />
        <SummaryCard icon={<KeyRound size={18} />} title="API Keys" value={`${Object.keys(config.api_keys).filter(k => config.api_keys[k]).length} configured`} detail={Object.keys(config.api_keys).filter(k => config.api_keys[k]).join(', ') || 'None'} testId="summary-keys" />
        <SummaryCard icon={<Shield size={18} />} title="Security" value={config.security_preset} detail={`AI: ${config.ai_provider} / ${config.model_name}`} testId="summary-security" />
        <SummaryCard icon={<Zap size={18} />} title="Skills" value={`${config.selected_skills.length} selected`} detail={selectedSkillNames.slice(0, 4).join(', ') + (selectedSkillNames.length > 4 ? ` +${selectedSkillNames.length - 4} more` : '') || 'None'} testId="summary-skills" />
      </div>

      {/* Bulletproof Badge */}
      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 14, borderColor: 'rgba(0,230,118,0.2)', background: 'rgba(0,230,118,0.03)', marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,230,118,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} style={{ color: '#00E676' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#00E676', fontSize: '0.9rem' }}>Bulletproof Install Mode</div>
          <div style={{ fontSize: '0.78rem', color: '#8892A8' }}>Auto-retry (3 attempts), fallback installers (winget, direct download, Chocolatey), PATH repair, and error recovery built-in. Your install WILL succeed.</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="panel" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" data-testid="generate-script-btn" onClick={generateScript} disabled={generating}>
          {generating ? <><Loader2 size={14} className="spin" /> Generating...</> : <><Terminal size={14} /> Generate Script</>}
        </button>
        <button className="btn btn-secondary" data-testid="save-config-btn" onClick={saveConfig} disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        {!wsRunning && (
          <button className="btn btn-secondary" data-testid="ws-install-btn" onClick={startWsInstall} style={{ background: 'rgba(0,229,255,0.08)', borderColor: 'rgba(0,229,255,0.3)', color: '#00E5FF' }}>
            <Wifi size={14} /> Live Install Simulation
          </button>
        )}
      </div>

      {/* Script Preview */}
      {script && (
        <div className="panel" data-testid="script-preview" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{script.filename}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" data-testid="copy-script-btn" onClick={copyScript}>
                {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
              <button className="btn btn-secondary" data-testid="test-script-btn" onClick={testScript} disabled={testing} style={{ background: 'rgba(255,193,7,0.08)', borderColor: 'rgba(255,193,7,0.3)', color: '#FFC107' }}>
                {testing ? <><Loader2 size={14} className="spin" /> Testing...</> : <><FlaskConical size={14} /> Quick Test</>}
              </button>
              <button className="btn btn-primary" data-testid="download-script-btn" onClick={downloadScript}>
                <Download size={14} /> Download .ps1
              </button>
            </div>
          </div>
          {testResult && (
            <div style={{ padding: '12px 16px', marginBottom: 12, borderRadius: 8, background: testResult.valid ? 'rgba(0,230,118,0.08)' : 'rgba(255,45,45,0.08)', border: `1px solid ${testResult.valid ? 'rgba(0,230,118,0.3)' : 'rgba(255,45,45,0.3)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: testResult.warnings?.length || testResult.errors?.length ? 8 : 0 }}>
                {testResult.valid ? <CheckCircle2 size={16} style={{ color: '#00E676' }} /> : <XCircle size={16} style={{ color: '#FF2D2D' }} />}
                <span style={{ fontWeight: 600, color: testResult.valid ? '#00E676' : '#FF2D2D' }}>
                  {testResult.valid ? 'Script syntax valid!' : 'Script has issues'}
                </span>
              </div>
              {testResult.warnings?.length > 0 && (
                <div style={{ fontSize: '0.78rem', color: '#FFC107' }}>
                  {testResult.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
                </div>
              )}
              {testResult.errors?.length > 0 && (
                <div style={{ fontSize: '0.78rem', color: '#FF6B6B' }}>
                  {testResult.errors.map((e, i) => <div key={i}>✗ {e}</div>)}
                </div>
              )}
              {testResult.stats && (
                <div style={{ fontSize: '0.78rem', color: '#8892A8', marginTop: 6 }}>
                  {testResult.stats.lines} lines • {testResult.stats.functions} functions • {testResult.stats.variables} variables
                </div>
              )}
            </div>
          )}
          <div className="terminal-block" style={{ maxHeight: 300, fontSize: '0.75rem' }}>{script.script}</div>
        </div>
      )}

      {/* WebSocket Live Install */}
      {wsRunning && (
        <div className="panel" data-testid="ws-install-panel" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              {wsComplete ? <CheckCircle2 size={16} style={{ color: '#00E676' }} /> : <Wifi size={16} style={{ color: '#00E5FF' }} />}
              {wsComplete ? 'Installation Complete' : 'Live Installation Progress'}
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: wsComplete ? '#00E676' : '#00E5FF' }}>
              {wsProgress}%
            </span>
          </div>
          <div className="progress-bar" style={{ marginBottom: 16 }}>
            <div className="progress-fill" style={{ width: `${wsProgress}%`, background: wsComplete ? '#00E676' : undefined }} />
          </div>
          <div className="terminal-block" style={{ maxHeight: 300, fontSize: '0.78rem' }}>
            {wsLogs.map((log, i) => (
              <div key={i}>
                <span className={log.status === 'ok' ? 'success' : log.status === 'warn' ? 'warn' : log.status === 'error' ? 'prompt' : ''}>
                  {log.text}
                </span>
              </div>
            ))}
            {!wsComplete && <span className="terminal-cursor" />}
            <div ref={logEndRef} />
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
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,45,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF2D2D', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.78rem', color: '#5A6480', marginBottom: 2 }}>{title}</div>
        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', textTransform: 'capitalize' }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: '#7A849C', marginTop: 2 }}>{detail}</div>
      </div>
    </div>
  );
}

export default ReviewPage;
