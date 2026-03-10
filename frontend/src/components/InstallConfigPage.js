import React from 'react';
import { ArrowRight, ArrowLeft, Terminal, Package, GitBranch } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const methodIcons = { npm: <Package size={22} />, 'one-liner': <Terminal size={22} />, hackable: <GitBranch size={22} /> };

function InstallConfigPage({ config, updateConfig, goNext, goPrev, installMethods, aiProviders }) {
  const { t } = useI18n();

  return (
    <div data-testid="config-page">
      <div className="step-header">
        <h1>{t('config.title')}</h1>
        <p>{t('config.subtitle')}</p>
      </div>

      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 16 }}>{t('config.method')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {installMethods.map((method) => (
            <div key={method.id} data-testid={`method-${method.id}`} className={`method-card ${config.install_method === method.id ? 'selected' : ''}`} onClick={() => updateConfig('install_method', method.id)}>
              <div style={{ color: config.install_method === method.id ? '#FF2D2D' : '#5A6480', marginBottom: 10 }}>{methodIcons[method.id] || <Package size={22} />}</div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: 4 }}>{method.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#7A849C', lineHeight: 1.4, marginBottom: 10 }}>{method.description}</div>
              <div className="terminal-block" style={{ padding: '8px 10px', fontSize: '0.75rem' }}><span className="prompt">$ </span>{method.command}</div>
              <div style={{ marginTop: 8 }}><span className={`tag ${method.difficulty === 'easy' ? 'tag-pass' : 'tag-warn'}`}>{method.difficulty}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 16 }}>{t('config.path')}</h3>
        <input type="text" className="input-field" data-testid="install-path-input" value={config.install_path} onChange={(e) => updateConfig('install_path', e.target.value)} placeholder="C:\Users\%USERNAME%\.openclaw" />
        <div style={{ fontSize: '0.78rem', color: '#5A6480', marginTop: 8 }}>{t('config.pathDefault')} <code style={{ color: '#00E5FF' }}>C:\Users\%USERNAME%\.openclaw</code></div>
      </div>

      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 16 }}>{t('config.provider')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {aiProviders.map((provider) => (
            <div key={provider.id} data-testid={`provider-${provider.id}`} className={`provider-card ${config.ai_provider === provider.id ? 'selected' : ''}`} onClick={() => { updateConfig('ai_provider', provider.id); if (provider.models.length > 0) updateConfig('model_name', provider.models[0]); }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: config.ai_provider === provider.id ? '#00E5FF' : '#C4CCE0' }}>{provider.name}</div>
              {provider.recommended && <div style={{ fontSize: '0.65rem', color: '#FF2D2D', marginTop: 4, fontWeight: 600 }}>{t('config.recommended')}</div>}
            </div>
          ))}
        </div>
        {aiProviders.find(p => p.id === config.ai_provider)?.models.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: '0.82rem', color: '#8892A8', display: 'block', marginBottom: 6 }}>{t('config.model')}</label>
            <select className="input-field" data-testid="model-select" value={config.model_name} onChange={(e) => updateConfig('model_name', e.target.value)} style={{ cursor: 'pointer' }}>
              {aiProviders.find(p => p.id === config.ai_provider)?.models.map(m => (<option key={m} value={m}>{m}</option>))}
            </select>
          </div>
        )}
      </div>

      <div className="step-nav">
        <button className="btn btn-ghost" data-testid="config-back-btn" onClick={goPrev}><ArrowLeft size={16} /> {t('common.back')}</button>
        <button className="btn btn-primary" data-testid="config-next-btn" onClick={goNext}>{t('common.continue')} <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

export default InstallConfigPage;
