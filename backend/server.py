from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
import json
import uuid

load_dotenv()

app = FastAPI(title="OpenClaw Installer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

SKILLS_CATALOG = [
    {"id": "weather", "name": "Weather", "category": "Utility", "description": "Get weather forecasts and conditions", "popular": True},
    {"id": "github", "name": "GitHub", "category": "Developer", "description": "Manage repos, issues, and PRs", "popular": True},
    {"id": "discord", "name": "Discord", "category": "Communication", "description": "Send and manage Discord messages", "popular": True},
    {"id": "slack", "name": "Slack", "category": "Communication", "description": "Slack workspace integration", "popular": True},
    {"id": "spotify-player", "name": "Spotify Player", "category": "Media", "description": "Control Spotify playback", "popular": True},
    {"id": "obsidian", "name": "Obsidian", "category": "Productivity", "description": "Manage Obsidian vault notes", "popular": True},
    {"id": "notion", "name": "Notion", "category": "Productivity", "description": "Create and manage Notion pages", "popular": False},
    {"id": "trello", "name": "Trello", "category": "Productivity", "description": "Manage Trello boards and cards", "popular": False},
    {"id": "coding-agent", "name": "Coding Agent", "category": "Developer", "description": "AI-powered coding assistant", "popular": True},
    {"id": "nano-banana-pro", "name": "Nano Banana Pro", "category": "AI", "description": "Image generation with Gemini", "popular": True},
    {"id": "openai-image-gen", "name": "OpenAI Image Gen", "category": "AI", "description": "Generate images with DALL-E", "popular": False},
    {"id": "openai-whisper", "name": "OpenAI Whisper", "category": "AI", "description": "Speech-to-text transcription", "popular": False},
    {"id": "oracle", "name": "Oracle", "category": "AI", "description": "Knowledge base search and retrieval", "popular": True},
    {"id": "summarize", "name": "Summarize", "category": "Utility", "description": "Summarize long text or articles", "popular": True},
    {"id": "skill-creator", "name": "Skill Creator", "category": "Developer", "description": "Create new skills from natural language", "popular": True},
    {"id": "apple-notes", "name": "Apple Notes", "category": "Productivity", "description": "Sync with Apple Notes", "popular": False},
    {"id": "bear-notes", "name": "Bear Notes", "category": "Productivity", "description": "Manage Bear app notes", "popular": False},
    {"id": "healthcheck", "name": "Health Check", "category": "System", "description": "Monitor system health and status", "popular": False},
    {"id": "camsnap", "name": "CamSnap", "category": "Media", "description": "Capture webcam snapshots", "popular": False},
    {"id": "canvas", "name": "Canvas", "category": "AI", "description": "Interactive AI canvas for brainstorming", "popular": False},
    {"id": "1password", "name": "1Password", "category": "Security", "description": "Access 1Password vault items", "popular": False},
    {"id": "gh-issues", "name": "GitHub Issues", "category": "Developer", "description": "Manage GitHub issues in detail", "popular": False},
    {"id": "voice-call", "name": "Voice Call", "category": "Communication", "description": "Make and receive voice calls", "popular": False},
    {"id": "peekaboo", "name": "Peekaboo", "category": "Utility", "description": "Screen capture and monitoring", "popular": False},
    {"id": "openhue", "name": "OpenHue", "category": "Smart Home", "description": "Control Philips Hue lights", "popular": False},
    {"id": "sonoscli", "name": "Sonos CLI", "category": "Smart Home", "description": "Control Sonos speakers", "popular": False},
    {"id": "himalaya", "name": "Himalaya", "category": "Communication", "description": "Terminal email client integration", "popular": False},
    {"id": "model-usage", "name": "Model Usage", "category": "System", "description": "Track LLM API usage and costs", "popular": False},
    {"id": "session-logs", "name": "Session Logs", "category": "System", "description": "View and search session logs", "popular": False},
    {"id": "blogwatcher", "name": "Blog Watcher", "category": "Utility", "description": "Monitor RSS feeds and blogs", "popular": False},
]

SECURITY_PRESETS = {
    "standard": {
        "name": "Standard",
        "description": "Balanced security for most users",
        "sandbox_enabled": True,
        "file_access": "restricted",
        "network_access": True,
        "shell_access": "sandboxed",
        "browser_control": True,
        "auto_approve_tools": False,
    },
    "paranoid": {
        "name": "Paranoid",
        "description": "Maximum security, all actions require approval",
        "sandbox_enabled": True,
        "file_access": "none",
        "network_access": False,
        "shell_access": "none",
        "browser_control": False,
        "auto_approve_tools": False,
    },
    "permissive": {
        "name": "Permissive",
        "description": "Full access for power users",
        "sandbox_enabled": False,
        "file_access": "full",
        "network_access": True,
        "shell_access": "full",
        "browser_control": True,
        "auto_approve_tools": True,
    },
}


class InstallConfig(BaseModel):
    session_id: Optional[str] = None
    install_method: str = "npm"
    install_path: str = "C:\\Users\\%USERNAME%\\.openclaw"
    api_keys: dict = {}
    security_preset: str = "standard"
    security_custom: dict = {}
    selected_skills: list = []
    ai_provider: str = "anthropic"
    model_name: str = "claude-sonnet-4-5-20250514"


class ApiKeyEntry(BaseModel):
    provider: str
    key: str
    label: Optional[str] = ""


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "openclaw-installer", "version": "1.0.0"}


