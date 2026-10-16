import React, { useState, useMemo } from 'react';
import { TEMPLATE_DATA } from '../constants';

interface TemplatesViewProps {
  onSelectTemplate: (templateId: string) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  const [category, setCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(TEMPLATE_DATA.map((t) => t.category)))];
  }, []);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TEMPLATE_DATA.filter((template) => {
      const matchCat = category === 'All' || template.category === category;
      const matchSearch =
        !q || `${template.name} ${template.category}`.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [category, searchQuery]);

  return (
    <section className="view active" id="view-templates" aria-labelledby="templates-heading">
      <div className="page-title-block">
        <span className="eyebrow muted">READY-MADE STARTING POINTS</span>
        <h1 id="templates-heading">Template library</h1>
        <p>Original starter layouts you can customize. These are not Canva or Adobe Express assets.</p>
      </div>

      <div className="template-controls">
        <label className="search-field">
          <span>⌕</span>
          <input
            id="template-search"
            type="search"
            placeholder="Search templates…"
            aria-label="Search templates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <div id="template-filters" className="filter-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div id="template-grid" className="template-grid">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <button
              key={template.id}
              className="template-card"
              onClick={() => onSelectTemplate(template.id)}
            >
              <div
                className="template-thumb"
                style={{ background: template.bg, ['--thumb-accent' as any]: template.accent }}
                aria-hidden="true"
              >
                <span
                  className="thumb-label"
                  style={{
                    color:
                      template.bg === '#172a32'
                        ? '#f7f6ef'
                        : template.bg === '#34334b'
                        ? '#fff'
                        : template.bg === '#fffdf6'
                        ? '#344c42'
                        : template.bg === '#fbf4e8'
                        ? '#3a5146'
                        : template.bg === '#f1eddf'
                        ? '#263f35'
                        : template.bg === '#fff0c5'
                        ? '#2d4a3a'
                        : '#27343b',
                  }}
                >
                  {template.title}
                </span>
              </div>
              <div className="template-card-footer">
                <strong>{template.name}</strong>
                <span>{template.category}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="no-results">
            <strong>No templates found</strong>
            Try a different search or category.
          </div>
        )}
      </div>
    </section>
  );
};
