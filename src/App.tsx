import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, ProjectDoc, ToastMessage, ImageElement } from './types';
import { TEMPLATE_DATA, PRESETS } from './constants';
import {
  storage,
  blankDocument,
  templateDocument,
  uid,
  nowISO,
  imageLoad,
} from './utils/storage';
import { OverviewView } from './components/OverviewView';
import { EditorView } from './components/EditorView';
import { TemplatesView } from './components/TemplatesView';
import { ProjectsView } from './components/ProjectsView';
import { AiStudioView } from './components/AiStudioView';
import { IntegrationsView } from './components/IntegrationsView';
import { ConfirmModal } from './components/ConfirmModal';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [doc, setDoc] = useState<ProjectDoc>(() => blankDocument('Untitled design', PRESETS[1]));
  const [isDirty, setIsDirty] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [savedProjects, setSavedProjects] = useState<ProjectDoc[]>([]);
  const [initialKeyboardOpen, setInitialKeyboardOpen] = useState(false);

  // Modal confirmation for discarding unsaved changes
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    const id = uid('toast');
    setToasts((prev) => [...prev, { id, message, isError }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, isError ? 6500 : 3500);
  }, []);

  const refreshSavedProjects = useCallback(() => {
    const res = storage.all();
    if (res.ok) {
      setSavedProjects(res.docs);
    }
  }, []);

  useEffect(() => {
    refreshSavedProjects();
  }, [refreshSavedProjects]);

  // Warning when leaving tab if changes are unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeOrConfirmUnsaved = (action: () => void) => {
    if (isDirty) {
      setPendingAction(() => action);
    } else {
      action();
    }
  };

  const handleSaveDoc = () => {
    const trimmedName = doc.name.trim() || 'Untitled design';
    const toSave: ProjectDoc = {
      ...doc,
      name: trimmedName,
      updated: nowISO(),
    };
    const res = storage.save(toSave);
    if (!res.ok) {
      showToast(res.error || 'Failed to save project.', true);
      return;
    }
    setDoc(toSave);
    setIsDirty(false);
    refreshSavedProjects();
    showToast(`Saved “${trimmedName}” in this browser.`);
  };

  const handleNewDesign = (name = 'Untitled design', presetId = 'a4') => {
    executeOrConfirmUnsaved(() => {
      const p = PRESETS.find((item) => item.id === presetId) || PRESETS[1];
      const newDoc = blankDocument(name, p);
      setDoc(newDoc);
      setIsDirty(true);
      setCurrentView('editor');
      showToast('Blank canvas ready. Save when you want to keep it.');
    });
  };

  const handleSelectTemplate = (templateId: string) => {
    executeOrConfirmUnsaved(() => {
      const tmpl = TEMPLATE_DATA.find((t) => t.id === templateId);
      if (!tmpl) return;
      const newDoc = templateDocument(tmpl);
      setDoc(newDoc);
      setIsDirty(true);
      setCurrentView('editor');
      showToast(`Loaded “${tmpl.name}”. Edit the sample text before exporting.`);
    });
  };

  const handleOpenProject = (id: string) => {
    executeOrConfirmUnsaved(() => {
      const res = storage.get(id);
      if (!res.ok || !res.doc) {
        showToast(res.error || 'Project not found.', true);
        return;
      }
      setDoc(res.doc);
      setIsDirty(false);
      setCurrentView('editor');
    });
  };

  const handleImportDoc = (importedDoc: ProjectDoc) => {
    executeOrConfirmUnsaved(() => {
      setDoc(importedDoc);
      setIsDirty(false);
      setCurrentView('editor');
    });
  };

  const handleAddToDesign = async (imageDataUrl: string, promptText: string, mimeType: string) => {
    try {
      const img = await imageLoad(imageDataUrl);
      const factor = Math.min((doc.width * 0.8) / img.width, (doc.height * 0.65) / img.height, 1);
      const w = Math.max(1, Math.round(img.width * factor));
      const h = Math.max(1, Math.round(img.height * factor));

      const newEl: ImageElement = {
        id: uid('i'),
        type: 'image',
        name: 'AI generated image',
        src: imageDataUrl,
        alt: promptText.slice(0, 250),
        x: Math.round((doc.width - w) / 2),
        y: Math.round((doc.height - h) / 2),
        w,
        h,
        fit: 'contain',
        opacity: 1,
      };

      setDoc((prev) => ({
        ...prev,
        elements: [...prev.elements, newEl],
        updated: nowISO(),
      }));
      setIsDirty(true);
      setCurrentView('editor');
      showToast('Image added to design. Save your project to keep it.');
    } catch (err: any) {
      showToast(`Could not place image into design: ${err?.message}`, true);
    }
  };

  const handleTestKeyboard = () => {
    setInitialKeyboardOpen(true);
    setCurrentView('editor');
  };

  const viewTitles: Record<ViewType, string> = {
    home: 'Overview',
    editor: 'Design editor',
    templates: 'Template library',
    projects: 'My projects',
    ai: 'AI image studio',
    integrations: 'Integrations & setup',
  };

  return (
    <div className="app-shell">
      {/* Skip Link */}
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* Main Sidebar */}
      <aside className="sidebar" aria-label="Main sidebar">
        <a
          className="brand"
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('home');
          }}
          aria-label="AI PrintOS home"
        >
          <span className="brand-mark">P</span>
          <span>
            AI Print<span className="brand-light">OS</span>
            <small>PRINT. DESIGN. DELIVER.</small>
          </span>
        </a>

        <p className="side-label">WORKSPACE</p>

        <nav className="primary-nav" aria-label="Workspace">
          <button
            type="button"
            className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigate('home')}
          >
            <span className="nav-icon">⌂</span>Overview
          </button>
          <button
            type="button"
            className={`nav-item ${currentView === 'editor' ? 'active' : ''}`}
            onClick={() => handleNavigate('editor')}
          >
            <span className="nav-icon">▧</span>Design editor
          </button>
          <button
            type="button"
            className={`nav-item ${currentView === 'templates' ? 'active' : ''}`}
            onClick={() => handleNavigate('templates')}
          >
            <span className="nav-icon">▦</span>Template library
          </button>
          <button
            type="button"
            className={`nav-item ${currentView === 'projects' ? 'active' : ''}`}
            onClick={() => handleNavigate('projects')}
          >
            <span className="nav-icon">▤</span>My projects
          </button>
          <button
            type="button"
            className={`nav-item ${currentView === 'ai' ? 'active' : ''}`}
            onClick={() => handleNavigate('ai')}
          >
            <span className="nav-icon">✳</span>AI image studio{' '}
            <span className="nav-tag">API</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="status-card">
            <span className="status-dot"></span>
            <div>
              <strong>Browser workspace</strong>
              <small>Local-first · No account required</small>
            </div>
          </div>

          <button
            type="button"
            className={`nav-item ${currentView === 'integrations' ? 'active' : ''}`}
            onClick={() => handleNavigate('integrations')}
          >
            <span className="nav-icon">⌘</span>Integrations & setup
          </button>
          <div className="side-foot">Built with React · Vite · Express</div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="main-column">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">P</span>
            <strong>AI PrintOS</strong>
          </div>

          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="crumb-sep">/</span>
            <strong id="current-crumb">{viewTitles[currentView]}</strong>
          </div>

          <div className="top-actions">
            <span className="save-state" id="global-save-state">
              <i style={{ background: isDirty ? '#e7a34f' : '#5dc49f' }}></i>
              {isDirty ? ' Unsaved changes' : ' Saved locally'}
            </span>
            <button
              type="button"
              className="button button-primary button-small"
              id="top-new"
              onClick={() => handleNewDesign()}
            >
              ＋ New design
            </button>
          </div>
        </header>

        <main id="main" tabIndex={-1}>
          {currentView === 'home' && (
            <OverviewView
              onNavigate={handleNavigate}
              onNewDesign={handleNewDesign}
              onSelectTemplate={handleSelectTemplate}
              onOpenProject={handleOpenProject}
              recentProjects={savedProjects}
            />
          )}

          {currentView === 'editor' && (
            <EditorView
              doc={doc}
              onUpdateDoc={(updatedDoc, dirty = true) => {
                setDoc(updatedDoc);
                if (dirty) setIsDirty(true);
              }}
              onSave={handleSaveDoc}
              isDirty={isDirty}
              onToast={showToast}
              initialKeyboardOpen={initialKeyboardOpen}
            />
          )}

          {currentView === 'templates' && (
            <TemplatesView onSelectTemplate={handleSelectTemplate} />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={savedProjects}
              onOpenProject={handleOpenProject}
              onNewDesign={() => handleNewDesign()}
              onRefreshProjects={refreshSavedProjects}
              onToast={showToast}
              onImportDoc={handleImportDoc}
            />
          )}

          {currentView === 'ai' && (
            <AiStudioView
              onAddToDesign={handleAddToDesign}
              onToast={showToast}
            />
          )}

          {currentView === 'integrations' && (
            <IntegrationsView
              onNavigate={handleNavigate}
              onTestKeyboard={handleTestKeyboard}
            />
          )}
        </main>

        <footer className="app-footer">
          <span>
            AI PrintOS <span className="footer-dot">·</span> A browser-based design workspace
          </span>
          <span>Local-first by default</span>
        </footer>
      </div>

      {/* Mobile Navigation */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button
          type="button"
          className={currentView === 'home' ? 'active' : ''}
          onClick={() => handleNavigate('home')}
        >
          <span>⌂</span>Home
        </button>
        <button
          type="button"
          className={currentView === 'editor' ? 'active' : ''}
          onClick={() => handleNavigate('editor')}
        >
          <span>▧</span>Editor
        </button>
        <button
          type="button"
          className={currentView === 'templates' ? 'active' : ''}
          onClick={() => handleNavigate('templates')}
        >
          <span>▦</span>Templates
        </button>
        <button
          type="button"
          className={currentView === 'projects' ? 'active' : ''}
          onClick={() => handleNavigate('projects')}
        >
          <span>▤</span>Projects
        </button>
        <button
          type="button"
          className={currentView === 'ai' ? 'active' : ''}
          onClick={() => handleNavigate('ai')}
        >
          <span>✳</span>AI studio
        </button>
      </nav>

      {/* Toast Notifications */}
      <div className="toast-region" id="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.isError ? 'error' : ''}`}>
            {t.message}
          </div>
        ))}
      </div>

      {/* Discard confirmation modal */}
      <ConfirmModal
        isOpen={pendingAction !== null}
        title="Discard unsaved changes?"
        message="You have unsaved changes in your current design. Proceeding will discard them."
        confirmLabel="Discard & Continue"
        cancelLabel="Keep editing"
        isDanger={true}
        onConfirm={() => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
            setIsDirty(false);
          }
        }}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
};
export default App;
