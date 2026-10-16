import React, { useState, useRef } from 'react';
import { ProjectDoc } from '../types';
import { downloadJSON, validateDocument, uid, nowISO, storage } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';

interface ProjectsViewProps {
  projects: ProjectDoc[];
  onOpenProject: (id: string) => void;
  onNewDesign: () => void;
  onRefreshProjects: () => void;
  onToast: (msg: string, isError?: boolean) => void;
  onImportDoc: (doc: ProjectDoc) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onOpenProject,
  onNewDesign,
  onRefreshProjects,
  onToast,
  onImportDoc,
}) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const res = storage.remove(deleteId);
    if (res.ok) {
      onToast('Saved project deleted.');
      onRefreshProjects();
    } else {
      onToast(res.error || 'Failed to delete project.', true);
    }
    setDeleteId(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onToast('Project JSON must be 10 MB or smaller.', true);
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const doc = validateDocument(parsed);
      doc.id = uid('project');
      doc.name = doc.name.slice(0, 110) + ' (imported)';
      doc.created = nowISO();
      doc.updated = nowISO();

      const res = storage.save(doc);
      if (!res.ok) throw new Error(res.error);

      onRefreshProjects();
      onImportDoc(doc);
      onToast('Validated project imported and saved locally.');
    } catch (err: any) {
      onToast(`Import failed: ${err?.message || 'Invalid format'}`, true);
    }
  };

  return (
    <section className="view active" id="view-projects" aria-labelledby="projects-heading">
      <div className="page-title-block with-actions">
        <div>
          <span className="eyebrow muted">YOUR SAVED WORK</span>
          <h1 id="projects-heading">My projects</h1>
          <p>Saved in this browser's local storage. Export JSON backups for portability.</p>
        </div>
        <div>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Import JSON
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={onNewDesign}
          >
            ＋ New design
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div id="project-grid" className="project-grid">
        {projects.length > 0 ? (
          projects.map((doc) => {
            const firstText = doc.elements.find((el) => el.type === 'text') as any;
            const previewText = (firstText?.text || doc.name).slice(0, 34);
            const previewColor = firstText?.color || '#26313b';

            return (
              <article key={doc.id} className="project-card">
                <div
                  className="template-thumb"
                  style={{ background: doc.background, aspectRatio: '1 / 0.75' }}
                  aria-hidden="true"
                >
                  <span className="thumb-label" style={{ color: previewColor }}>
                    {previewText}
                  </span>
                </div>
                <div className="project-card-footer">
                  <div style={{ minWidth: 0 }}>
                    <strong>{doc.name}</strong>
                    <div className="tile-meta">
                      {doc.width} × {doc.height}px
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadJSON(doc)}
                    aria-label={`Download ${doc.name} JSON`}
                    title="Download project JSON"
                  >
                    ⇩
                  </button>
                </div>
                <div className="two-action-row" style={{ marginTop: '7px' }}>
                  <button
                    type="button"
                    className="inspector-action"
                    onClick={() => onOpenProject(doc.id)}
                  >
                    Open project
                  </button>
                  <button
                    type="button"
                    className="inspector-action danger"
                    onClick={() => setDeleteId(doc.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="no-results">
            <strong>No projects saved yet</strong>
            Create a design, then save it to this browser.
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete saved project?"
        message="This will delete this project from your browser local storage. This action cannot be undone."
        confirmLabel="Delete"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </section>
  );
};
