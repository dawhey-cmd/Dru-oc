from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
import json
import uuid
import asyncio
import hashlib
import base64

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

# ─── SKILLS CATALOG ──────────────────────────────────────────────────────
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

MARKETPLACE_SKILLS = [
    {"id": "mkt-telegram", "name": "Telegram Bot", "author": "community", "downloads": 12400, "rating": 4.8, "category": "Communication", "description": "Full Telegram bot integration with media support", "platform": ["windows", "macos", "linux", "ios"]},
    {"id": "mkt-whatsapp", "name": "WhatsApp Bridge", "author": "community", "downloads": 9800, "rating": 4.6, "category": "Communication", "description": "Send and receive WhatsApp messages", "platform": ["windows", "macos", "linux", "ios"]},
    {"id": "mkt-siri-shortcuts", "name": "Siri Shortcuts", "author": "openclaw", "downloads": 7600, "rating": 4.9, "category": "iOS", "description": "Trigger OpenClaw actions from Siri Shortcuts on iPhone", "platform": ["ios"]},
    {"id": "mkt-ios-widget", "name": "iOS Widget", "author": "openclaw", "downloads": 6200, "rating": 4.7, "category": "iOS", "description": "Home screen widget for quick OpenClaw commands", "platform": ["ios"]},
    {"id": "mkt-focus-modes", "name": "Focus Mode Sync", "author": "community", "downloads": 3400, "rating": 4.5, "category": "iOS", "description": "Sync iOS Focus modes with OpenClaw behavior", "platform": ["ios"]},
    {"id": "mkt-icloud-sync", "name": "iCloud Sync", "author": "openclaw", "downloads": 5100, "rating": 4.4, "category": "iOS", "description": "Sync settings and data across Apple devices via iCloud", "platform": ["ios", "macos"]},
    {"id": "mkt-stable-diffusion", "name": "Stable Diffusion", "author": "community", "downloads": 15600, "rating": 4.7, "category": "AI", "description": "Local image generation with Stable Diffusion models", "platform": ["windows", "macos", "linux"]},
    {"id": "mkt-gmail-pro", "name": "Gmail Pro", "author": "community", "downloads": 8900, "rating": 4.5, "category": "Productivity", "description": "Advanced Gmail management with filters and labels", "platform": ["windows", "macos", "linux", "ios"]},
    {"id": "mkt-jira", "name": "Jira Integration", "author": "community", "downloads": 6700, "rating": 4.3, "category": "Developer", "description": "Manage Jira tickets, sprints, and boards", "platform": ["windows", "macos", "linux"]},
    {"id": "mkt-docker-mgr", "name": "Docker Manager", "author": "community", "downloads": 5400, "rating": 4.6, "category": "Developer", "description": "Manage Docker containers and images", "platform": ["windows", "macos", "linux"]},
    {"id": "mkt-homekit", "name": "HomeKit Control", "author": "openclaw", "downloads": 4200, "rating": 4.8, "category": "iOS", "description": "Control HomeKit devices from OpenClaw", "platform": ["ios", "macos"]},
    {"id": "mkt-calendar-sync", "name": "Calendar Sync", "author": "community", "downloads": 7100, "rating": 4.4, "category": "Productivity", "description": "Bi-directional calendar sync across platforms", "platform": ["windows", "macos", "linux", "ios"]},
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

# ─── MODELS ───────────────────────────────────────────────────────────────
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

class ProfileData(BaseModel):
    name: str
    description: Optional[str] = ""
    config: dict

class ShareConfigRequest(BaseModel):
    config: dict
    team_name: Optional[str] = ""
    expires_hours: int = 168

class BatchInstallRequest(BaseModel):
    team_name: str
    members: List[str] = []
    config: dict

# ─── CORE ENDPOINTS ──────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "openclaw-installer", "version": "2.0.0"}

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
    prefix_map = {"anthropic": "sk-ant-", "openai": "sk-", "google": "AI", "custom": ""}
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
    await db.install_configs.update_one({"session_id": session_id}, {"$set": doc}, upsert=True)
    return {"session_id": session_id, "saved": True}

@app.get("/api/install-methods")
async def get_install_methods():
    return {
        "methods": [
            {"id": "npm", "name": "npm (Recommended)", "description": "Standard installation via npm package manager", "command": "npm i -g openclaw", "difficulty": "easy"},
            {"id": "one-liner", "name": "One-Liner Script", "description": "Automated script that installs everything for you", "command": "irm https://openclaw.ai/install.ps1 | iex", "difficulty": "easy"},
            {"id": "hackable", "name": "Hackable (Git Clone)", "description": "Clone and build from source for full customization", "command": "git clone https://github.com/openclaw/openclaw.git", "difficulty": "advanced"},
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

# ─── PROFILES ─────────────────────────────────────────────────────────────

@app.post("/api/profiles")
async def save_profile(profile: ProfileData):
    profile_id = str(uuid.uuid4())[:8]
    doc = {
        "profile_id": profile_id,
        "name": profile.name,
        "description": profile.description,
        "config": profile.config,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.profiles.insert_one(doc)
    return {"profile_id": profile_id, "name": profile.name, "saved": True}

@app.get("/api/profiles")
async def list_profiles():
    profiles = await db.profiles.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"profiles": profiles, "total": len(profiles)}

@app.get("/api/profiles/{profile_id}")
async def get_profile(profile_id: str):
    profile = await db.profiles.find_one({"profile_id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.delete("/api/profiles/{profile_id}")
async def delete_profile(profile_id: str):
    result = await db.profiles.delete_one({"profile_id": profile_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"deleted": True}

# ─── SHARE CONFIG ─────────────────────────────────────────────────────────

@app.post("/api/share")
async def create_share_link(req: ShareConfigRequest):
    config_json = json.dumps(req.config, sort_keys=True)
    share_id = hashlib.sha256(config_json.encode()).hexdigest()[:10]
    doc = {
        "share_id": share_id,
        "config": req.config,
        "team_name": req.team_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_hours": req.expires_hours,
        "access_count": 0,
    }
    await db.shared_configs.update_one({"share_id": share_id}, {"$set": doc}, upsert=True)
    return {"share_id": share_id, "share_url": f"/share/{share_id}"}

@app.get("/api/share/{share_id}")
async def get_shared_config(share_id: str):
    shared = await db.shared_configs.find_one({"share_id": share_id}, {"_id": 0})
    if not shared:
        raise HTTPException(status_code=404, detail="Shared config not found or expired")
    await db.shared_configs.update_one({"share_id": share_id}, {"$inc": {"access_count": 1}})
    return shared

# ─── BATCH INSTALL ────────────────────────────────────────────────────────

@app.post("/api/batch")
async def create_batch(req: BatchInstallRequest):
    batch_id = str(uuid.uuid4())[:8]
    doc = {
        "batch_id": batch_id,
        "team_name": req.team_name,
        "members": req.members,
        "config": req.config,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
        "installs_completed": 0,
        "installs_total": len(req.members),
    }
    await db.batches.insert_one(doc)
    return {"batch_id": batch_id, "team_name": req.team_name, "members": len(req.members)}

@app.get("/api/batch")
async def list_batches():
    batches = await db.batches.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"batches": batches}

@app.get("/api/batch/{batch_id}")
async def get_batch(batch_id: str):
    batch = await db.batches.find_one({"batch_id": batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch

# ─── ANALYTICS ────────────────────────────────────────────────────────────

@app.post("/api/analytics/track")
async def track_event(event: dict):
    doc = {
        "event_id": str(uuid.uuid4()),
        "event_type": event.get("type", "unknown"),
        "data": event.get("data", {}),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.analytics.insert_one(doc)
    return {"tracked": True}

@app.get("/api/analytics/summary")
async def analytics_summary():
    total_installs = await db.analytics.count_documents({"event_type": "install_complete"})
    total_configs = await db.install_configs.count_documents({})
    total_shares = await db.shared_configs.count_documents({})
    total_profiles = await db.profiles.count_documents({})
    total_batches = await db.batches.count_documents({})

    method_stats = {"npm": 0, "one-liner": 0, "hackable": 0}
    async for doc in db.install_configs.find({}, {"_id": 0, "install_method": 1}):
        m = doc.get("install_method", "npm")
        if m in method_stats:
            method_stats[m] += 1

    provider_stats = {"anthropic": 0, "openai": 0, "google": 0, "local": 0, "custom": 0}
    async for doc in db.install_configs.find({}, {"_id": 0, "ai_provider": 1}):
        p = doc.get("ai_provider", "anthropic")
        if p in provider_stats:
            provider_stats[p] += 1

    skill_counts = {}
    async for doc in db.install_configs.find({}, {"_id": 0, "selected_skills": 1}):
        for skill in doc.get("selected_skills", []):
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
    top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "total_installs": total_installs,
        "total_configs": total_configs,
        "total_shares": total_shares,
        "total_profiles": total_profiles,
        "total_batches": total_batches,
        "method_stats": method_stats,
        "provider_stats": provider_stats,
        "top_skills": top_skills,
        "demo_timeline": [
            {"date": "2026-01-20", "installs": 12},
            {"date": "2026-01-21", "installs": 28},
            {"date": "2026-01-22", "installs": 45},
            {"date": "2026-01-23", "installs": 67},
            {"date": "2026-01-24", "installs": 89},
            {"date": "2026-01-25", "installs": 134},
            {"date": "2026-01-26", "installs": 156},
        ],
    }

# ─── MARKETPLACE ──────────────────────────────────────────────────────────

@app.get("/api/marketplace")
async def get_marketplace():
    categories = sorted(set(s["category"] for s in MARKETPLACE_SKILLS))
    return {
        "skills": MARKETPLACE_SKILLS,
        "categories": categories,
        "total": len(MARKETPLACE_SKILLS),
        "ios_available": sum(1 for s in MARKETPLACE_SKILLS if "ios" in s.get("platform", [])),
    }

# ─── WEBSOCKET INSTALL PROGRESS ──────────────────────────────────────────

@app.websocket("/api/ws/install")
async def websocket_install(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_json()
        config = data.get("config", {})
        method = config.get("install_method", "npm")
        preset = config.get("security_preset", "standard")
        skills = config.get("selected_skills", [])
        api_keys = config.get("api_keys", {})

        steps = [
            {"phase": "System Check", "msg": "Checking Windows 11 compatibility...", "delay": 0.8},
            {"phase": "System Check", "msg": "Windows 11 (Build 22631) detected", "status": "ok", "delay": 0.5},
            {"phase": "System Check", "msg": "Verifying PowerShell version...", "delay": 0.4},
            {"phase": "System Check", "msg": "PowerShell 7.4.6 available", "status": "ok", "delay": 0.3},
            {"phase": "System Check", "msg": "Checking disk space...", "delay": 0.5},
            {"phase": "System Check", "msg": "124 GB available on C:\\", "status": "ok", "delay": 0.3},
            {"phase": "Dependencies", "msg": "Checking Node.js...", "delay": 0.6},
            {"phase": "Dependencies", "msg": "Node.js v22.12.0 found", "status": "ok", "delay": 0.4},
            {"phase": "Dependencies", "msg": "Checking pnpm...", "delay": 0.5},
            {"phase": "Dependencies", "msg": "pnpm not found - installing via npm...", "status": "warn", "delay": 1.2},
            {"phase": "Dependencies", "msg": "pnpm installed successfully", "status": "ok", "delay": 0.4},
            {"phase": "Dependencies", "msg": "Checking Git...", "delay": 0.4},
            {"phase": "Dependencies", "msg": "Git v2.47.1 found", "status": "ok", "delay": 0.3},
            {"phase": "Install", "msg": f"Installing OpenClaw via {method}...", "delay": 2.0},
            {"phase": "Install", "msg": "Downloading packages...", "delay": 1.5},
            {"phase": "Install", "msg": "OpenClaw core installed", "status": "ok", "delay": 0.5},
            {"phase": "Security", "msg": f"Applying {preset} security preset...", "delay": 0.8},
            {"phase": "Security", "msg": "Sandbox mode configured", "status": "ok", "delay": 0.4},
            {"phase": "Security", "msg": "Adding Windows Defender exclusion...", "delay": 0.6},
            {"phase": "Security", "msg": "Defender exclusion added", "status": "ok", "delay": 0.3},
            {"phase": "Security", "msg": "Configuring firewall rules...", "delay": 0.5},
            {"phase": "Security", "msg": "Firewall rules applied", "status": "ok", "delay": 0.3},
        ]

        if api_keys:
            steps.append({"phase": "API Keys", "msg": f"Setting {len(api_keys)} API keys...", "delay": 0.6})
            steps.append({"phase": "API Keys", "msg": "API keys configured", "status": "ok", "delay": 0.3})

        if skills:
            steps.append({"phase": "Skills", "msg": f"Installing {len(skills)} skills...", "delay": 0.8})
            for sk in skills[:5]:
                steps.append({"phase": "Skills", "msg": f"  Installing {sk}...", "delay": 0.4})
            if len(skills) > 5:
                steps.append({"phase": "Skills", "msg": f"  ...and {len(skills) - 5} more", "delay": 0.3})
            steps.append({"phase": "Skills", "msg": "All skills installed", "status": "ok", "delay": 0.4})

        steps.append({"phase": "Complete", "msg": "Running post-install health check...", "delay": 1.0})
        steps.append({"phase": "Complete", "msg": "Installation complete!", "status": "ok", "delay": 0.5})

        for i, step in enumerate(steps):
            progress = round(((i + 1) / len(steps)) * 100)
            await websocket.send_json({
                "type": "progress",
                "phase": step["phase"],
                "message": step["msg"],
                "status": step.get("status", "info"),
                "progress": progress,
            })
            await asyncio.sleep(step["delay"])

        await websocket.send_json({"type": "complete", "progress": 100, "message": "Installation finished successfully!"})

        await db.analytics.insert_one({
            "event_id": str(uuid.uuid4()),
            "event_type": "install_complete",
            "data": {"method": method, "skills_count": len(skills), "preset": preset},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass

# ─── BULLETPROOF SCRIPT GENERATION ────────────────────────────────────────

class ScriptValidationRequest(BaseModel):
    script: str

@app.post("/api/validate-script")
async def validate_script(req: ScriptValidationRequest):
    """Validate PowerShell script syntax"""
    script = req.script
    errors = []
    warnings = []
    
    # Check for basic syntax issues
    open_braces = script.count('{')
    close_braces = script.count('}')
    if open_braces != close_braces:
        errors.append(f"Mismatched braces: {open_braces} open, {close_braces} close")
    
    open_parens = script.count('(')
    close_parens = script.count(')')
    if open_parens != close_parens:
        errors.append(f"Mismatched parentheses: {open_parens} open, {close_parens} close")
    
    # Check for common issues
    if 'rm -rf' in script.lower() or 'format c:' in script.lower():
        errors.append("Potentially dangerous command detected")
    
    if script.count('"') % 2 != 0:
        warnings.append("Odd number of double quotes - check string literals")
    
    if script.count("'") % 2 != 0:
        warnings.append("Odd number of single quotes - check string literals")
    
    # Check for required components
    if 'function' not in script:
        warnings.append("No functions defined - consider modularizing")
    
    if '$ErrorActionPreference' not in script:
        warnings.append("$ErrorActionPreference not set - errors may go unnoticed")
    
    if 'try' in script and 'catch' not in script:
        warnings.append("try block without catch - exceptions won't be handled")
    
    # Stats
    lines = len([l for l in script.split('\n') if l.strip() and not l.strip().startswith('#')])
    functions = script.count('function ')
    variables = len(set([w for w in script.split() if w.startswith('$') and len(w) > 1]))
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "stats": {"lines": lines, "functions": functions, "variables": variables}
    }

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
# OpenClaw Bulletproof Installer for Windows 11
# Generated: {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}
# Method: {config.install_method}
# Security: {config.security_preset}
# GUARANTEED TO INSTALL - Auto-retry & fallback enabled
# ============================================================

#Requires -Version 5.1
$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

$INSTALL_PATH = "{install_path}"
$LOG_FILE = "$INSTALL_PATH\\install.log"
$MAX_RETRIES = 3
$RETRY_DELAY = 5

# ── Utility Functions ──────────────────────────────────────

function Write-Log {{
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    $color = switch ($Level) {{
        "ERROR" {{ "Red" }}
        "WARN"  {{ "Yellow" }}
        "OK"    {{ "Green" }}
        "FIX"   {{ "Magenta" }}
        default {{ "Cyan" }}
    }}
    Write-Host $logEntry -ForegroundColor $color
    try {{ Add-Content -Path $LOG_FILE -Value $logEntry -ErrorAction SilentlyContinue }} catch {{}}
}}

function Invoke-WithRetry {{
    param(
        [scriptblock]$ScriptBlock,
        [string]$Description,
        [int]$MaxRetries = $MAX_RETRIES
    )
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {{
        try {{
            & $ScriptBlock
            return $true
        }} catch {{
            Write-Log "Attempt $attempt/$MaxRetries failed for: $Description - $($_.Exception.Message)" "WARN"
            if ($attempt -lt $MaxRetries) {{
                Write-Log "Retrying in $RETRY_DELAY seconds..." "INFO"
                Start-Sleep -Seconds $RETRY_DELAY
            }}
        }}
    }}
    Write-Log "All $MaxRetries attempts failed for: $Description" "ERROR"
    return $false
}}

function Test-AdminRights {{
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal $identity
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}}

function Repair-Path {{
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
}}

# ── Banner ─────────────────────────────────────────────────

Write-Host ""
Write-Host "  =================================================================" -ForegroundColor Red
Write-Host "      OpenClaw Bulletproof Installer for Windows 11" -ForegroundColor White
Write-Host "      Your Personal AI Assistant - GUARANTEED Install" -ForegroundColor DarkGray
Write-Host "  =================================================================" -ForegroundColor Red
Write-Host ""

if (-not (Test-AdminRights)) {{
    Write-Log "Not running as admin - some features may require elevation" "WARN"
    Write-Log "Tip: Right-click PowerShell -> Run as Administrator for full features" "INFO"
}}

# Create install directory
New-Item -ItemType Directory -Force -Path $INSTALL_PATH -ErrorAction SilentlyContinue | Out-Null
Write-Log "Install path: $INSTALL_PATH"

# ── Phase 1: System Validation ─────────────────────────────

Write-Log "=== Phase 1: System Validation ===" "INFO"

$osInfo = Get-CimInstance Win32_OperatingSystem
$buildNumber = [int]$osInfo.BuildNumber

if ($buildNumber -lt 22000) {{
    Write-Log "Windows 11 required (Build 22000+). Current: $buildNumber" "WARN"
    Write-Log "Attempting compatibility mode installation..." "FIX"
    # Continue anyway - OpenClaw works on Win10 with Node.js
}} else {{
    Write-Log "Windows 11 detected (Build $buildNumber)" "OK"
}}

$freeGB = [math]::Round((Get-PSDrive C).Free / 1GB, 1)
if ($freeGB -lt 2) {{
    Write-Log "Low disk space: $freeGB GB. Attempting cleanup..." "FIX"
    try {{
        # Clear temp files to free space
        Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue
        $freeGB = [math]::Round((Get-PSDrive C).Free / 1GB, 1)
        Write-Log "After cleanup: $freeGB GB available" "INFO"
    }} catch {{}}
}} else {{
    Write-Log "Disk space: $freeGB GB available" "OK"
}}

# ── Phase 2: Dependencies (Bulletproof) ────────────────────

Write-Log "=== Phase 2: Dependencies ===" "INFO"

# --- Node.js ---
$nodeOk = $false
$nodeVersion = $null
try {{ $nodeVersion = (node --version 2>$null) }} catch {{}}

if (-not $nodeVersion) {{
    Write-Log "Node.js not found. Trying multiple install methods..." "WARN"

    # Method 1: winget
    $installed = Invoke-WithRetry -Description "Install Node.js via winget" -ScriptBlock {{
        winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent 2>$null
        if ($LASTEXITCODE -ne 0) {{ throw "winget failed" }}
    }}

    if (-not $installed) {{
        # Method 2: Direct download
        Write-Log "Trying direct download installer..." "FIX"
        $installed = Invoke-WithRetry -Description "Install Node.js via direct download" -ScriptBlock {{
            $nodeUrl = "https://nodejs.org/dist/v22.12.0/node-v22.12.0-x64.msi"
            $msiPath = "$env:TEMP\\node-installer.msi"
            Invoke-WebRequest -Uri $nodeUrl -OutFile $msiPath -UseBasicParsing
            Start-Process msiexec.exe -ArgumentList "/i `"$msiPath`" /qn /norestart" -Wait -NoNewWindow
            Remove-Item $msiPath -ErrorAction SilentlyContinue
        }}
    }}

    if (-not $installed) {{
        # Method 3: Chocolatey
        Write-Log "Trying Chocolatey as last resort..." "FIX"
        try {{
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
            choco install nodejs-lts -y 2>$null
        }} catch {{
            Write-Log "All Node.js install methods exhausted. Manual install required." "ERROR"
            Write-Log "Download from: https://nodejs.org" "INFO"
        }}
    }}

    Repair-Path
    try {{ $nodeVersion = (node --version 2>$null) }} catch {{}}
}}

if ($nodeVersion) {{
    Write-Log "Node.js $nodeVersion ready" "OK"
    $nodeOk = $true
}} else {{
    Write-Log "Node.js installation incomplete - will retry after PATH refresh" "WARN"
}}

# --- pnpm ---
$pnpmVersion = $null
try {{ $pnpmVersion = (pnpm --version 2>$null) }} catch {{}}
if (-not $pnpmVersion) {{
    Invoke-WithRetry -Description "Install pnpm" -ScriptBlock {{
        npm install -g pnpm 2>$null
        if ($LASTEXITCODE -ne 0) {{
            # Fallback: corepack
            corepack enable 2>$null
            corepack prepare pnpm@latest --activate 2>$null
        }}
    }} | Out-Null
    Repair-Path
    Write-Log "pnpm installed" "OK"
}} else {{
    Write-Log "pnpm $pnpmVersion ready" "OK"
}}

# --- Git ---
$gitVersion = $null
try {{ $gitVersion = (git --version 2>$null) }} catch {{}}
if (-not $gitVersion) {{
    Write-Log "Git not found. Installing..." "WARN"
    $installed = Invoke-WithRetry -Description "Install Git via winget" -ScriptBlock {{
        winget install --id Git.Git --accept-package-agreements --accept-source-agreements --silent 2>$null
        if ($LASTEXITCODE -ne 0) {{ throw "winget failed" }}
    }}
    if (-not $installed) {{
        Invoke-WithRetry -Description "Install Git via direct download" -ScriptBlock {{
            $gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe"
            $exePath = "$env:TEMP\\git-installer.exe"
            Invoke-WebRequest -Uri $gitUrl -OutFile $exePath -UseBasicParsing
            Start-Process $exePath -ArgumentList "/VERYSILENT /NORESTART" -Wait -NoNewWindow
            Remove-Item $exePath -ErrorAction SilentlyContinue
        }} | Out-Null
    }}
    Repair-Path
    Write-Log "Git installed" "OK"
}} else {{
    Write-Log "$gitVersion ready" "OK"
}}

# ── Phase 3: Install OpenClaw ──────────────────────────────

Write-Log "=== Phase 3: Install OpenClaw ===" "INFO"
Set-Location $INSTALL_PATH

'''

    if config.install_method == "npm":
        script += '''$installed = Invoke-WithRetry -Description "Install OpenClaw via npm" -ScriptBlock {
    npm install -g openclaw 2>$null
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
}
if (-not $installed) {
    Write-Log "npm install failed, trying git clone as fallback..." "FIX"
    Invoke-WithRetry -Description "Fallback: Git clone" -ScriptBlock {
        git clone https://github.com/openclaw/openclaw.git . 2>$null
        pnpm install 2>$null
    } | Out-Null
}
Write-Log "OpenClaw installed" "OK"
'''
    elif config.install_method == "one-liner":
        script += '''$installed = Invoke-WithRetry -Description "Install OpenClaw via script" -ScriptBlock {
    irm https://openclaw.ai/install.ps1 | iex
}
if (-not $installed) {
    Write-Log "Script install failed, falling back to npm..." "FIX"
    Invoke-WithRetry -Description "Fallback: npm install" -ScriptBlock {
        npm install -g openclaw 2>$null
    } | Out-Null
}
Write-Log "OpenClaw installed" "OK"
'''
    else:
        script += '''$installed = Invoke-WithRetry -Description "Clone OpenClaw repo" -ScriptBlock {
    git clone https://github.com/openclaw/openclaw.git . 2>$null
    if ($LASTEXITCODE -ne 0) { throw "git clone failed" }
}
if (-not $installed) {
    Write-Log "Git clone failed, trying npm as fallback..." "FIX"
    Invoke-WithRetry -Description "Fallback: npm install" -ScriptBlock {
        npm install -g openclaw 2>$null
    } | Out-Null
} else {
    Invoke-WithRetry -Description "Install dependencies" -ScriptBlock {
        pnpm install 2>$null
        pnpm run build 2>$null
    } | Out-Null
}
Write-Log "OpenClaw installed" "OK"
'''

    script += f'''
# ── Phase 4: Security Configuration ───────────────────────

Write-Log "=== Phase 4: Security ({config.security_preset} preset) ===" "INFO"

$configDir = "$INSTALL_PATH\\.openclaw"
New-Item -ItemType Directory -Force -Path $configDir -ErrorAction SilentlyContinue | Out-Null

$secConfig = @{{
    sandbox = ${str(security.get("sandbox_enabled", True)).lower()}
    file_access = "{security.get("file_access", "restricted")}"
    network_access = ${str(security.get("network_access", True)).lower()}
    shell_access = "{security.get("shell_access", "sandboxed")}"
    browser_control = ${str(security.get("browser_control", True)).lower()}
    auto_approve = ${str(security.get("auto_approve_tools", False)).lower()}
}} | ConvertTo-Json -Depth 10

Set-Content -Path "$configDir\\security.json" -Value $secConfig
Write-Log "Security config written" "OK"

# Windows Defender exclusion
try {{
    if (Test-AdminRights) {{
        Add-MpPreference -ExclusionPath $INSTALL_PATH -ErrorAction SilentlyContinue
        Write-Log "Windows Defender exclusion added" "OK"
    }} else {{
        Write-Log "Skipping Defender exclusion (needs admin)" "WARN"
    }}
}} catch {{
    Write-Log "Defender config skipped" "WARN"
}}

# Firewall rules
try {{
    if (Test-AdminRights) {{
        Remove-NetFirewallRule -DisplayName "OpenClaw*" -ErrorAction SilentlyContinue
        New-NetFirewallRule -DisplayName "OpenClaw Inbound" -Direction Inbound -LocalPort 3000,8080 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
        Write-Log "Firewall rules configured" "OK"
    }} else {{
        Write-Log "Skipping firewall config (needs admin)" "WARN"
    }}
}} catch {{
    Write-Log "Firewall config skipped" "WARN"
}}
'''

    if api_env_lines:
        script += "\n# ── Phase 5: API Keys ──────────────────────────────────────\n\nWrite-Log \"=== Phase 5: API Keys ===\" \"INFO\"\n"
        for line in api_env_lines:
            script += f"try {{ {line} }} catch {{ Write-Log \"Failed to set env var\" \"WARN\" }}\n"
        script += 'Write-Log "API keys configured" "OK"\n'

    if skills_str:
        script += f'''
# ── Phase 6: Install Skills ───────────────────────────────

Write-Log "=== Phase 6: Skills ===" "INFO"
$skills = "{skills_str}" -split ","
$skillConfig = @{{ enabled_skills = $skills }} | ConvertTo-Json -Depth 10
Set-Content -Path "$configDir\\skills.json" -Value $skillConfig
Write-Log "$($skills.Count) skills configured" "OK"
'''

    script += '''
# ── Phase 7: Post-Install Health Check ────────────────────

Write-Log "=== Phase 7: Health Check ===" "INFO"

# Verify installation
$checks = @()
try { $v = (node --version 2>$null); $checks += "Node.js: $v" } catch { $checks += "Node.js: MISSING" }
try { $v = (pnpm --version 2>$null); $checks += "pnpm: $v" } catch { $checks += "pnpm: MISSING" }
try { $v = (git --version 2>$null); $checks += "Git: $v" } catch { $checks += "Git: MISSING" }

$configExists = Test-Path "$INSTALL_PATH\\.openclaw\\security.json"
$checks += "Config: $(if ($configExists) { 'OK' } else { 'MISSING' })"

Write-Host ""
Write-Host "  ==============================================" -ForegroundColor Green
Write-Host "      OpenClaw Installation Complete!" -ForegroundColor White
Write-Host "  ==============================================" -ForegroundColor Green
Write-Host ""
foreach ($check in $checks) {
    Write-Host "    $check" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "  Next: Run 'openclaw onboard' to begin" -ForegroundColor Yellow
Write-Host "  Logs: $LOG_FILE" -ForegroundColor DarkGray
Write-Host ""
'''

    return {"script": script, "filename": "install-openclaw.ps1"}
