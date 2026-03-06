import React, { useState } from 'react';
import { Monitor, Download, Terminal, Shield, Cpu, HardDrive, Wifi, Copy, Check, Box } from 'lucide-react';

function DesktopAppPage({ config, apiUrl }) {
  const [copied, setCopied] = useState('');

  const copyCmd = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div data-testid="desktop-page">
      <div className="step-header">
        <h1>Desktop App (.exe)</h1>
        <p>Build or download the native Windows installer with Electron packaging</p>
      </div>

      {/* Electron Info */}
      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 16, borderColor: 'rgba(0,229,255,0.2)' }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg, #47848F, #2C3E50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Monitor size={24} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>OpenClaw Desktop Installer</div>
          <div style={{ fontSize: '0.82rem', color: '#8892A8', marginTop: 2 }}>
            Native Windows application built with Electron. Packages the installer wizard as a standalone .exe with auto-update support.
          </div>
        </div>
      </div>

      {/* System Requirements */}
      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          System Requirements for Building
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <ReqItem icon={<Cpu size={14} />} label="Node.js" value="v20+ (LTS)" />
          <ReqItem icon={<Box size={14} />} label="Electron" value="v33+" />
          <ReqItem icon={<HardDrive size={14} />} label="Disk Space" value="~2 GB for build" />
          <ReqItem icon={<Shield size={14} />} label="Code Signing" value="Optional (recommended)" />
          <ReqItem icon={<Wifi size={14} />} label="electron-builder" value="For packaging" />
          <ReqItem icon={<Terminal size={14} />} label="Platform" value="Windows 10/11 x64" />
        </div>
      </div>

      {/* Build Instructions */}
      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          <Terminal size={16} style={{ marginRight: 6 }} /> Build from Source
        </h3>

        <BuildStep step={1} title="Clone the installer repo" cmd="git clone https://github.com/openclaw/openclaw-installer.git && cd openclaw-installer" copied={copied} onCopy={copyCmd} />
        <BuildStep step={2} title="Install dependencies" cmd="npm install" copied={copied} onCopy={copyCmd} />
        <BuildStep step={3} title="Build the React frontend" cmd="npm run build" copied={copied} onCopy={copyCmd} />
        <BuildStep step={4} title="Package as Windows .exe" cmd="npx electron-builder --win --x64" copied={copied} onCopy={copyCmd} />
        <BuildStep step={5} title="Find your installer" cmd="explorer dist\\OpenClaw-Installer-Setup.exe" copied={copied} onCopy={copyCmd} />
      </div>

      {/* Electron Config Preview */}
      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          electron-builder Configuration
        </h3>
        <div className="terminal-block" style={{ fontSize: '0.78rem' }}>
{`{
  "appId": "ai.openclaw.installer",
  "productName": "OpenClaw Installer",
  "directories": { "output": "dist" },
  "files": [
    "build/**/*",
    "electron/**/*",
    "node_modules/**/*"
  ],
  "win": {
    "target": [
      { "target": "nsis", "arch": ["x64"] }
    ],
    "icon": "build/icon.ico",
    "publisherName": "OpenClaw"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "installerIcon": "build/icon.ico",
    "uninstallerIcon": "build/icon.ico",
    "license": "LICENSE.md",
    "runAfterFinish": true
  },
  "publish": {
    "provider": "github",
    "owner": "openclaw",
    "repo": "openclaw-installer"
  }
}`}
        </div>
      </div>

      {/* Electron Main Process Preview */}
      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          Electron Main Process (main.js)
        </h3>
        <div className="terminal-block" style={{ fontSize: '0.75rem' }}>
{`const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, height: 800,
    minWidth: 900, minHeight: 600,
    frame: false, // Custom titlebar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'build/icon.ico'),
    backgroundColor: '#060810',
  });

  mainWindow.loadFile('build/index.html');
  mainWindow.on('closed', () => { mainWindow = null; });
  autoUpdater.checkForUpdatesAndNotify();
}

app.whenReady().then(createWindow);

// Run PowerShell install script from Electron
ipcMain.handle('run-install', async (_, script) => {
  return new Promise((resolve, reject) => {
    const ps = exec(
      'powershell.exe -ExecutionPolicy Bypass -Command -',
      { maxBuffer: 1024 * 1024 * 10 },
      (error, stdout, stderr) => {
        if (error) reject({ error: error.message, stderr });
        else resolve({ stdout, stderr });
      }
    );
    ps.stdin.write(script);
    ps.stdin.end();
  });
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update-available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update-downloaded');
});`}
        </div>
      </div>

      {/* Features */}
      <div className="panel">
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          Desktop App Features
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            'Single .exe installer (NSIS)',
            'Auto-update via GitHub Releases',
            'Native PowerShell execution',
            'Windows system tray integration',
            'Real-time install progress (IPC)',
            'Code signing support',
            'Custom install directory picker',
            'Offline dependency bundling',
          ].map((feat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#A0AAC0', fontSize: '0.85rem', padding: '4px 0' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00E5FF', flexShrink: 0 }} />
              {feat}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReqItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ color: '#5A6480' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#C4CCE0' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: '#5A6480' }}>{value}</div>
      </div>
    </div>
  );
}

function BuildStep({ step, title, cmd, copied, onCopy }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,45,45,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: '#FF2D2D', fontWeight: 700 }}>{step}</div>
        <span style={{ fontSize: '0.85rem', color: '#C4CCE0' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="terminal-block" style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem' }}>
          <span style={{ color: '#FF2D2D' }}>$ </span>{cmd}
        </div>
        <button className="btn btn-ghost" onClick={() => onCopy(`step-${step}`, cmd)} data-testid={`copy-step-${step}`} style={{ padding: '4px 10px' }}>
          {copied === `step-${step}` ? <Check size={14} style={{ color: '#00E676' }} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export default DesktopAppPage;
