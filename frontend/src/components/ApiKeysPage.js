import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2, XCircle, Plus, Trash2, Clipboard } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const DEFAULT_PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-api03-...', prefix: 'sk-ant-' },
  { id: 'openai', name: 'OpenAI', placeholder: 'sk-proj-...', prefix: 'sk-' },
  { id: 'google', name: 'Google Gemini', placeholder: 'AIzaSy...', prefix: 'AI' },
];

function ApiKeysPage({ config, updateConfig, goNext, goPrev, apiUrl }) {
  const [showKeys, setShowKeys] = useState({});
  const [validations, setValidations] = useState({});
  const [customKeys, setCustomKeys] = useState([]);
  const { t } = useI18n();

  const handleKeyChange = (provider, value) => {
    updateConfig('api_keys', { ...config.api_keys, [provider]: value });
    setValidations(prev => ({ ...prev, [provider]: null }));
  };

  const validateKey = async (provider) => {
    const key = config.api_keys[provider];
    if (!key) return;
    try {
      const res = await fetch(`${apiUrl}/api/validate-key`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, key }) });
      const data = await res.json();
      setValidations(prev => ({ ...prev, [provider]: data }));
    } catch (e) {
      setValidations(prev => ({ ...prev, [provider]: { valid: false, message: 'Validation failed' } }));
    }
  };

  const toggleShow = (id) => setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  const addCustomKey = () => setCustomKeys(prev => [...prev, { id: `custom-${Date.now()}`, name: '', key: '' }]);
  const removeCustomKey = (id) => { setCustomKeys(prev => prev.filter(k => k.id !== id)); const newKeys = { ...config.api_keys }; delete newKeys[id]; updateConfig('api_keys', newKeys); };

  const pasteFromClipboard = async (provider) => {
    try { const text = await navigator.clipboard.readText(); handleKeyChange(provider, text); } catch {}
  };

  return (
    <div data-testid="api-keys-page">
      <div className="step-header">
        <h1>{t('apikeys.title')}</h1>
        <p>{t('apikeys.subtitle')}</p>
      </div>

      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 16 }}>
        <KeyRound size={18} style={{ color: '#00E5FF' }} />
        <div style={{ flex: 1 }}><div style={{ fontSize: '0.85rem', color: '#C4CCE0' }}>{t('apikeys.localOnly')}</div></div>
      </div>

      {DEFAULT_PROVIDERS.map((provider) => (
        <div key={provider.id} className="panel" data-testid={`apikey-${provider.id}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{provider.name}</div>
            {validations[provider.id] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {validations[provider.id].valid
                  ? <><CheckCircle2 size={14} style={{ color: '#00E676' }} /><span style={{ fontSize: '0.78rem', color: '#00E676' }}>{t('apikeys.valid')}</span></>
                  : <><XCircle size={14} style={{ color: '#FF5252' }} /><span style={{ fontSize: '0.78rem', color: '#FF5252' }}>{validations[provider.id].message}</span></>}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input type={showKeys[provider.id] ? 'text' : 'password'} className="input-field" data-testid={`apikey-input-${provider.id}`} value={config.api_keys[provider.id] || ''} onChange={(e) => handleKeyChange(provider.id, e.target.value)} placeholder={provider.placeholder} />
              <button onClick={() => toggleShow(provider.id)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5A6480', cursor: 'pointer' }} data-testid={`toggle-show-${provider.id}`}>
                {showKeys[provider.id] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button className="btn btn-secondary" onClick={() => pasteFromClipboard(provider.id)} data-testid={`paste-${provider.id}`}><Clipboard size={14} /> {t('apikeys.paste')}</button>
            <button className="btn btn-secondary" onClick={() => validateKey(provider.id)} data-testid={`validate-${provider.id}`}>{t('apikeys.validate')}</button>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#4A5270', marginTop: 6 }}>{t('apikeys.prefix')} <code style={{ color: '#8892A8' }}>{provider.prefix}</code></div>
        </div>
      ))}

      <div className="panel" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{t('apikeys.custom')}</div>
          <button className="btn btn-secondary" data-testid="add-custom-key-btn" onClick={addCustomKey}><Plus size={14} /> {t('apikeys.addKey')}</button>
        </div>
        {customKeys.map((ck) => (
          <div key={ck.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="text" className="input-field" data-testid={`custom-name-${ck.id}`} placeholder="Service name (e.g. WEATHER_API)" style={{ maxWidth: 200 }} onChange={(e) => setCustomKeys(prev => prev.map(k => k.id === ck.id ? { ...k, name: e.target.value } : k))} />
            <input type="password" className="input-field" data-testid={`custom-key-${ck.id}`} placeholder="Paste API key" style={{ flex: 1 }} onChange={(e) => handleKeyChange(ck.name || ck.id, e.target.value)} />
            <button className="btn btn-ghost" onClick={() => removeCustomKey(ck.id)} data-testid={`remove-custom-${ck.id}`}><Trash2 size={14} style={{ color: '#FF5252' }} /></button>
          </div>
        ))}
        {customKeys.length === 0 && <div style={{ color: '#4A5270', fontSize: '0.82rem', textAlign: 'center', padding: 12 }}>{t('apikeys.customEmpty')}</div>}
      </div>

      <div className="step-nav">
        <button className="btn btn-ghost" data-testid="apikeys-back-btn" onClick={goPrev}><ArrowLeft size={16} /> {t('common.back')}</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" data-testid="apikeys-skip-btn" onClick={goNext}>{t('apikeys.skip')}</button>
          <button className="btn btn-primary" data-testid="apikeys-next-btn" onClick={goNext}>{t('common.continue')} <ArrowRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}

export default ApiKeysPage;
