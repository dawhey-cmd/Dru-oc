import React from 'react';
import { ArrowRight, ArrowLeft, Shield, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const presetIcons = { standard: <Shield size={22} />, paranoid: <Lock size={22} />, permissive: <Unlock size={22} /> };
const presetColors = { standard: '#00E5FF', paranoid: '#FF2D2D', permissive: '#FFD54F' };

function SecurityPage({ config, updateConfig, goNext, goPrev, presets }) {
  const { t } = useI18n();
  const currentPreset = presets[config.security_preset] || {};

  const toggleCustom = (key) => {
    const custom = { ...config.security_custom };
    custom[key] = !custom[key];
    updateConfig('security_custom', custom);
  };

  const getCustomValue = (key, defaultVal) => {
    if (config.security_custom[key] !== undefined) return config.security_custom[key];
    return defaultVal;
  };

  return (
    <div data-testid="security-page">
      <div className="step-header">
        <h1>{t('security.title')}</h1>
        <p>{t('security.subtitle')}</p>
      </div>

      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 16 }}>{t('security.preset')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {Object.entries(presets).map(([id, preset]) => (
            <div key={id} data-testid={`preset-${id}`} className={`method-card ${config.security_preset === id ? 'selected' : ''}`} onClick={() => updateConfig('security_preset', id)} style={{ borderColor: config.security_preset === id ? presetColors[id] : undefined }}>
              <div style={{ color: presetColors[id], marginBottom: 10 }}>{presetIcons[id]}</div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginBottom: 4 }}>{preset.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#7A849C', lineHeight: 1.4 }}>{preset.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 16 }}>{t('security.detailed')}</h3>
        <SecurityToggle label={t('security.sandbox')} description={t('security.sandboxDesc')} value={getCustomValue('sandbox_enabled', currentPreset.sandbox_enabled)} onToggle={() => toggleCustom('sandbox_enabled')} testId="toggle-sandbox" />
        <SecurityToggle label={t('security.network')} description={t('security.networkDesc')} value={getCustomValue('network_access', currentPreset.network_access)} onToggle={() => toggleCustom('network_access')} testId="toggle-network" />
        <SecurityToggle label={t('security.browser')} description={t('security.browserDesc')} value={getCustomValue('browser_control', currentPreset.browser_control)} onToggle={() => toggleCustom('browser_control')} testId="toggle-browser" />
        <SecurityToggle label={t('security.autoApprove')} description={t('security.autoApproveDesc')} value={getCustomValue('auto_approve_tools', currentPreset.auto_approve_tools)} onToggle={() => toggleCustom('auto_approve_tools')} testId="toggle-auto-approve" />

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: '0.82rem', color: '#8892A8', display: 'block', marginBottom: 6 }}>{t('security.fileAccess')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['none', 'restricted', 'full'].map(level => (
              <button key={level} data-testid={`file-access-${level}`} className={`btn ${(config.security_custom.file_access || currentPreset.file_access) === level ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateConfig('security_custom', { ...config.security_custom, file_access: level })} style={{ textTransform: 'capitalize', flex: 1 }}>{level}</button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: '0.82rem', color: '#8892A8', display: 'block', marginBottom: 6 }}>{t('security.shellAccess')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['none', 'sandboxed', 'full'].map(level => (
              <button key={level} data-testid={`shell-access-${level}`} className={`btn ${(config.security_custom.shell_access || currentPreset.shell_access) === level ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateConfig('security_custom', { ...config.security_custom, shell_access: level })} style={{ textTransform: 'capitalize', flex: 1 }}>{level}</button>
            ))}
          </div>
        </div>
      </div>

      {config.security_preset === 'permissive' && (
        <div className="panel" style={{ display: 'flex', gap: 12, alignItems: 'center', borderColor: 'rgba(255, 193, 7, 0.3)' }}>
          <AlertTriangle size={18} style={{ color: '#FFD54F', flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', color: '#FFD54F' }}>{t('security.permissiveWarn')}</div>
        </div>
      )}

      <div className="step-nav">
        <button className="btn btn-ghost" data-testid="security-back-btn" onClick={goPrev}><ArrowLeft size={16} /> {t('common.back')}</button>
        <button className="btn btn-primary" data-testid="security-next-btn" onClick={goNext}>{t('common.continue')} <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

function SecurityToggle({ label, description, value, onToggle, testId }) {
  return (
    <div className="security-toggle" data-testid={testId}>
      <div>
        <div style={{ fontWeight: 500, color: '#C4CCE0', fontSize: '0.88rem' }}>{label}</div>
        <div style={{ fontSize: '0.78rem', color: '#5A6480', marginTop: 2 }}>{description}</div>
      </div>
      <div className={`toggle-switch ${value ? 'active' : ''}`} onClick={onToggle}>
        <div className="toggle-knob" />
      </div>
    </div>
  );
}

export default SecurityPage;
