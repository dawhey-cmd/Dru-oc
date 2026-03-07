import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { I18nProvider } from './context/I18nContext';
import { TelemetryProvider } from './context/TelemetryContext';
import Sidebar from './components/Sidebar';
import WelcomePage from './components/WelcomePage';
import SystemCheckPage from './components/SystemCheckPage';
import InstallConfigPage from './components/InstallConfigPage';
import ApiKeysPage from './components/ApiKeysPage';
import SecurityPage from './components/SecurityPage';
import SkillsPage from './components/SkillsPage';
import ReviewPage from './components/ReviewPage';
import ProfilesPage from './components/ProfilesPage';
import ShareConfigPage from './components/ShareConfigPage';
import AnalyticsPage from './components/AnalyticsPage';
import MarketplacePage from './components/MarketplacePage';
import DesktopAppPage from './components/DesktopAppPage';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: 'home', section: 'wizard' },
  { id: 'system', label: 'System Check', icon: 'scan', section: 'wizard' },
  { id: 'config', label: 'Configuration', icon: 'settings', section: 'wizard' },
  { id: 'api-keys', label: 'API Keys', icon: 'key', section: 'wizard' },
  { id: 'security', label: 'Security', icon: 'shield', section: 'wizard' },
  { id: 'skills', label: 'Skills', icon: 'zap', section: 'wizard' },
  { id: 'review', label: 'Review & Install', icon: 'rocket', section: 'wizard' },
  { id: 'divider', label: '', icon: '', section: 'divider' },
  { id: 'profiles', label: 'Profiles', icon: 'save', section: 'tools' },
  { id: 'share', label: 'Share Config', icon: 'share', section: 'tools' },
  { id: 'marketplace', label: 'Marketplace', icon: 'store', section: 'tools' },
  { id: 'analytics', label: 'Analytics', icon: 'chart', section: 'tools' },
  { id: 'desktop', label: 'Desktop App', icon: 'monitor', section: 'tools' },
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState({
    install_method: 'npm',
    install_path: 'C:\\Users\\%USERNAME%\\.openclaw',
    api_keys: {},
    security_preset: 'standard',
    security_custom: {},
    selected_skills: [],
    ai_provider: 'anthropic',
    model_name: 'claude-sonnet-4-5-20250514',
  });
  const [systemChecks, setSystemChecks] = useState(null);
  const [skills, setSkills] = useState([]);
  const [installMethods, setInstallMethods] = useState([]);
  const [aiProviders, setAiProviders] = useState([]);
  const [securityPresets, setSecurityPresets] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const [skillsRes, methodsRes, providersRes, secRes] = await Promise.all([
        fetch(`${API_URL}/api/skills`),
        fetch(`${API_URL}/api/install-methods`),
        fetch(`${API_URL}/api/ai-providers`),
        fetch(`${API_URL}/api/security-presets`),
      ]);
      const [skillsData, methodsData, providersData, secData] = await Promise.all([
        skillsRes.json(), methodsRes.json(), providersRes.json(), secRes.json(),
      ]);
      setSkills(skillsData.skills || []);
      setInstallMethods(methodsData.methods || []);
      setAiProviders(providersData.providers || []);
      setSecurityPresets(secData.presets || {});
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const setFullConfig = (newConfig) => setConfig(newConfig);

  const goNext = () => {
    let next = currentStep + 1;
    while (next < STEPS.length && STEPS[next].section === 'divider') next++;
    setCurrentStep(Math.min(next, STEPS.length - 1));
  };
  const goPrev = () => {
    let prev = currentStep - 1;
    while (prev >= 0 && STEPS[prev].section === 'divider') prev--;
    setCurrentStep(Math.max(prev, 0));
  };

  const renderStep = () => {
    const props = { config, updateConfig, setFullConfig, goNext, goPrev, apiUrl: API_URL };
    switch (STEPS[currentStep]?.id) {
      case 'welcome': return <WelcomePage {...props} />;
      case 'system': return <SystemCheckPage {...props} systemChecks={systemChecks} setSystemChecks={setSystemChecks} />;
      case 'config': return <InstallConfigPage {...props} installMethods={installMethods} aiProviders={aiProviders} />;
      case 'api-keys': return <ApiKeysPage {...props} aiProviders={aiProviders} />;
      case 'security': return <SecurityPage {...props} presets={securityPresets} />;
      case 'skills': return <SkillsPage {...props} skills={skills} />;
      case 'review': return <ReviewPage {...props} skills={skills} />;
      case 'profiles': return <ProfilesPage {...props} />;
      case 'share': return <ShareConfigPage {...props} skills={skills} />;
      case 'marketplace': return <MarketplacePage {...props} />;
      case 'analytics': return <AnalyticsPage {...props} />;
      case 'desktop': return <DesktopAppPage {...props} />;
      default: return null;
    }
  };

  return (
    <I18nProvider>
      <TelemetryProvider>
        <div className="app-shell" data-testid="app-shell">
          <div className="scanline-overlay" />
          <Sidebar steps={STEPS} currentStep={currentStep} setCurrentStep={setCurrentStep} />
          <main className="main-content" data-testid="main-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="step-container"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </TelemetryProvider>
    </I18nProvider>
  );
}

export default App;
