import React, { useState } from 'react';
import { Share2, Link, Copy, Check, Users, Plus, Trash2, Send } from 'lucide-react';

function ShareConfigPage({ config, apiUrl, skills }) {
  const [shareLink, setShareLink] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState(['']);
  const [batchCreated, setBatchCreated] = useState(null);
  const [creatingBatch, setCreatingBatch] = useState(false);

  const createShareLink = async () => {
    setSharing(true);
    try {
      const res = await fetch(`${apiUrl}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, team_name: teamName }),
      });
      const data = await res.json();
      setShareLink(data);
    } catch (e) { console.error(e); }
    setSharing(false);
  };

  const copyLink = () => {
    if (!shareLink) return;
    const url = `${window.location.origin}?share=${shareLink.share_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addMember = () => setMembers(prev => [...prev, '']);
  const removeMember = (idx) => setMembers(prev => prev.filter((_, i) => i !== idx));
  const updateMember = (idx, val) => setMembers(prev => prev.map((m, i) => i === idx ? val : m));

  const createBatch = async () => {
    if (!teamName.trim() || members.filter(m => m.trim()).length === 0) return;
    setCreatingBatch(true);
    try {
      const res = await fetch(`${apiUrl}/api/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: teamName,
          members: members.filter(m => m.trim()),
          config,
        }),
      });
      const data = await res.json();
      setBatchCreated(data);
    } catch (e) { console.error(e); }
    setCreatingBatch(false);
  };

  const selectedSkillNames = config.selected_skills?.map(id => skills.find(s => s.id === id)?.name).filter(Boolean) || [];

  return (
    <div data-testid="share-page">
      <div className="step-header">
        <h1>Share & Team Install</h1>
        <p>Generate a shareable link or set up batch installations for your team</p>
      </div>

      {/* Config Summary */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '0.82rem', color: '#8892A8', marginBottom: 8 }}>Current config to share:</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Tag label="Method" value={config.install_method} />
          <Tag label="Provider" value={config.ai_provider} />
          <Tag label="Security" value={config.security_preset} />
          <Tag label="Skills" value={`${config.selected_skills?.length || 0} selected`} />
        </div>
        {selectedSkillNames.length > 0 && (
          <div style={{ fontSize: '0.78rem', color: '#5A6480', marginTop: 8 }}>
            Skills: {selectedSkillNames.join(', ')}
          </div>
        )}
      </div>

      {/* Share Link */}
      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link size={16} /> Generate Share Link
        </h3>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input className="input-field" data-testid="share-team-name" placeholder="Team name (optional)" value={teamName} onChange={e => setTeamName(e.target.value)} style={{ maxWidth: 300 }} />
          <button className="btn btn-primary" data-testid="create-share-btn" onClick={createShareLink} disabled={sharing}>
            <Share2 size={14} /> {sharing ? 'Generating...' : 'Generate Link'}
          </button>
        </div>

        {shareLink && (
          <div style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 8, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#00E5FF', wordBreak: 'break-all' }} data-testid="share-link-text">
              {window.location.origin}?share={shareLink.share_id}
            </div>
            <button className="btn btn-secondary" data-testid="copy-share-link" onClick={copyLink}>
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
        )}
      </div>

      {/* Batch Install */}
      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={16} /> Batch Install for Teams
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#7A849C', marginBottom: 16 }}>
          Add team member emails to create a batch install. Each member gets the same config.
        </p>

        {members.map((member, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="input-field"
              data-testid={`member-email-${idx}`}
              placeholder={`team-member-${idx + 1}@company.com`}
              value={member}
              onChange={e => updateMember(idx, e.target.value)}
              style={{ flex: 1 }}
            />
            {members.length > 1 && (
              <button className="btn btn-ghost" onClick={() => removeMember(idx)} data-testid={`remove-member-${idx}`}>
                <Trash2 size={14} style={{ color: '#FF5252' }} />
              </button>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn btn-secondary" data-testid="add-member-btn" onClick={addMember}>
            <Plus size={14} /> Add Member
          </button>
          <button className="btn btn-primary" data-testid="create-batch-btn" onClick={createBatch} disabled={creatingBatch || !teamName.trim()}>
            <Send size={14} /> {creatingBatch ? 'Creating...' : 'Create Batch Install'}
          </button>
        </div>

        {batchCreated && (
          <div style={{ marginTop: 16, background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 8, padding: 14 }}>
            <div style={{ fontWeight: 600, color: '#00E676', marginBottom: 4 }}>Batch Created!</div>
            <div style={{ fontSize: '0.82rem', color: '#8892A8' }}>
              Team: {batchCreated.team_name} · {batchCreated.members} members · Batch ID: <code style={{ color: '#00E5FF' }}>{batchCreated.batch_id}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Tag({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: '0.72rem', color: '#5A6480' }}>{label}:</span>
      <span className="tag tag-info" style={{ textTransform: 'capitalize' }}>{value}</span>
    </div>
  );
}

export default ShareConfigPage;
