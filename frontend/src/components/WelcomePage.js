import React from 'react';
import { ArrowRight, Terminal, Package, GitBranch } from 'lucide-react';

function WelcomePage({ goNext }) {
  return (
    <div data-testid="welcome-page">
      <div className="step-header">
        <h1 style={{ fontSize: '2.4rem' }}>
          <span style={{ marginRight: 12 }}>&#129438;</span>
          OpenClaw Installer
        </h1>
        <p style={{ maxWidth: 560, marginTop: 12 }}>
          Your personal AI assistant, ready to deploy on Windows 11. 
          This wizard will guide you through dependency checks, configuration, 
          security setup, and skill installation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 32 }}>
        <FeatureCard
          icon={<Terminal size={20} />}
          title="Auto-Detect Dependencies"
          desc="Scans your system for Node.js, pnpm, Git and fixes missing packages"
          testId="feature-dependencies"
        />
        <FeatureCard
          icon={<Package size={20} />}
          title="50+ Skills Available"
          desc="GitHub, Slack, Discord, coding agent, image gen, and more"
          testId="feature-skills"
        />
        <FeatureCard
          icon={<GitBranch size={20} />}
          title="Multiple Install Methods"
          desc="npm, one-liner, or clone from source for full control"
          testId="feature-methods"
        />
      </div>

      <div className="panel" style={{ marginTop: 32, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(255,45,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>&#9888;&#65039;</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#FFD54F', fontSize: '0.9rem' }}>Windows 11 Required</div>
          <div style={{ fontSize: '0.82rem', color: '#8892A8', marginTop: 2 }}>
            This installer targets Windows 11 (Build 22000+). System checks will verify compatibility.
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16, padding: 20 }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 12 }}>What this installer does:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            'Checks Windows 11 compatibility',
            'Installs Node.js, pnpm, Git if missing',
            'Configures security & sandboxing',
            'Sets up your preferred AI provider',
            'Installs selected skills & plugins',
            'Generates a PowerShell install script',
            'Configures Windows Firewall rules',
            'Adds Windows Defender exclusions',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#A0AAC0', fontSize: '0.85rem', padding: '4px 0' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2D2D', flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="step-nav">
        <div />
        <button className="btn btn-primary" data-testid="welcome-next-btn" onClick={goNext}>
          Begin Setup <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, testId }) {
  return (
    <div className="panel" data-testid={testId} style={{ textAlign: 'center', padding: 24 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,45,45,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FF2D2D', marginBottom: 12 }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginBottom: 6 }}>{title}</h3>
      <p style={{ color: '#7A849C', fontSize: '0.82rem', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

export default WelcomePage;
