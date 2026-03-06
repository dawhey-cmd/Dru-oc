import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, Download, Trash2, FileJson, Plus, Check } from 'lucide-react';

function ProfilesPage({ config, setFullConfig, apiUrl }) {
  const [profiles, setProfiles] = useState([]);
  const [profileName, setProfileName] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/profiles`);
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch (e) { console.error(e); }
  };

  const saveProfile = async () => {
    if (!profileName.trim()) return;
    setSaving(true);
    try {
      await fetch(`${apiUrl}/api/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, description: profileDesc, config }),
      });
      setProfileName('');
      setProfileDesc('');
      fetchProfiles();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const loadProfile = (profile) => {
    setFullConfig(profile.config);
    setLoaded(profile.profile_id);
    setTimeout(() => setLoaded(''), 2000);
  };

  const deleteProfile = async (profileId) => {
    try {
      await fetch(`${apiUrl}/api/profiles/${profileId}`, { method: 'DELETE' });
      fetchProfiles();
    } catch (e) { console.error(e); }
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openclaw-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        setFullConfig(imported);
        setLoaded('imported');
        setTimeout(() => setLoaded(''), 2000);
      } catch { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
  };

  return (
    <div data-testid="profiles-page">
      <div className="step-header">
        <h1>Configuration Profiles</h1>
        <p>Save, load, import, and export your installer configurations</p>
      </div>

      {/* Import/Export */}
      <div className="panel" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn btn-primary" data-testid="export-config-btn" onClick={exportConfig}>
          <Download size={14} /> Export Current Config
        </button>
        <button className="btn btn-secondary" data-testid="import-config-btn" onClick={() => fileInputRef.current?.click()}>
          <Upload size={14} /> Import Config File
        </button>
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importConfig} data-testid="import-file-input" />
        {loaded === 'imported' && <span style={{ color: '#00E676', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} /> Config imported!</span>}
      </div>

      {/* Save New Profile */}
      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          <Plus size={16} style={{ marginRight: 6 }} /> Save Current as Profile
        </h3>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input className="input-field" data-testid="profile-name-input" placeholder="Profile name (e.g. 'Dev Setup')" value={profileName} onChange={e => setProfileName(e.target.value)} style={{ flex: 1 }} />
          <input className="input-field" data-testid="profile-desc-input" placeholder="Description (optional)" value={profileDesc} onChange={e => setProfileDesc(e.target.value)} style={{ flex: 1 }} />
        </div>
        <button className="btn btn-primary" data-testid="save-profile-btn" onClick={saveProfile} disabled={saving || !profileName.trim()}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Saved Profiles */}
      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          Saved Profiles ({profiles.length})
        </h3>
        {profiles.length === 0 && (
          <div style={{ textAlign: 'center', padding: 30, color: '#4A5270' }}>
            <FileJson size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
            <div>No saved profiles yet. Save your current config above.</div>
          </div>
        )}
        {profiles.map(p => (
          <div key={p.profile_id} data-testid={`profile-${p.profile_id}`} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,45,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileJson size={16} style={{ color: '#FF2D2D' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#C4CCE0', fontSize: '0.9rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#5A6480' }}>{p.description || 'No description'} · {p.config?.install_method} · {p.config?.selected_skills?.length || 0} skills</div>
            </div>
            <button className="btn btn-secondary" style={{ padding: '6px 14px' }} onClick={() => loadProfile(p)} data-testid={`load-profile-${p.profile_id}`}>
              {loaded === p.profile_id ? <><Check size={14} /> Loaded</> : <><Upload size={14} /> Load</>}
            </button>
            <button className="btn btn-ghost" onClick={() => deleteProfile(p.profile_id)} data-testid={`delete-profile-${p.profile_id}`}>
              <Trash2 size={14} style={{ color: '#FF5252' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfilesPage;
