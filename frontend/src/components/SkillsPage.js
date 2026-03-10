import React, { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Search, Check } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

function SkillsPage({ config, updateConfig, goNext, goPrev, skills }) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const { t } = useI18n();

  const categories = useMemo(() => ['All', ...new Set(skills.map(s => s.category))], [skills]);

  const filtered = useMemo(() => {
    return skills.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'All' || s.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [skills, search, filterCategory]);

  const toggleSkill = (skillId) => {
    const selected = config.selected_skills.includes(skillId)
      ? config.selected_skills.filter(id => id !== skillId)
      : [...config.selected_skills, skillId];
    updateConfig('selected_skills', selected);
  };

  const selectPopular = () => updateConfig('selected_skills', skills.filter(s => s.popular).map(s => s.id));
  const clearAll = () => updateConfig('selected_skills', []);

  return (
    <div data-testid="skills-page">
      <div className="step-header">
        <h1>{t('skills.title')}</h1>
        <p>{t('skills.subtitle')}</p>
      </div>

      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5A6480' }} />
          <input type="text" className="input-field" data-testid="skills-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('skills.search')} style={{ paddingLeft: 36 }} />
        </div>
        <button className="btn btn-secondary" data-testid="select-popular-btn" onClick={selectPopular}>{t('skills.selectPopular')}</button>
        <button className="btn btn-ghost" data-testid="clear-skills-btn" onClick={clearAll}>{t('skills.clearAll')}</button>
        <div style={{ fontSize: '0.82rem', color: '#8892A8' }}>
          <span style={{ color: '#FF2D2D', fontWeight: 600 }}>{config.selected_skills.length}</span> {t('skills.selected')}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} data-testid={`category-${cat.toLowerCase().replace(/\s/g, '-')}`} className={`btn ${filterCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCategory(cat)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>{cat}</button>
        ))}
      </div>

      <div className="card-grid" data-testid="skills-grid">
        {filtered.map(skill => {
          const isSelected = config.selected_skills.includes(skill.id);
          return (
            <div key={skill.id} data-testid={`skill-${skill.id}`} className={`skill-card ${isSelected ? 'selected' : ''}`} onClick={() => toggleSkill(skill.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontWeight: 600, color: isSelected ? '#fff' : '#C4CCE0', fontSize: '0.88rem' }}>{skill.name}</div>
                {isSelected && <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FF2D2D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="#fff" /></div>}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6A7490', lineHeight: 1.4, marginBottom: 8 }}>{skill.description}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="tag tag-info">{skill.category}</span>
                {skill.popular && <span className="tag tag-warn">Popular</span>}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#5A6480' }}>{t('skills.noResults')} "{search}"</div>
      )}

      <div className="step-nav">
        <button className="btn btn-ghost" data-testid="skills-back-btn" onClick={goPrev}><ArrowLeft size={16} /> {t('common.back')}</button>
        <button className="btn btn-primary" data-testid="skills-next-btn" onClick={goNext}>{t('common.continue')} <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

export default SkillsPage;
