import React from 'react';
import { ProjectDoc, TemplateData, ViewType } from '../types';
import { TEMPLATE_DATA, PRESETS } from '../constants';

interface OverviewViewProps {
  onNavigate: (view: ViewType) => void;
  onNewDesign: (name?: string, presetId?: string) => void;
  onSelectTemplate: (templateId: string) => void;
  onOpenProject: (id: string) => void;
  recentProjects: ProjectDoc[];
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onNewDesign,
  onSelectTemplate,
  onOpenProject,
  recentProjects,
}) => {
  return (
    <section className="view active" id="view-home" aria-labelledby="home-title">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">
            <i className="pulse"></i> YOUR BILINGUAL DESIGN WORKSPACE
          </span>
          <h1 id="home-title">
            Make ideas<br />
            <span>print-ready.</span>
          </h1>
          <p>Design cards, posters, invitations and more. Work in English or Telugu, right in your browser.</p>
          <div className="hero-buttons">
            <button
              className="button button-primary"
              id="hero-new"
              onClick={() => onNewDesign()}
            >
              Start a design <span>↗</span>
            </button>
            <button
              className="button button-ghost"
              onClick={() => onNavigate('templates')}
            >
              Explore templates
            </button>
          </div>
          <div className="hero-meta">
            <span>◈ Local-first projects</span>
            <span>◈ PNG export</span>
            <span>◈ Telugu + English</span>
          </div>
        </div>

        <div className="hero-art" aria-label="Abstract design preview">
          <div className="art-glow"></div>
          <div className="art-sheet sheet-back">
            <span className="sheet-dot"></span>
            <span className="sheet-line"></span>
            <span className="sheet-line short"></span>
          </div>
          <div className="art-sheet sheet-main">
            <div className="art-topline">
              <span>DESIGN STUDY / 026</span>
              <span>✳</span>
            </div>
            <div className="art-circle circle-cyan"></div>
            <div className="art-circle circle-coral"></div>
            <div className="art-big-type">
              MAKE<br />
              <em>IT</em><br />
              MATTER.
            </div>
            <div className="art-bottomline">
              <span>PRINT / CREATE / REPEAT</span>
              <span>01—03</span>
            </div>
          </div>
          <div className="floating-pill">✦ &nbsp; Creative tools, one place</div>
          <div className="floating-label">01 / STUDIO</div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <span className="eyebrow muted">GET INTO THE FLOW</span>
          <h2>What are you making?</h2>
        </div>
        <span className="section-note">Choose a starting point</span>
      </div>

      <div className="product-grid">
        <button
          className="product-card product-cyan"
          onClick={() => onNewDesign('Business card', 'business')}
        >
          <span className="product-card-top">
            <span className="product-icon">▱</span>
            <span className="arrow-bubble">↗</span>
          </span>
          <span className="product-kicker">01 / BRANDING</span>
          <strong>Business cards</strong>
          <small>Make a sharp first impression.</small>
          <span className="mini-preview business-preview">
            <b>STUDIO / 08</b>
            <i></i>
            <i className="line2"></i>
            <em>YK.</em>
          </span>
        </button>

        <button
          className="product-card product-peach"
          onClick={() => onNewDesign('Poster', 'poster')}
        >
          <span className="product-card-top">
            <span className="product-icon">▧</span>
            <span className="arrow-bubble">↗</span>
          </span>
          <span className="product-kicker">02 / LARGE FORMAT</span>
          <strong>Posters & flyers</strong>
          <small>Bold layouts that get noticed.</small>
          <span className="mini-preview poster-preview">
            <b>BIG<br />IDEAS.</b>
            <i></i>
          </span>
        </button>

        <button
          className="product-card product-lilac"
          onClick={() => onNewDesign('Invitation', 'invite')}
        >
          <span className="product-card-top">
            <span className="product-icon">✳</span>
            <span className="arrow-bubble">↗</span>
          </span>
          <span className="product-kicker">03 / CELEBRATIONS</span>
          <strong>Invitations</strong>
          <small>Give every event a signature.</small>
          <span className="mini-preview invite-preview">
            <em>You're invited</em>
            <b>the<br />celebration</b>
            <i>PLEASE JOIN US</i>
          </span>
        </button>

        <button
          className="product-card product-yellow"
          onClick={() => onNewDesign('Social post', 'square')}
        >
          <span className="product-card-top">
            <span className="product-icon">▦</span>
            <span className="arrow-bubble">↗</span>
          </span>
          <span className="product-kicker">04 / DIGITAL</span>
          <strong>Social designs</strong>
          <small>One idea, ready to share.</small>
          <span className="mini-preview social-preview">
            <b>MAKE<br />WAVES</b>
            <i>STAY CURIOUS</i>
            <span></span>
          </span>
        </button>
      </div>

      <div className="lower-grid">
        <section className="content-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow muted">A PLACE TO BEGIN</span>
              <h2>Template picks</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate('templates')}
            >
              View all ↗
            </button>
          </div>
          <div id="home-templates" className="template-strip">
            {TEMPLATE_DATA.slice(0, 3).map((template) => (
              <button
                key={template.id}
                className="template-tile"
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
                <span className="tile-name">{template.name}</span>
                <span className="tile-meta">{template.category} · Editable</span>
              </button>
            ))}
          </div>
        </section>

        <section className="content-panel recent-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow muted">YOUR WORKSPACE</span>
              <h2>Recent projects</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate('projects')}
            >
              View all ↗
            </button>
          </div>
          <div id="home-projects" className="recent-list">
            {recentProjects.length > 0 ? (
              recentProjects.slice(0, 4).map((doc) => {
                const firstText = doc.elements.find((el) => el.type === 'text') as any;
                const previewChar = (firstText?.text || doc.name).slice(0, 2);
                return (
                  <div key={doc.id} className="recent-row">
                    <div className="recent-thumb" style={{ background: doc.background }}>
                      {previewChar}
                    </div>
                    <div className="recent-main">
                      <strong>{doc.name}</strong>
                      <small>
                        {doc.width} × {doc.height}px · {new Date(doc.updated).toLocaleDateString()}
                      </small>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => onOpenProject(doc.id)}
                    >
                      Open ↗
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="empty-inline">
                No projects saved yet. Start a design to see it here.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};
