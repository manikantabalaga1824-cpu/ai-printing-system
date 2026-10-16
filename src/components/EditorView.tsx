import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectDoc, DesignElement, TextElement, ShapeElement, ImageElement, ShapeKind } from '../types';
import { PRESETS, IMAGE_TYPES, FONT_STACK, SERIF_STACK, MONO_STACK } from '../constants';
import {
  uid,
  clamp,
  cleanColor,
  nowISO,
  exportPNG,
  imageLoad,
  storage,
} from '../utils/storage';
import { BilingualKeyboard } from './BilingualKeyboard';

interface EditorViewProps {
  doc: ProjectDoc;
  onUpdateDoc: (doc: ProjectDoc, markDirty?: boolean) => void;
  onSave: () => void;
  isDirty: boolean;
  onToast: (msg: string, isError?: boolean) => void;
  initialKeyboardOpen?: boolean;
}

export const EditorView: React.FC<EditorViewProps> = ({
  doc,
  onUpdateDoc,
  onSave,
  isDirty,
  onToast,
  initialKeyboardOpen = false,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'properties' | 'layers'>('properties');
  const [keyboardOpen, setKeyboardOpen] = useState(initialKeyboardOpen);
  const [exportScale, setExportScale] = useState<number>(2);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(1);

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const stageWrapRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);

  // Drag state
  const dragRef = useRef<{
    pointerId: number;
    mode: 'move' | 'resize';
    x: number;
    y: number;
    ox: number;
    oy: number;
    ow: number;
    oh: number;
    snapshot: string;
    moved: boolean;
  } | null>(null);

  const snapshotDoc = (d: ProjectDoc) => JSON.stringify(d);

  const pushUndo = (prevDoc: ProjectDoc) => {
    setUndoStack((prev) => {
      const next = [...prev, snapshotDoc(prevDoc)];
      if (next.length > 80) next.shift();
      return next;
    });
    setRedoStack([]);
  };

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, -1));
    setRedoStack((r) => [...r, snapshotDoc(doc)]);
    try {
      const parsed = JSON.parse(prev);
      onUpdateDoc(parsed, true);
    } catch (_e) {}
  }, [undoStack, doc, onUpdateDoc]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((u) => [...u, snapshotDoc(doc)]);
    try {
      const parsed = JSON.parse(next);
      onUpdateDoc(parsed, true);
    } catch (_e) {}
  }, [redoStack, doc, onUpdateDoc]);

  const mutate = (updater: (draft: ProjectDoc) => void) => {
    pushUndo(doc);
    const draft: ProjectDoc = JSON.parse(JSON.stringify(doc));
    updater(draft);
    draft.updated = nowISO();
    onUpdateDoc(draft, true);
  };

  // Auto-fit canvas scale
  const fitCanvas = useCallback(() => {
    if (!stageWrapRef.current) return;
    const wrap = stageWrapRef.current;
    const maxWidth = Math.max(100, wrap.clientWidth - 35);
    const maxHeight = Math.max(140, wrap.clientHeight - 32);
    const fitScale = Math.min(maxWidth / doc.width, maxHeight / doc.height, 1);
    setScale(fitScale);
  }, [doc.width, doc.height]);

  useEffect(() => {
    fitCanvas();
    window.addEventListener('resize', fitCanvas);
    return () => window.removeEventListener('resize', fitCanvas);
  }, [fitCanvas]);

  const selectedElement = doc.elements.find((el) => el.id === selectedId) || null;

  // Global keyboard shortcuts in editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement as HTMLElement)?.tagName || '');

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (isInput) return;
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (isInput || keyboardOpen) return;

      const directions: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };

      if (directions[e.key] && selectedElement) {
        e.preventDefault();
        const [dx, dy] = directions[e.key];
        const step = e.shiftKey ? 10 : 1;
        mutate((draft) => {
          const el = draft.elements.find((i) => i.id === selectedElement.id);
          if (el) {
            el.x += dx * step;
            el.y += dy * step;
          }
        });
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault();
        handleDeleteElement(selectedElement.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, keyboardOpen, onSave, handleUndo, handleRedo]);

  const handlePointerDownElement = (e: React.PointerEvent, elId: string, isResize = false) => {
    e.stopPropagation();
    setSelectedId(elId);
    setInspectorTab('properties');

    const targetEl = doc.elements.find((i) => i.id === elId);
    if (!targetEl) return;

    dragRef.current = {
      pointerId: e.pointerId,
      mode: isResize ? 'resize' : 'move',
      x: e.clientX,
      y: e.clientY,
      ox: targetEl.x,
      oy: targetEl.y,
      ow: targetEl.w,
      oh: targetEl.h,
      snapshot: snapshotDoc(doc),
      moved: false,
    };

    try {
      stageWrapRef.current?.setPointerCapture(e.pointerId);
    } catch (_err) {}
  };

  const handlePointerMoveWrap = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId || !selectedId) return;

    const dx = (e.clientX - drag.x) / scale;
    const dy = (e.clientY - drag.y) / scale;

    if (Math.abs(dx) + Math.abs(dy) > 2) {
      drag.moved = true;
    }
    if (!drag.moved) return;

    const draft = JSON.parse(JSON.stringify(doc)) as ProjectDoc;
    const el = draft.elements.find((i) => i.id === selectedId);
    if (!el) return;

    if (drag.mode === 'move') {
      el.x = Math.round(drag.ox + dx);
      el.y = Math.round(drag.oy + dy);
    } else {
      el.w = Math.max(1, Math.round(drag.ow + dx));
      el.h = Math.max(1, Math.round(drag.oh + dy));
    }

    onUpdateDoc(draft, false);
  };

  const handlePointerUpWrap = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;

    if (drag.moved) {
      pushUndo(JSON.parse(drag.snapshot));
      const updated = { ...doc, updated: nowISO() };
      onUpdateDoc(updated, true);
    }
    dragRef.current = null;
  };

  const handleAddText = () => {
    const centerX = Math.round(doc.width * 0.12);
    const centerY = Math.round(doc.height * 0.12);
    const newEl: TextElement = {
      id: uid('t'),
      type: 'text',
      name: 'New text',
      text: 'Your text',
      x: centerX,
      y: centerY,
      w: Math.round(doc.width * 0.68),
      h: Math.round(doc.height * 0.16),
      size: Math.max(28, Math.round(Math.min(doc.width, doc.height) * 0.065)),
      weight: 700,
      font: 'sans',
      color: '#202832',
      align: 'left',
      lh: 1.2,
      opacity: 1,
    };

    mutate((draft) => {
      draft.elements.push(newEl);
    });
    setSelectedId(newEl.id);
    setInspectorTab('properties');
  };

  const handleAddShape = () => {
    const centerX = Math.round(doc.width * 0.12);
    const centerY = Math.round(doc.height * 0.12);
    const newEl: ShapeElement = {
      id: uid('s'),
      type: 'shape',
      name: 'Rectangle',
      shape: 'rect',
      x: centerX,
      y: centerY,
      w: Math.round(doc.width * 0.36),
      h: Math.round(doc.height * 0.22),
      fill: '#75e6d0',
      stroke: 'transparent',
      sw: 0,
      radius: 8,
      opacity: 1,
    };

    mutate((draft) => {
      draft.elements.push(newEl);
    });
    setSelectedId(newEl.id);
    setInspectorTab('properties');
  };

  const handleImageUpload = async (file?: File, replace = false) => {
    if (!file) return;
    if (!IMAGE_TYPES.has(file.type)) {
      onToast('Choose a PNG, JPEG or WebP image.', true);
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      onToast('Image files must be 3 MB or smaller to protect browser storage.', true);
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Could not read image file.'));
        reader.readAsDataURL(file);
      });

      const img = await imageLoad(dataUrl);
      const factor = Math.min((doc.width * 0.7) / img.width, (doc.height * 0.7) / img.height, 1);
      const w = Math.max(1, Math.round(img.width * factor));
      const h = Math.max(1, Math.round(img.height * factor));

      if (replace && selectedElement?.type === 'image') {
        mutate((draft) => {
          const el = draft.elements.find((i) => i.id === selectedElement.id) as ImageElement;
          if (el) {
            el.src = dataUrl;
            el.w = w;
            el.h = h;
          }
        });
        onToast('Image replaced.');
      } else {
        const newEl: ImageElement = {
          id: uid('i'),
          type: 'image',
          name: file.name.slice(0, 100),
          src: dataUrl,
          alt: file.name.replace(/\.[^.]+$/, '').slice(0, 250),
          x: Math.round((doc.width - w) / 2),
          y: Math.round((doc.height - h) / 2),
          w,
          h,
          fit: 'contain',
          opacity: 1,
        };

        mutate((draft) => {
          draft.elements.push(newEl);
        });
        setSelectedId(newEl.id);
        setInspectorTab('properties');
        onToast('Image added to design.');
      }
    } catch (err: any) {
      onToast(`Image upload failed: ${err?.message || 'Error decoding image'}`, true);
    }
  };

  const handleDeleteElement = (id: string) => {
    mutate((draft) => {
      draft.elements = draft.elements.filter((el) => el.id !== id);
    });
    if (selectedId === id) setSelectedId(null);
    onToast('Layer deleted. Use Undo to restore it.');
  };

  const handleDuplicateElement = () => {
    if (!selectedElement) return;
    const copy = JSON.parse(JSON.stringify(selectedElement)) as DesignElement;
    copy.id = uid(copy.type[0]);
    copy.name = `${copy.name} copy`.slice(0, 100);
    copy.x += 18;
    copy.y += 18;

    mutate((draft) => {
      draft.elements.push(copy);
    });
    setSelectedId(copy.id);
  };

  const handleMoveLayer = (direction: 'front' | 'back') => {
    if (!selectedId) return;
    const idx = doc.elements.findIndex((el) => el.id === selectedId);
    if (idx < 0) return;
    const targetIdx = direction === 'front' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= doc.elements.length) return;

    mutate((draft) => {
      const [moved] = draft.elements.splice(idx, 1);
      draft.elements.splice(targetIdx, 0, moved);
    });
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      await exportPNG(doc, exportScale);
      onToast('PNG export downloaded.');
    } catch (err: any) {
      onToast(`PNG export failed: ${err?.message}`, true);
    } finally {
      setIsExporting(false);
    }
  };

  // Keyboard insertions
  const handleKeyboardInsert = (text: string) => {
    if (!selectedElement || selectedElement.type !== 'text') {
      onToast('Select a text layer first to type into it.', true);
      return;
    }
    mutate((draft) => {
      const el = draft.elements.find((i) => i.id === selectedElement.id) as TextElement;
      if (el) {
        el.text += text;
      }
    });
  };

  const handleKeyboardDelete = () => {
    if (!selectedElement || selectedElement.type !== 'text') return;
    mutate((draft) => {
      const el = draft.elements.find((i) => i.id === selectedElement.id) as TextElement;
      if (el && el.text.length > 0) {
        // Handle surrogate pairs or unicode graphemes
        const match = el.text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]$|.$/u);
        const cut = match ? match[0].length : 1;
        el.text = el.text.slice(0, -cut);
      }
    });
  };

  const getFontFamilyCSS = (font: string) => {
    if (font === 'serif') return SERIF_STACK;
    if (font === 'mono') return MONO_STACK;
    return FONT_STACK;
  };

  const presetIndex = PRESETS.findIndex((p) => p.w === doc.width && p.h === doc.height);

  return (
    <section className="view active" id="view-editor" aria-labelledby="editor-heading">
      <div className="editor-page-heading">
        <div>
          <span className="eyebrow muted">THE CREATIVE WORKBENCH</span>
          <h1 id="editor-heading">Design editor</h1>
          <p>Arrange, edit and export your layout. Your project stays in this browser.</p>
        </div>
        <div className="editor-page-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={onSave}
          >
            Save design
          </button>
        </div>
      </div>

      <div className="editor-shell">
        <div className="editor-toolbar">
          <label className="sr-only" htmlFor="design-name">
            Design name
          </label>
          <input
            id="design-name"
            className="design-name"
            maxLength={120}
            value={doc.name}
            onChange={(e) => {
              const val = e.target.value.slice(0, 120);
              onUpdateDoc({ ...doc, name: val || 'Untitled design' }, true);
            }}
          />
          <span className="toolbar-divider"></span>

          <button
            type="button"
            className="tool-button"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            disabled={undoStack.length === 0}
            onClick={handleUndo}
          >
            ↶
          </button>
          <button
            type="button"
            className="tool-button"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            disabled={redoStack.length === 0}
            onClick={handleRedo}
          >
            ↷
          </button>
          <span className="toolbar-divider"></span>

          <button
            type="button"
            className="tool-button tool-add"
            onClick={handleAddText}
          >
            <b>T</b>
            <span>Text</span>
          </button>
          <button
            type="button"
            className="tool-button tool-add"
            onClick={handleAddShape}
          >
            <b>▭</b>
            <span>Shape</span>
          </button>
          <button
            type="button"
            className="tool-button tool-add"
            onClick={() => imageInputRef.current?.click()}
          >
            <b>▧</b>
            <span>Image</span>
          </button>

          <button
            type="button"
            className={`tool-button ${keyboardOpen ? 'active' : ''}`}
            title="Toggle bilingual keyboard"
            onClick={() => {
              if (!keyboardOpen && (!selectedElement || selectedElement.type !== 'text')) {
                // Find first text element or create one
                const textEl = doc.elements.find((i) => i.type === 'text');
                if (textEl) setSelectedId(textEl.id);
                else handleAddText();
              }
              setKeyboardOpen(!keyboardOpen);
            }}
          >
            ⌨ <span>Keyboard</span>
          </button>

          <span className="toolbar-spacer"></span>

          <label className="sr-only" htmlFor="export-scale">
            Export scale
          </label>
          <select
            id="export-scale"
            className="scale-select"
            aria-label="PNG export scale"
            value={exportScale}
            onChange={(e) => setExportScale(Number(e.target.value))}
          >
            <option value="1">1×</option>
            <option value="2">2×</option>
            <option value="3">3×</option>
          </select>

          <button
            type="button"
            className="button button-dark button-small"
            id="export-png"
            disabled={isExporting}
            onClick={handleExportPNG}
          >
            {isExporting ? 'Exporting…' : 'Export PNG ↗'}
          </button>
        </div>

        <input
          type="file"
          ref={imageInputRef}
          accept="image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            handleImageUpload(f, false);
          }}
        />

        <input
          type="file"
          ref={replaceImageInputRef}
          accept="image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            handleImageUpload(f, true);
          }}
        />

        <div className="editor-workspace">
          <div className="canvas-zone">
            <div className="canvas-caption">
              <span>
                <i className="canvas-dot"></i> LIVE CANVAS
              </span>
              <span id="canvas-size">
                {doc.width} × {doc.height} px
              </span>
            </div>

            <div
              className="canvas-stage-wrap"
              id="canvas-stage-wrap"
              ref={stageWrapRef}
              onPointerMove={handlePointerMoveWrap}
              onPointerUp={handlePointerUpWrap}
              onPointerCancel={handlePointerUpWrap}
              onClick={(e) => {
                if (e.target === stageWrapRef.current) {
                  setSelectedId(null);
                }
              }}
            >
              <div
                id="canvas-stage"
                className="canvas-stage"
                style={{
                  width: `${doc.width}px`,
                  height: `${doc.height}px`,
                  backgroundColor: doc.background,
                  transform: `scale(${scale})`,
                  margin: `${Math.max(0, (doc.height * scale - doc.height) / 2)}px auto`,
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelectedId(null);
                  }
                }}
              >
                {doc.elements.map((el) => {
                  const isSelected = el.id === selectedId;
                  const isTelugu = el.type === 'text' && /[\u0C00-\u0C7F]/.test(el.text);

                  return (
                    <div
                      key={el.id}
                      className={`design-el ${isSelected ? 'selected' : ''}`}
                      style={{
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.w}px`,
                        height: `${el.h}px`,
                        opacity: el.opacity,
                        fontFamily: el.type === 'text' ? getFontFamilyCSS(el.font) : undefined,
                        fontSize: el.type === 'text' ? `${el.size}px` : undefined,
                        fontWeight: el.type === 'text' ? el.weight : undefined,
                        color: el.type === 'text' ? el.color : undefined,
                        textAlign: el.type === 'text' ? el.align : undefined,
                        lineHeight: el.type === 'text' ? el.lh : undefined,
                        backgroundColor: el.type === 'shape' ? el.fill : undefined,
                        border:
                          el.type === 'shape' && el.sw && el.stroke !== 'transparent'
                            ? `${el.sw}px solid ${el.stroke}`
                            : 'none',
                        borderRadius:
                          el.type === 'shape'
                            ? el.shape === 'ellipse'
                              ? '50%'
                              : `${el.radius}px`
                            : undefined,
                      }}
                      lang={isTelugu ? 'te' : 'en'}
                      onPointerDown={(e) => handlePointerDownElement(e, el.id, false)}
                    >
                      {el.type === 'text' && el.text}
                      {el.type === 'image' && (
                        <img
                          alt={el.alt}
                          src={el.src}
                          style={{ objectFit: el.fit }}
                        />
                      )}
                      {isSelected && (
                        <span
                          className="resize-handle"
                          aria-label="Resize element"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            handlePointerDownElement(e, el.id, true);
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="canvas-footer">
              <span>Drag an object to move it · Use the corner handle to resize</span>
              <span id="canvas-selection">
                {selectedElement?.name || 'No selection'}
              </span>
            </div>

            {keyboardOpen && (
              <BilingualKeyboard
                currentText={selectedElement?.type === 'text' ? selectedElement.text : ''}
                onInsert={handleKeyboardInsert}
                onDelete={handleKeyboardDelete}
                onClose={() => setKeyboardOpen(false)}
              />
            )}
          </div>

          <aside className="inspector">
            <div className="inspector-tabs">
              <button
                type="button"
                className={`inspector-tab ${inspectorTab === 'properties' ? 'active' : ''}`}
                onClick={() => setInspectorTab('properties')}
              >
                Properties
              </button>
              <button
                type="button"
                className={`inspector-tab ${inspectorTab === 'layers' ? 'active' : ''}`}
                onClick={() => setInspectorTab('layers')}
              >
                Layers <span id="layer-count">{doc.elements.length}</span>
              </button>
            </div>

            <div id="inspector-content" className="inspector-content">
              {inspectorTab === 'layers' ? (
                <>
                  <h3>Object layers</h3>
                  <p className="inspector-note">
                    Select a layer to edit it. The list shows frontmost items first.
                  </p>
                  <div className="layers-list">
                    {doc.elements.length === 0 ? (
                      <p className="inspector-note">No layers yet. Add text, a shape or an image to begin.</p>
                    ) : (
                      [...doc.elements].reverse().map((el) => (
                        <button
                          key={el.id}
                          type="button"
                          className={`layer-row ${el.id === selectedId ? 'selected' : ''}`}
                          onClick={() => setSelectedId(el.id)}
                        >
                          <span className="layer-type">
                            {el.type === 'text' ? 'T' : el.type === 'shape' ? '▱' : '▧'}
                          </span>
                          <span className="layer-title">{el.name}</span>
                          <span>{el.id === selectedId ? '●' : ''}</span>
                        </button>
                      ))
                    )}
                  </div>
                  {selectedElement && (
                    <button
                      type="button"
                      className="inspector-action danger"
                      onClick={() => handleDeleteElement(selectedElement.id)}
                    >
                      Delete selected layer
                    </button>
                  )}
                </>
              ) : selectedElement ? (
                <>
                  <h3>
                    {selectedElement.type === 'text'
                      ? 'Text layer'
                      : selectedElement.type === 'shape'
                      ? 'Shape layer'
                      : 'Image layer'}
                  </h3>

                  <label className="form-field">
                    <span>Layer name</span>
                    <input
                      type="text"
                      value={selectedElement.name}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 100);
                        mutate((draft) => {
                          const el = draft.elements.find((i) => i.id === selectedElement.id);
                          if (el) el.name = val;
                        });
                      }}
                    />
                  </label>

                  <div className="form-grid-2">
                    <label className="form-field">
                      <span>X</span>
                      <input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => {
                          const val = clamp(Number(e.target.value) || 0, -100000, 100000);
                          mutate((draft) => {
                            const el = draft.elements.find((i) => i.id === selectedElement.id);
                            if (el) el.x = val;
                          });
                        }}
                      />
                    </label>
                    <label className="form-field">
                      <span>Y</span>
                      <input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => {
                          const val = clamp(Number(e.target.value) || 0, -100000, 100000);
                          mutate((draft) => {
                            const el = draft.elements.find((i) => i.id === selectedElement.id);
                            if (el) el.y = val;
                          });
                        }}
                      />
                    </label>
                  </div>

                  <div className="form-grid-2">
                    <label className="form-field">
                      <span>Width</span>
                      <input
                        type="number"
                        value={selectedElement.w}
                        onChange={(e) => {
                          const val = clamp(Number(e.target.value) || 1, 1, 100000);
                          mutate((draft) => {
                            const el = draft.elements.find((i) => i.id === selectedElement.id);
                            if (el) el.w = val;
                          });
                        }}
                      />
                    </label>
                    <label className="form-field">
                      <span>Height</span>
                      <input
                        type="number"
                        value={selectedElement.h}
                        onChange={(e) => {
                          const val = clamp(Number(e.target.value) || 1, 1, 100000);
                          mutate((draft) => {
                            const el = draft.elements.find((i) => i.id === selectedElement.id);
                            if (el) el.h = val;
                          });
                        }}
                      />
                    </label>
                  </div>

                  <label className="form-field">
                    <span>
                      Opacity · <b id="opacity-label">{Math.round(selectedElement.opacity * 100)}%</b>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedElement.opacity}
                      onChange={(e) => {
                        const val = clamp(Number(e.target.value), 0, 1);
                        mutate((draft) => {
                          const el = draft.elements.find((i) => i.id === selectedElement.id);
                          if (el) el.opacity = val;
                        });
                      }}
                    />
                  </label>

                  {selectedElement.type === 'text' && (
                    <>
                      <label className="form-field">
                        <span>Text content</span>
                        <textarea
                          rows={4}
                          maxLength={12000}
                          lang={/[\u0C00-\u0C7F]/.test(selectedElement.text) ? 'te' : 'en'}
                          value={selectedElement.text}
                          onChange={(e) => {
                            const val = e.target.value.slice(0, 12000);
                            mutate((draft) => {
                              const el = draft.elements.find((i) => i.id === selectedElement.id) as TextElement;
                              if (el) el.text = val;
                            });
                          }}
                        />
                      </label>

                      <div className="form-grid-2">
                        <label className="form-field">
                          <span>Font size</span>
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            value={selectedElement.size}
                            onChange={(e) => {
                              const val = clamp(Number(e.target.value) || 12, 1, 1000);
                              mutate((draft) => {
                                const el = draft.elements.find((i) => i.id === selectedElement.id) as TextElement;
                                if (el) el.size = val;
                              });
                            }}
                          />
                        </label>
                        <label className="form-field">
                          <span>Font family</span>
                          <select
                            value={selectedElement.font}
                            onChange={(e) => {
                              const val = e.target.value as 'sans' | 'serif' | 'mono';
                              mutate((draft) => {
                                const el = draft.elements.find((i) => i.id === selectedElement.id) as TextElement;
                                if (el) el.font = val;
                              });
                            }}
                          >
                            <option value="sans">Sans</option>
                            <option value="serif">Serif</option>
                            <option value="mono">Mono</option>
                          </select>
                        </label>
                      </div>

                      <div className="form-grid-2">
                        <label className="form-field">
                          <span>Weight</span>
                          <select
                            value={selectedElement.weight}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              mutate((draft) => {
                                const el = draft.elements.find((i) => i.id === selectedElement.id) as TextElement;
                                if (el) el.weight = val;
                              });
                            }}
                          >
                            <option value={400}>Regular</option>
                            <option value={500}>Medium</option>
                            <option value={600}>Semibold</option>
                            <option value={700}>Bold</option>
                            <option value={800}>Extra bold</option>
                          </select>
                        </label>
                        <label className="form-field">
                          <span>Align</span>
                          <select
                            value={selectedElement.align}
                            onChange={(e) => {
                              const val = e.target.value as 'left' | 'center' | 'right';
                              mutate((draft) => {
                                const el = draft.elements.find((i) => i.id === selectedElement.id) as TextElement;
                                if (el) el.align = val;
                              });
                            }}
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </label>
                      </div>

                      <div className="form-grid-2">
                        <label className="form-field">
                          <span>Text color</span>
                          <input
                            type="color"
                            value={cleanColor(selectedElement.color) ? selectedElement.color : '#202832'}
                            onChange={(e) => {
                              const val = e.target.value;
                              mutate((draft) => {
                                const el = draft.elements.find((i) => i.id === selectedElement.id) as TextElement;
                                if (el) el.color = val;
                              });
                            }}
                          />
                        </label>
                        <label className="form-field">
                          <span>Line spacing</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0.5"
                            max="3"
                            value={selectedElement.lh}
                            onChange={(e) => {
                              const val = clamp(Number(e.target.value) || 1.2, 0.5, 3);
                              mutate((draft) => {
                                const el = draft.elements.find((i) => i.id === selectedElement.id) as TextElement;
                                if (el) el.lh = val;
                              });
                            }}
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        className="inspector-action"
                        onClick={() => setKeyboardOpen(true)}
                      >
                        ⌨ Type with PrintType keyboard
                      </button>
                      <p className="inspector-note">
                        Telugu text can be pasted or entered with the virtual keyboard. For transliteration, check candidate suggestions before inserting.
                      </p>
                    </>
                  )}

                  {selectedElement.type === 'shape' && (
                    <>
                      <label className="form-field">
                        <span>Shape</span>
                        <select
                          value={selectedElement.shape}
                          onChange={(e) => {
                            const val = e.target.value as ShapeKind;
                            mutate((draft) => {
                              const el = draft.elements.find((i) => i.id === selectedElement.id) as ShapeElement;
                              if (el) el.shape = val;
                            });
                          }}
                        >
                          <option value="rect">Rectangle</option>
                          <option value="ellipse">Ellipse</option>
                        </select>
                      </label>

                      <div className="form-grid-2">
                        <label className="form-field">
                          <span>Fill</span>
                          <input
                            type="color"
                            value={selectedElement.fill === 'transparent' ? '#ffffff' : selectedElement.fill}
                            onChange={(e) => {
                              const val = e.target.value;
                              mutate((draft) => {
                                const el = draft.elements.find((i) => i.id === selectedElement.id) as ShapeElement;
                                if (el) el.fill = val;
                              });
                            }}
                          />
                        </label>
                        <label className="form-field">
                          <span>Border</span>
                          <input
                            type="color"
                            value={selectedElement.stroke === 'transparent' ? '#ffffff' : selectedElement.stroke}
                            onChange={(e) => {
                              const val = e.target.value;
                              mutate((draft) => {
                                const el = draft.elements.find((i) => i.id === selectedElement.id) as ShapeElement;
                                if (el) el.stroke = val;
                              });
                            }}
                          />
                        </label>
                      </div>

                      <div className="form-grid-2">
                        <label className="form-field">
                          <span>Border width</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={selectedElement.sw}
                            onChange={(e) => {
                              const val = clamp(Number(e.target.value) || 0, 0, 100);
                              mutate((draft) => {
                                const el = draft.elements.find((i) => i.id === selectedElement.id) as ShapeElement;
                                if (el) el.sw = val;
                              });
                            }}
                          />
                        </label>
                        <label className="form-field">
                          <span>Corner radius</span>
                          <input
                            type="number"
                            min="0"
                            max="1000"
                            value={selectedElement.radius}
                            onChange={(e) => {
                              const val = clamp(Number(e.target.value) || 0, 0, 1000);
                              mutate((draft) => {
                                const el = draft.elements.find((i) => i.id === selectedElement.id) as ShapeElement;
                                if (el) el.radius = val;
                              });
                            }}
                          />
                        </label>
                      </div>

                      <label className="form-field">
                        <span>
                          <input
                            type="checkbox"
                            checked={selectedElement.fill === 'transparent'}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              mutate((draft) => {
                                const el = draft.elements.find((i) => i.id === selectedElement.id) as ShapeElement;
                                if (el) el.fill = isChecked ? 'transparent' : '#75e6d0';
                              });
                            }}
                          />{' '}
                          Transparent fill
                        </span>
                      </label>
                    </>
                  )}

                  {selectedElement.type === 'image' && (
                    <>
                      <label className="form-field">
                        <span>Image fit</span>
                        <select
                          value={selectedElement.fit}
                          onChange={(e) => {
                            const val = e.target.value as 'contain' | 'cover' | 'fill';
                            mutate((draft) => {
                              const el = draft.elements.find((i) => i.id === selectedElement.id) as ImageElement;
                              if (el) el.fit = val;
                            });
                          }}
                        >
                          <option value="contain">Contain</option>
                          <option value="cover">Cover</option>
                          <option value="fill">Stretch</option>
                        </select>
                      </label>

                      <label className="form-field">
                        <span>Alternative text</span>
                        <input
                          type="text"
                          value={selectedElement.alt}
                          onChange={(e) => {
                            const val = e.target.value.slice(0, 300);
                            mutate((draft) => {
                              const el = draft.elements.find((i) => i.id === selectedElement.id) as ImageElement;
                              if (el) el.alt = val;
                            });
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        className="inspector-action"
                        onClick={() => replaceImageInputRef.current?.click()}
                      >
                        Replace image
                      </button>
                      <p className="inspector-note">Use images you own or have permission to print.</p>
                    </>
                  )}

                  <div className="two-action-row">
                    <button
                      type="button"
                      className="inspector-action"
                      onClick={handleDuplicateElement}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className="inspector-action danger"
                      onClick={() => handleDeleteElement(selectedElement.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="two-action-row">
                    <button
                      type="button"
                      className="inspector-action"
                      onClick={() => handleMoveLayer('back')}
                    >
                      Send backward
                    </button>
                    <button
                      type="button"
                      className="inspector-action"
                      onClick={() => handleMoveLayer('front')}
                    >
                      Bring forward
                    </button>
                  </div>

                  <h3>All layers</h3>
                  <div className="layers-list">
                    {[...doc.elements].reverse().map((el) => (
                      <button
                        key={el.id}
                        type="button"
                        className={`layer-row ${el.id === selectedId ? 'selected' : ''}`}
                        onClick={() => setSelectedId(el.id)}
                      >
                        <span className="layer-type">
                          {el.type === 'text' ? 'T' : el.type === 'shape' ? '▱' : '▧'}
                        </span>
                        <span className="layer-title">{el.name}</span>
                        <span>{el.id === selectedId ? '●' : ''}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3>Canvas settings</h3>
                  <p className="inspector-note">
                    Choose an element to edit its style, or adjust the canvas below.
                  </p>

                  <label className="form-field">
                    <span>Canvas preset</span>
                    <select
                      value={presetIndex >= 0 ? String(presetIndex) : 'custom'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') return;
                        const p = PRESETS[Number(val)];
                        if (!p) return;
                        mutate((draft) => {
                          draft.width = p.w;
                          draft.height = p.h;
                        });
                      }}
                    >
                      <option value="custom">Custom size</option>
                      {PRESETS.map((p, idx) => (
                        <option key={p.id} value={String(idx)}>
                          {p.name} ({p.w} × {p.h})
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="form-grid-2">
                    <label className="form-field">
                      <span>Width</span>
                      <input
                        type="number"
                        min="50"
                        max="10000"
                        value={doc.width}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!Number.isInteger(val) || val < 50 || val > 10000) return;
                          mutate((draft) => {
                            draft.width = val;
                          });
                        }}
                      />
                    </label>
                    <label className="form-field">
                      <span>Height</span>
                      <input
                        type="number"
                        min="50"
                        max="10000"
                        value={doc.height}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!Number.isInteger(val) || val < 50 || val > 10000) return;
                          mutate((draft) => {
                            draft.height = val;
                          });
                        }}
                      />
                    </label>
                  </div>

                  <label className="form-field">
                    <span>Background</span>
                    <input
                      type="color"
                      value={cleanColor(doc.background) ? doc.background : '#ffffff'}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        mutate((draft) => {
                          draft.background = val;
                        });
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    className="inspector-action"
                    onClick={handleAddText}
                  >
                    ＋ Add text layer
                  </button>
                  <button
                    type="button"
                    className="inspector-action"
                    onClick={handleAddShape}
                  >
                    ＋ Add shape layer
                  </button>
                  <button
                    type="button"
                    className="inspector-action"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    ＋ Upload image
                  </button>

                  <div className="inspector-note">
                    Canvas sizes are CSS pixels. Print bleeds, crop marks and professional CMYK/color profiles are not included.
                  </div>

                  <h3>Layers</h3>
                  <div className="layers-list">
                    {doc.elements.length === 0 ? (
                      <p className="inspector-note">No layers yet.</p>
                    ) : (
                      [...doc.elements].reverse().map((el) => (
                        <button
                          key={el.id}
                          type="button"
                          className={`layer-row ${el.id === selectedId ? 'selected' : ''}`}
                          onClick={() => setSelectedId(el.id)}
                        >
                          <span className="layer-type">
                            {el.type === 'text' ? 'T' : el.type === 'shape' ? '▱' : '▧'}
                          </span>
                          <span className="layer-title">{el.name}</span>
                          <span>{el.id === selectedId ? '●' : ''}</span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
