import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Share2, Save, Package } from 'lucide-react';

function AnalyticsPage({ apiUrl }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/analytics/summary`);
      const data = await res.json();
      setAnalytics(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) {
    return (
      <div data-testid="analytics-page" style={{ textAlign: 'center', padding: 60, color: '#5A6480' }}>
        Loading analytics...
      </div>
    );
  }

  const maxTimeline = Math.max(...(analytics?.demo_timeline || []).map(d => d.installs), 1);

  return (
    <div data-testid="analytics-page">
      <div className="step-header">
        <h1>Installer Analytics</h1>
        <p>Track installation metrics, popular configurations, and usage patterns</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        <KpiCard icon={<Package size={18} />} label="Installs" value={analytics?.total_installs || 0} color="#FF2D2D" testId="kpi-installs" />
        <KpiCard icon={<Save size={18} />} label="Configs Saved" value={analytics?.total_configs || 0} color="#00E5FF" testId="kpi-configs" />
        <KpiCard icon={<Share2 size={18} />} label="Shared" value={analytics?.total_shares || 0} color="#FFD54F" testId="kpi-shares" />
        <KpiCard icon={<Save size={18} />} label="Profiles" value={analytics?.total_profiles || 0} color="#00E676" testId="kpi-profiles" />
        <KpiCard icon={<Users size={18} />} label="Batches" value={analytics?.total_batches || 0} color="#FF6B35" testId="kpi-batches" />
      </div>

      {/* Install Timeline Chart */}
      <div className="panel" data-testid="timeline-chart">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} /> Installation Timeline
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, padding: '0 4px' }}>
          {(analytics?.demo_timeline || []).map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: '0.72rem', color: '#8892A8', fontFamily: 'JetBrains Mono, monospace' }}>
                {d.installs}
              </div>
              <div style={{
                width: '100%', borderRadius: '4px 4px 0 0',
                height: `${(d.installs / maxTimeline) * 120}px`,
                background: `linear-gradient(180deg, #FF2D2D, rgba(255,45,45,0.3))`,
                transition: 'height 0.5s ease',
                minHeight: 4,
              }} />
              <div style={{ fontSize: '0.65rem', color: '#4A5270' }}>
                {d.date.split('-').slice(1).join('/')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Method Stats */}
        <div className="panel" data-testid="method-stats">
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14 }}>
            Install Methods
          </h3>
          {Object.entries(analytics?.method_stats || {}).map(([method, count]) => {
            const total = Object.values(analytics?.method_stats || {}).reduce((a, b) => a + b, 0) || 1;
            return (
              <div key={method} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.85rem', color: '#C4CCE0', textTransform: 'capitalize' }}>{method}</span>
                  <span style={{ fontSize: '0.82rem', color: '#8892A8', fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Provider Stats */}
        <div className="panel" data-testid="provider-stats">
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14 }}>
            AI Providers
          </h3>
          {Object.entries(analytics?.provider_stats || {}).map(([provider, count]) => {
            const total = Object.values(analytics?.provider_stats || {}).reduce((a, b) => a + b, 0) || 1;
            const colors = { anthropic: '#FF6B35', openai: '#00E676', google: '#00E5FF', local: '#FFD54F', custom: '#FF2D2D' };
            return (
              <div key={provider} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.85rem', color: '#C4CCE0', textTransform: 'capitalize' }}>{provider}</span>
                  <span style={{ fontSize: '0.82rem', color: '#8892A8', fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(count / total) * 100}%`, background: colors[provider] || '#FF2D2D' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Skills */}
      {analytics?.top_skills?.length > 0 && (
        <div className="panel" data-testid="top-skills" style={{ marginTop: 16 }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14 }}>
            <BarChart3 size={16} style={{ marginRight: 6 }} /> Top Skills
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {analytics.top_skills.map(([skill, count], i) => (
              <div key={skill} className="tag tag-info" style={{ padding: '6px 12px' }}>
                #{i + 1} {skill} ({count})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, color, testId }) {
  return (
    <div className="panel" data-testid={testId} style={{ textAlign: 'center', padding: 16 }}>
      <div style={{ color, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: '#5A6480', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default AnalyticsPage;
