import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Star, Smartphone, Globe, Check } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useTelemetry } from '../context/TelemetryContext';

function MarketplacePage({ config, updateConfig, apiUrl }) {
  const [marketplace, setMarketplace] = useState({ skills: [], categories: [] });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();
  const { track } = useTelemetry();

  useEffect(() => { fetchMarketplace(); }, []);

  const fetchMarketplace = async () => {
    try { const res = await fetch(`${apiUrl}/api/marketplace`); const data = await res.json(); setMarketplace(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return marketplace.skills.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'All' || s.category === filterCat;
      const matchPlatform = filterPlatform === 'all' || s.platform?.includes(filterPlatform);
      return matchSearch && matchCat && matchPlatform;
    });
  }, [marketplace.skills, search, filterCat, filterPlatform]);

  const isInstalled = (skillId) => config.selected_skills?.includes(skillId);

  const toggleInstall = (skillId) => {
    const selected = isInstalled(skillId)
      ? config.selected_skills.filter(id => id !== skillId)
      : [...(config.selected_skills || []), skillId];
    track('marketplace_install', { skillId, action: isInstalled(skillId) ? 'remove' : 'install' });
    updateConfig('selected_skills', selected);
  };

  const iosCount = marketplace.skills.filter(s => s.platform?.includes('ios')).length;

  return (
    <div data-testid="marketplace-page">
      <div className="step-header">
        <h1>{t('marketplace.title')}</h1>
        <p>{t('marketplace.subtitle')}</p>
      </div>

      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 16, borderColor: 'rgba(0,229,255,0.2)', background: 'rgba(0,229,255,0.03)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #007AFF, #5856D6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Smartphone size={22} color="#fff" /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{t('marketplace.iosTitle')}</div>
          <div style={{ fontSize: '0.82rem', color: '#8892A8', marginTop: 2 }}>{iosCount} {t('marketplace.iosDesc')}</div>
        </div>
        <span className="tag tag-info">{iosCount} iOS Skills</span>
      </div>

      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5A6480' }} />
          <input className="input-field" data-testid="marketplace-search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('marketplace.search')} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'windows', 'ios', 'macos'].map(p => (
            <button key={p} data-testid={`platform-${p}`} className={`btn ${filterPlatform === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterPlatform(p)} style={{ padding: '6px 12px', fontSize: '0.78rem', textTransform: 'capitalize' }}>
              {p === 'ios' && <Smartphone size={12} style={{ marginRight: 4 }} />}
              {p === 'all' && <Globe size={12} style={{ marginRight: 4 }} />}
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['All', ...marketplace.categories].map(cat => (
          <button key={cat} data-testid={`mkt-cat-${cat.toLowerCase()}`} className={`btn ${filterCat === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCat(cat)} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>{cat}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#5A6480' }}>{t('marketplace.loading')}</div>
      ) : (
        <div className="card-grid" data-testid="marketplace-grid">
          {filtered.map(skill => {
            const installed = isInstalled(skill.id);
            return (
              <div key={skill.id} data-testid={`mkt-skill-${skill.id}`} className={`skill-card ${installed ? 'selected' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, color: installed ? '#fff' : '#C4CCE0', fontSize: '0.9rem' }}>{skill.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={12} style={{ color: '#FFD54F', fill: '#FFD54F' }} /><span style={{ fontSize: '0.75rem', color: '#FFD54F' }}>{skill.rating}</span></div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6A7490', lineHeight: 1.4, marginBottom: 8 }}>{skill.description}</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span className="tag tag-info">{skill.category}</span>
                  <span style={{ fontSize: '0.7rem', color: '#5A6480' }}>by {skill.author}</span>
                  <span style={{ fontSize: '0.7rem', color: '#5A6480' }}>{(skill.downloads / 1000).toFixed(1)}k downloads</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {skill.platform?.map(p => (
                    <span key={p} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: p === 'ios' ? 'rgba(0,122,255,0.15)' : 'rgba(255,255,255,0.05)', color: p === 'ios' ? '#4FC3F7' : '#5A6480' }}>{p}</span>
                  ))}
                </div>
                <button className={`btn ${installed ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', justifyContent: 'center', padding: '7px 0' }} onClick={() => toggleInstall(skill.id)} data-testid={`install-mkt-${skill.id}`}>
                  {installed ? <><Check size={14} /> {t('marketplace.installed')}</> : <><Download size={14} /> {t('marketplace.install')}</>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && !loading && <div style={{ textAlign: 'center', padding: 40, color: '#5A6480' }}>{t('marketplace.noResults')}</div>}
    </div>
  );
}

export default MarketplacePage;
