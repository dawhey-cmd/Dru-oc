import React from 'react';
import { ArrowRight, Terminal, Package, GitBranch } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

function WelcomePage({ goNext }) {
  const { t } = useI18n();

  const checklist = [
    t('welcome.check1'), t('welcome.check2'), t('welcome.check3'), t('welcome.check4'),
    t('welcome.check5'), t('welcome.check6'), t('welcome.check7'), t('welcome.check8'),
  ];

  return (
    <div data-testid="welcome-page">
      <div className="step-header">
        <h1 style={{ fontSize: '2.4rem' }}>
          <span style={{ marginRight: 12 }}>&#129438;</span>
          {t('welcome.title')}
        </h1>
        <p style={{ maxWidth: 560, marginTop: 12 }}>{t('welcome.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 32 }}>
        <FeatureCard icon={<Terminal size={20} />} title={t('welcome.feature1.title')} desc={t('welcome.feature1.desc')} testId="feature-dependencies" />
        <FeatureCard icon={<Package size={20} />} title={t('welcome.feature2.title')} desc={t('welcome.feature2.desc')} testId="feature-skills" />
        <FeatureCard icon={<GitBranch size={20} />} title={t('welcome.feature3.title')} desc={t('welcome.feature3.desc')} testId="feature-methods" />
      </div>

      <div className="panel" style={{ marginTop: 32, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(255,45,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>&#9888;&#65039;</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#FFD54F', fontSize: '0.9rem' }}>{t('welcome.win11')}</div>
          <div style={{ fontSize: '0.82rem', color: '#8892A8', marginTop: 2 }}>{t('welcome.win11.desc')}</div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16, padding: 20 }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: 12 }}>{t('welcome.whatItDoes')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {checklist.map((item, i) => (
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
          {t('welcome.begin')} <ArrowRight size={16} />
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