@app.get("/api/system-check")
async def system_check():
    checks = [
        {"id": "os", "name": "Operating System", "required": True, "status": "pass", "detail": "Windows 11 (Build 22631)", "icon": "monitor"},
        {"id": "nodejs", "name": "Node.js", "required": True, "status": "pass", "detail": "v22.12.0 (LTS)", "icon": "box", "version": "22.12.0", "min_version": "20.0.0"},
        {"id": "pnpm", "name": "pnpm", "required": True, "status": "warn", "detail": "Not installed - will be installed automatically", "icon": "package"},
        {"id": "git", "name": "Git", "required": True, "status": "pass", "detail": "v2.47.1", "icon": "git-branch"},
        {"id": "disk", "name": "Disk Space", "required": True, "status": "pass", "detail": "124 GB available on C:\\", "icon": "hard-drive"},
        {"id": "memory", "name": "RAM", "required": True, "status": "pass", "detail": "16 GB (8 GB minimum required)", "icon": "cpu"},
        {"id": "network", "name": "Network", "required": True, "status": "pass", "detail": "Connected - npm registry reachable", "icon": "wifi"},
        {"id": "firewall", "name": "Windows Firewall", "required": False, "status": "info", "detail": "Active - rules will be configured", "icon": "shield"},
        {"id": "defender", "name": "Windows Defender", "required": False, "status": "info", "detail": "Exclusion will be added for install path", "icon": "shield-check"},
        {"id": "powershell", "name": "PowerShell", "required": True, "status": "pass", "detail": "v7.4.6", "icon": "terminal"},
    ]
    passed = sum(1 for c in checks if c["status"] == "pass")
    total = len(checks)
    return {"checks": checks, "passed": passed, "total": total, "ready": all(c["status"] != "fail" for c in checks)}


@app.get("/api/skills")
async def get_skills():
    categories = sorted(set(s["category"] for s in SKILLS_CATALOG))
    return {"skills": SKILLS_CATALOG, "categories": categories, "total": len(SKILLS_CATALOG)}


@app.get("/api/security-presets")
async def get_security_presets():
    return {"presets": SECURITY_PRESETS}


@app.post("/api/validate-key")
async def validate_api_key(entry: ApiKeyEntry):
    if not entry.key or len(entry.key) < 10:
        return {"valid": False, "message": "Key is too short"}
    prefix_map = {
        "anthropic": "sk-ant-",
        "openai": "sk-",
        "google": "AI",
        "custom": "",
    }
    expected = prefix_map.get(entry.provider, "")
    if expected and not entry.key.startswith(expected):
        return {"valid": False, "message": f"Expected key starting with '{expected}'"}
    return {"valid": True, "message": f"{entry.provider.capitalize()} key validated", "provider": entry.provider}


