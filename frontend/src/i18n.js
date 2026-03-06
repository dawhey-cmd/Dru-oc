// Simple i18n system for OpenClaw Installer
const translations = {
  en: {
    // Navigation
    'nav.welcome': 'Welcome',
    'nav.system': 'System Check',
    'nav.config': 'Configuration',
    'nav.apiKeys': 'API Keys',
    'nav.security': 'Security',
    'nav.skills': 'Skills',
    'nav.review': 'Review & Install',
    'nav.profiles': 'Profiles',
    'nav.share': 'Share Config',
    'nav.marketplace': 'Marketplace',
    'nav.analytics': 'Analytics',
    'nav.desktop': 'Desktop App',
    
    // Welcome Page
    'welcome.title': 'OpenClaw Installer',
    'welcome.subtitle': 'Your personal AI assistant, ready to deploy on Windows 11. This wizard will guide you through dependency checks, configuration, security setup, and skill installation.',
    'welcome.feature1.title': 'Auto-Detect Dependencies',
    'welcome.feature1.desc': 'Scans your system for Node.js, pnpm, Git and fixes missing packages',
    'welcome.feature2.title': '50+ Skills Available',
    'welcome.feature2.desc': 'GitHub, Slack, Discord, coding agent, image gen, and more',
    'welcome.feature3.title': 'Multiple Install Methods',
    'welcome.feature3.desc': 'npm, one-liner, or clone from source for full control',
    'welcome.win11': 'Windows 11 Required',
    'welcome.win11.desc': 'This installer targets Windows 11 (Build 22000+). System checks will verify compatibility.',
    'welcome.begin': 'Begin Setup',
    
    // Review Page
    'review.title': 'Review & Install',
    'review.subtitle': 'Review your configuration, generate the bulletproof install script, and run the installer',
    'review.generateScript': 'Generate Script',
    'review.saveConfig': 'Save Configuration',
    'review.liveInstall': 'Live Install Simulation',
    'review.quickTest': 'Quick Test',
    'review.download': 'Download .ps1',
    'review.copy': 'Copy',
    'review.copied': 'Copied!',
    'review.bulletproof': 'Bulletproof Install Mode',
    'review.bulletproofDesc': 'Auto-retry (3 attempts), fallback installers (winget, direct download, Chocolatey), PATH repair, and error recovery built-in. Your install WILL succeed.',
    
    // Common
    'common.back': 'Back',
    'common.next': 'Next',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  
  es: {
    'nav.welcome': 'Bienvenida',
    'nav.system': 'Verificación',
    'nav.config': 'Configuración',
    'nav.apiKeys': 'Claves API',
    'nav.security': 'Seguridad',
    'nav.skills': 'Habilidades',
    'nav.review': 'Revisar e Instalar',
    'nav.profiles': 'Perfiles',
    'nav.share': 'Compartir Config',
    'nav.marketplace': 'Mercado',
    'nav.analytics': 'Analíticas',
    'nav.desktop': 'App de Escritorio',
    
    'welcome.title': 'Instalador OpenClaw',
    'welcome.subtitle': 'Tu asistente de IA personal, listo para implementar en Windows 11. Este asistente te guiará a través de verificaciones de dependencias, configuración, seguridad e instalación de habilidades.',
    'welcome.feature1.title': 'Detección Automática',
    'welcome.feature1.desc': 'Escanea tu sistema para Node.js, pnpm, Git y arregla paquetes faltantes',
    'welcome.feature2.title': '50+ Habilidades',
    'welcome.feature2.desc': 'GitHub, Slack, Discord, agente de código, generación de imágenes y más',
    'welcome.feature3.title': 'Múltiples Métodos',
    'welcome.feature3.desc': 'npm, script de una línea, o clonar desde fuente para control total',
    'welcome.win11': 'Windows 11 Requerido',
    'welcome.win11.desc': 'Este instalador es para Windows 11 (Build 22000+). Las verificaciones del sistema confirmarán compatibilidad.',
    'welcome.begin': 'Comenzar',
    
    'review.title': 'Revisar e Instalar',
    'review.subtitle': 'Revisa tu configuración, genera el script de instalación y ejecuta el instalador',
    'review.generateScript': 'Generar Script',
    'review.saveConfig': 'Guardar Configuración',
    'review.liveInstall': 'Simulación de Instalación',
    'review.quickTest': 'Prueba Rápida',
    'review.download': 'Descargar .ps1',
    'review.copy': 'Copiar',
    'review.copied': '¡Copiado!',
    'review.bulletproof': 'Modo Instalación Infalible',
    'review.bulletproofDesc': 'Reintentos automáticos (3 intentos), instaladores alternativos, reparación de PATH y recuperación de errores incluidos.',
    
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
  },
  
  zh: {
    'nav.welcome': '欢迎',
    'nav.system': '系统检查',
    'nav.config': '配置',
    'nav.apiKeys': 'API密钥',
    'nav.security': '安全',
    'nav.skills': '技能',
    'nav.review': '审核和安装',
    'nav.profiles': '配置文件',
    'nav.share': '分享配置',
    'nav.marketplace': '市场',
    'nav.analytics': '分析',
    'nav.desktop': '桌面应用',
    
    'welcome.title': 'OpenClaw 安装程序',
    'welcome.subtitle': '您的个人AI助手，准备在Windows 11上部署。此向导将引导您完成依赖项检查、配置、安全设置和技能安装。',
    'welcome.feature1.title': '自动检测依赖',
    'welcome.feature1.desc': '扫描您的系统中的Node.js、pnpm、Git并修复缺失的包',
    'welcome.feature2.title': '50+技能可用',
    'welcome.feature2.desc': 'GitHub、Slack、Discord、编码代理、图像生成等',
    'welcome.feature3.title': '多种安装方法',
    'welcome.feature3.desc': 'npm、一键脚本或从源代码克隆以完全控制',
    'welcome.win11': '需要Windows 11',
    'welcome.win11.desc': '此安装程序针对Windows 11（Build 22000+）。系统检查将验证兼容性。',
    'welcome.begin': '开始设置',
    
    'review.title': '审核和安装',
    'review.subtitle': '审核您的配置，生成防弹安装脚本，并运行安装程序',
    'review.generateScript': '生成脚本',
    'review.saveConfig': '保存配置',
    'review.liveInstall': '实时安装模拟',
    'review.quickTest': '快速测试',
    'review.download': '下载 .ps1',
    'review.copy': '复制',
    'review.copied': '已复制！',
    'review.bulletproof': '防弹安装模式',
    'review.bulletproofDesc': '自动重试（3次尝试）、备用安装程序、PATH修复和内置错误恢复。',
    
    'common.back': '返回',
    'common.next': '下一步',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.export': '导出',
    'common.import': '导入',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
  },
  
  ja: {
    'nav.welcome': 'ようこそ',
    'nav.system': 'システムチェック',
    'nav.config': '設定',
    'nav.apiKeys': 'APIキー',
    'nav.security': 'セキュリティ',
    'nav.skills': 'スキル',
    'nav.review': 'レビュー＆インストール',
    'nav.profiles': 'プロファイル',
    'nav.share': '設定を共有',
    'nav.marketplace': 'マーケットプレイス',
    'nav.analytics': 'アナリティクス',
    'nav.desktop': 'デスクトップアプリ',
    
    'welcome.title': 'OpenClaw インストーラー',
    'welcome.subtitle': 'Windows 11に展開する準備ができた個人AIアシスタント。このウィザードで依存関係のチェック、設定、セキュリティ設定、スキルのインストールをガイドします。',
    'welcome.begin': 'セットアップを開始',
    
    'review.title': 'レビュー＆インストール',
    'review.generateScript': 'スクリプト生成',
    'review.quickTest': 'クイックテスト',
    'review.download': 'ダウンロード .ps1',
    
    'common.back': '戻る',
    'common.next': '次へ',
    'common.save': '保存',
  },
  
  de: {
    'nav.welcome': 'Willkommen',
    'nav.system': 'Systemprüfung',
    'nav.config': 'Konfiguration',
    'nav.apiKeys': 'API-Schlüssel',
    'nav.security': 'Sicherheit',
    'nav.skills': 'Fähigkeiten',
    'nav.review': 'Überprüfen & Installieren',
    'nav.profiles': 'Profile',
    'nav.share': 'Konfig teilen',
    'nav.marketplace': 'Marktplatz',
    'nav.analytics': 'Analysen',
    'nav.desktop': 'Desktop-App',
    
    'welcome.title': 'OpenClaw Installer',
    'welcome.subtitle': 'Ihr persönlicher KI-Assistent, bereit für die Bereitstellung unter Windows 11.',
    'welcome.begin': 'Setup starten',
    
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.save': 'Speichern',
  },

  fr: {
    'nav.welcome': 'Bienvenue',
    'nav.system': 'Vérification',
    'nav.config': 'Configuration',
    'nav.apiKeys': 'Clés API',
    'nav.security': 'Sécurité',
    'nav.skills': 'Compétences',
    'nav.review': 'Réviser et Installer',
    'nav.profiles': 'Profils',
    'nav.share': 'Partager Config',
    'nav.marketplace': 'Marché',
    'nav.analytics': 'Analyses',
    'nav.desktop': 'App Bureau',
    
    'welcome.title': 'Installateur OpenClaw',
    'welcome.subtitle': 'Votre assistant IA personnel, prêt à être déployé sur Windows 11.',
    'welcome.begin': 'Commencer',
    
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.save': 'Enregistrer',
  },
};

// Get browser language
const getBrowserLanguage = () => {
  const lang = navigator.language.split('-')[0];
  return translations[lang] ? lang : 'en';
};

// Translation function
export const t = (key, lang = null) => {
  const currentLang = lang || getBrowserLanguage();
  return translations[currentLang]?.[key] || translations['en']?.[key] || key;
};

// Get all available languages
export const getLanguages = () => [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

// Export translations for reference
export default translations;