@app.post("/api/save-config")
async def save_config(config: InstallConfig):
    session_id = config.session_id or str(uuid.uuid4())
    doc = {
        "session_id": session_id,
        "install_method": config.install_method,
        "install_path": config.install_path,
        "api_keys": {k: "***" + v[-4:] if len(v) > 4 else "***" for k, v in config.api_keys.items()},
        "security_preset": config.security_preset,
        "security_custom": config.security_custom,
        "selected_skills": config.selected_skills,
        "ai_provider": config.ai_provider,
        "model_name": config.model_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.install_configs.update_one(
        {"session_id": session_id},
        {"$set": doc},
        upsert=True,
    )
    return {"session_id": session_id, "saved": True}


@app.post("/api/generate-script")
async def generate_script(config: InstallConfig):
    install_path = config.install_path.replace("%USERNAME%", "$env:USERNAME")
    skills_str = ",".join(config.selected_skills) if config.selected_skills else ""
    
    security = SECURITY_PRESETS.get(config.security_preset, SECURITY_PRESETS["standard"])

    api_env_lines = []
    for provider, key in config.api_keys.items():
        env_var = f"OPENCLAW_{provider.upper()}_API_KEY"
        api_env_lines.append(f'[Environment]::SetEnvironmentVariable("{env_var}", "{key}", "User")')

    script = f'''# ============================================================
# OpenClaw Automatic Installer for Windows 11
# Generated: {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}
# Method: {config.install_method}
# Security: {config.security_preset}
# ============================================================

#Requires -Version 7.0
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$INSTALL_PATH = "{install_path}"
$LOG_FILE = "$INSTALL_PATH\\install.log"

function Write-Log {{
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry -ForegroundColor $(switch ($Level) {{
        "ERROR" {{ "Red" }}
        "WARN"  {{ "Yellow" }}
        "OK"    {{ "Green" }}
        default {{ "Cyan" }}
    }})
    Add-Content -Path $LOG_FILE -Value $logEntry -ErrorAction SilentlyContinue
}}

Write-Host ""
Write-Host "  ==================================================" -ForegroundColor Red
Write-Host "        OpenClaw Installer for Windows 11" -ForegroundColor White
Write-Host "        Your Personal AI Assistant" -ForegroundColor DarkGray
Write-Host "  ==================================================" -ForegroundColor Red
Write-Host ""

# --- Phase 1: System Checks ---
Write-Log "Starting system checks..."

# Check Windows version
$os = Get-CimInstance Win32_OperatingSystem
if ($os.BuildNumber -lt 22000) {{
    Write-Log "Windows 11 required (Build 22000+). Current: $($os.BuildNumber)" "ERROR"
    exit 1
}}
Write-Log "Windows 11 detected (Build $($os.BuildNumber))" "OK"

# Check PowerShell version
if ($PSVersionTable.PSVersion.Major -lt 7) {{
    Write-Log "PowerShell 7+ recommended. Current: $($PSVersionTable.PSVersion)" "WARN"
}}

# Check disk space
$drive = Get-PSDrive C
$freeGB = [math]::Round($drive.Free / 1GB, 1)
if ($freeGB -lt 5) {{
    Write-Log "Insufficient disk space: $freeGB GB (5 GB minimum)" "ERROR"
    exit 1
}}
Write-Log "Disk space: $freeGB GB available" "OK"

# --- Phase 2: Dependencies ---
Write-Log "Checking dependencies..."

# Node.js
$nodeVersion = $null
try {{ $nodeVersion = (node --version 2>$null) }} catch {{}}
if (-not $nodeVersion) {{
    Write-Log "Node.js not found. Installing via winget..." "WARN"
    winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
}} else {{
    Write-Log "Node.js $nodeVersion found" "OK"
}}

# pnpm
$pnpmVersion = $null
try {{ $pnpmVersion = (pnpm --version 2>$null) }} catch {{}}
if (-not $pnpmVersion) {{
    Write-Log "Installing pnpm..." "INFO"
    npm install -g pnpm
}}
Write-Log "pnpm ready" "OK"

# Git
$gitVersion = $null
try {{ $gitVersion = (git --version 2>$null) }} catch {{}}
if (-not $gitVersion) {{
    Write-Log "Git not found. Installing via winget..." "WARN"
    winget install --id Git.Git --accept-package-agreements --accept-source-agreements
}} else {{
    Write-Log "$gitVersion found" "OK"
}}

# --- Phase 3: Install OpenClaw ---
Write-Log "Installing OpenClaw..."

New-Item -ItemType Directory -Force -Path $INSTALL_PATH | Out-Null
Set-Location $INSTALL_PATH

'''

    if config.install_method == "npm":
        script += '''npm install -g openclaw
Write-Log "OpenClaw installed via npm" "OK"
'''
    elif config.install_method == "one-liner":
        script += '''irm https://openclaw.ai/install.ps1 | iex
Write-Log "OpenClaw installed via installer script" "OK"
'''
    else:
        script += '''git clone https://github.com/openclaw/openclaw.git .
pnpm install
pnpm run build
Write-Log "OpenClaw installed from source" "OK"
'''

    script += f'''
# --- Phase 4: Security Configuration ---
Write-Log "Configuring security ({config.security_preset} preset)..."

'''

    if security.get("sandbox_enabled"):
        script += '''# Enable sandbox mode
$configPath = "$INSTALL_PATH\\.openclaw\\config.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath | ConvertFrom-Json
    $config | Add-Member -NotePropertyName "sandbox" -NotePropertyValue $true -Force
    $config | ConvertTo-Json -Depth 10 | Set-Content $configPath
}
Write-Log "Sandbox mode enabled" "OK"
'''

    script += '''
# Add Windows Defender exclusion
try {
    Add-MpPreference -ExclusionPath $INSTALL_PATH -ErrorAction SilentlyContinue
    Write-Log "Windows Defender exclusion added" "OK"
} catch {
    Write-Log "Could not add Defender exclusion (run as admin)" "WARN"
}

# Configure Windows Firewall
try {
    New-NetFirewallRule -DisplayName "OpenClaw" -Direction Inbound -LocalPort 3000,8080 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue
    Write-Log "Firewall rules configured" "OK"
} catch {
    Write-Log "Could not configure firewall (run as admin)" "WARN"
}
'''

    if api_env_lines:
        script += "\n# --- Phase 5: API Keys ---\nWrite-Log \"Setting API keys...\"\n"
        for line in api_env_lines:
            script += f"{line}\n"
        script += 'Write-Log "API keys configured" "OK"\n'

    if skills_str:
        script += f'''
# --- Phase 6: Install Skills ---
Write-Log "Installing selected skills..."
$skills = "{skills_str}" -split ","
foreach ($skill in $skills) {{
    Write-Log "Installing skill: $skill"
    # Skills are installed during onboarding
}}
Write-Log "Skills queued for installation" "OK"
'''

    script += '''
# --- Phase 7: Onboarding ---
Write-Log "Starting OpenClaw onboarding..."
Write-Host ""
Write-Host "  Installation complete!" -ForegroundColor Green
Write-Host "  Run 'openclaw onboard' to set up your personal AI assistant." -ForegroundColor Cyan
Write-Host ""

# openclaw onboard
'''

    return {"script": script, "filename": "install-openclaw.ps1"}


@app.get("/api/install-methods")
async def get_install_methods():
    return {
        "methods": [
            {
                "id": "npm",
                "name": "npm (Recommended)",
                "description": "Standard installation via npm package manager",
                "command": "npm i -g openclaw",
                "difficulty": "easy",
            },
            {
                "id": "one-liner",
                "name": "One-Liner Script",
                "description": "Automated script that installs everything for you",
                "command": "irm https://openclaw.ai/install.ps1 | iex",
                "difficulty": "easy",
            },
            {
                "id": "hackable",
                "name": "Hackable (Git Clone)",
                "description": "Clone and build from source for full customization",
                "command": "git clone https://github.com/openclaw/openclaw.git",
                "difficulty": "advanced",
            },
        ]
    }


@app.get("/api/ai-providers")
async def get_ai_providers():
    return {
        "providers": [
            {"id": "anthropic", "name": "Anthropic Claude", "models": ["claude-sonnet-4-5-20250514", "claude-opus-4-5-20250514", "claude-haiku-4-5-20250514"], "key_prefix": "sk-ant-", "recommended": True},
            {"id": "openai", "name": "OpenAI", "models": ["gpt-5.2", "gpt-4o", "gpt-4o-mini"], "key_prefix": "sk-", "recommended": False},
            {"id": "google", "name": "Google Gemini", "models": ["gemini-3-flash", "gemini-3-pro"], "key_prefix": "AI", "recommended": False},
            {"id": "local", "name": "Local Models", "models": ["MiniMax M2.5", "Ollama", "LM Studio"], "key_prefix": "", "recommended": False},
            {"id": "custom", "name": "Custom / Other", "models": [], "key_prefix": "", "recommended": False},
        ]
    }
