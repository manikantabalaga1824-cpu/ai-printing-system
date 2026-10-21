/**
 * AI PrintOS — Main Application Controller
 * Modular, Vanilla JavaScript (ES6+)
 * Fully integrated with Gboard-style Virtual Keyboard
 */

import { VirtualKeyboard } from './keyboard/keyboard.js';

(() => {
  'use strict';

  // --- Helpers & Utilities ---
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36).slice(-4)}`;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const safeSlug = (value) =>
    String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'design';
  const nowISO = () => new Date().toISOString();
  const HEX = /^#[0-9a-f]{6}$/i;
  const STORAGE_PREFIX = 'aiprintos:workspace:v1:';
  const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

  const FONT_STACK = "'DM Sans',system-ui,-apple-system,'Noto Sans Telugu','Nirmala UI','Gautami',sans-serif";
  const SERIF_STACK = "Georgia,'Noto Serif Telugu','Nirmala UI',serif";
  const MONO_STACK = "'DM Mono',ui-monospace,monospace";

  const PRESETS = [
    { id: 'business', name: 'Business card', w: 1050, h: 600, category: 'Branding' },
    { id: 'a4', name: 'A4 portrait', w: 794, h: 1123, category: 'Print' },
    { id: 'poster', name: 'Poster', w: 900, h: 1200, category: 'Print' },
    { id: 'square', name: 'Social post', w: 1080, h: 1080, category: 'Digital' },
    { id: 'story', name: 'Story', w: 1080, h: 1920, category: 'Digital' },
    { id: 'invite', name: 'Invitation', w: 720, h: 1008, category: 'Events' },
    { id: 'flyer', name: 'Flyer', w: 794, h: 1123, category: 'Print' },
    { id: 'certificate', name: 'Certificate', w: 1123, h: 794, category: 'Events' },
  ];

  const TEMPLATE_DATA = [
    {
      id: 'modern-card',
      name: 'Modern studio card',
      category: 'Branding',
      preset: 'business',
      bg: '#172a32',
      accent: '#75e6d0',
      title: 'MAKE IT',
      sub: 'Studio / Print / Design',
      elements: [
        { type: 'text', name: 'Brand title', text: 'MAKE IT', x: 62, y: 90, w: 590, h: 145, size: 104, weight: 800, font: 'sans', color: '#f8f7f0', align: 'left', lh: 1.0 },
        { type: 'shape', name: 'Mint bar', shape: 'rect', x: 66, y: 272, w: 185, h: 10, fill: '#75e6d0', stroke: 'transparent', sw: 0, radius: 0 },
        { type: 'text', name: 'Description', text: 'PRINT · CREATE · REPEAT', x: 66, y: 322, w: 500, h: 45, size: 25, weight: 600, font: 'mono', color: '#c0d7d4', align: 'left', lh: 1.4 },
        { type: 'shape', name: 'Accent circle', shape: 'ellipse', x: 820, y: -70, w: 270, h: 270, fill: '#ff947c', stroke: 'transparent', sw: 0, radius: 0 },
      ],
    },
    {
      id: 'botanical',
      name: 'Botanical poster',
      category: 'Print',
      preset: 'poster',
      bg: '#f1eddf',
      accent: '#7c9b69',
      title: 'GROW\nSLOW.',
      sub: 'A LITTLE EVERY DAY',
      elements: [
        { type: 'shape', name: 'Green circle', shape: 'ellipse', x: 390, y: 85, w: 420, h: 420, fill: '#7c9b69', stroke: 'transparent', sw: 0, radius: 0 },
        { type: 'shape', name: 'Stem', shape: 'rect', x: 586, y: 215, w: 12, h: 490, fill: '#2d5549', stroke: 'transparent', sw: 0, radius: 6 },
        { type: 'text', name: 'Poster title', text: 'GROW\nSLOW.', x: 63, y: 570, w: 760, h: 300, size: 116, weight: 800, font: 'sans', color: '#263f35', align: 'left', lh: 1.0 },
        { type: 'text', name: 'Footer', text: 'A LITTLE EVERY DAY  ·  Nº 04', x: 66, y: 1005, w: 700, h: 35, size: 20, weight: 500, font: 'mono', color: '#61755d', align: 'left', lh: 1.4 },
      ],
    },
    {
      id: 'celebration',
      name: 'Celebration invite',
      category: 'Events',
      preset: 'invite',
      bg: '#fbf4e8',
      accent: '#cf8b71',
      title: 'LET’S\nCELEBRATE',
      sub: 'SAVE THE DATE',
      elements: [
        { type: 'shape', name: 'Frame', shape: 'rect', x: 34, y: 34, w: 652, h: 940, fill: 'transparent', stroke: '#c68d73', sw: 3, radius: 0 },
        { type: 'text', name: 'Eyebrow', text: 'YOU ARE WARMLY INVITED', x: 75, y: 140, w: 570, h: 42, size: 20, weight: 500, font: 'mono', color: '#8e6959', align: 'center', lh: 1.5 },
        { type: 'text', name: 'Headline', text: 'LET’S\nCELEBRATE', x: 65, y: 275, w: 590, h: 280, size: 74, weight: 700, font: 'serif', color: '#3a5146', align: 'center', lh: 1.18 },
        { type: 'shape', name: 'Accent disc', shape: 'ellipse', x: 287, y: 622, w: 146, h: 146, fill: '#dfb5a2', stroke: 'transparent', sw: 0, radius: 0 },
        { type: 'text', name: 'Event details', text: 'SATURDAY · 6 PM\nYOUR PLACE / CITY', x: 100, y: 805, w: 520, h: 75, size: 23, weight: 500, font: 'mono', color: '#806451', align: 'center', lh: 1.5 },
      ],
    },
    {
      id: 'social-wave',
      name: 'Social / Make waves',
      category: 'Digital',
      preset: 'square',
      bg: '#34334b',
      accent: '#c8b8f7',
      title: 'MAKE\nWAVES',
      sub: 'STAY CURIOUS',
      elements: [
        { type: 'shape', name: 'Lilac orb', shape: 'ellipse', x: 600, y: -110, w: 520, h: 520, fill: '#c8b8f7', stroke: 'transparent', sw: 0, radius: 0 },
        { type: 'shape', name: 'Peach orb', shape: 'ellipse', x: -185, y: 660, w: 390, h: 390, fill: '#ff957e', stroke: 'transparent', sw: 0, radius: 0 },
        { type: 'text', name: 'Headline', text: 'MAKE\nWAVES', x: 65, y: 320, w: 880, h: 350, size: 142, weight: 800, font: 'sans', color: '#ffffff', align: 'left', lh: 0.95 },
        { type: 'text', name: 'Caption', text: 'STAY CURIOUS  /  KEEP MOVING', x: 70, y: 885, w: 770, h: 44, size: 24, weight: 500, font: 'mono', color: '#e1dafa', align: 'left', lh: 1.4 },
      ],
    },
    {
      id: 'sale-flyer',
      name: 'Print shop offer',
      category: 'Print',
      preset: 'flyer',
      bg: '#fff8ef',
      accent: '#ff947c',
      title: 'A BETTER\nKIND OF PRINT.',
      sub: 'MADE TO BE SEEN',
      elements: [
        { type: 'shape', name: 'Coral header', shape: 'rect', x: 0, y: 0, w: 794, h: 265, fill: '#ff947c', stroke: 'transparent', sw: 0, radius: 0 },
        { type: 'text', name: 'Top label', text: 'PRINT STUDIO  /  SPECIAL DROP', x: 54, y: 36, w: 660, h: 40, size: 20, weight: 600, font: 'mono', color: '#27343b', align: 'left', lh: 1.4 },
        { type: 'text', name: 'Headline', text: 'A BETTER\nKIND OF PRINT.', x: 54, y: 95, w: 680, h: 160, size: 62, weight: 800, font: 'sans', color: '#1b2a31', align: 'left', lh: 1.05 },
        { type: 'text', name: 'Offer details', text: 'Posters · Cards · Flyers · Invitations', x: 55, y: 360, w: 680, h: 55, size: 24, weight: 600, font: 'sans', color: '#34434c', align: 'left', lh: 1.5 },
        { type: 'shape', name: 'Mint highlight', shape: 'rect', x: 55, y: 455, w: 220, h: 8, fill: '#7be7d2', stroke: 'transparent', sw: 0, radius: 0 },
        { type: 'text', name: 'Subheading', text: 'MADE TO BE SEEN.', x: 55, y: 515, w: 670, h: 90, size: 42, weight: 700, font: 'serif', color: '#1f3b39', align: 'left', lh: 1.2 },
        { type: 'text', name: 'Footer', text: 'YOUR BRAND. YOUR FORMAT. YOUR FINISH.', x: 55, y: 1030, w: 680, h: 32, size: 17, weight: 500, font: 'mono', color: '#8a7c70', align: 'left', lh: 1.4 },
      ],
    },
    {
      id: 'telugu-greeting',
      name: 'Telugu greeting',
      category: 'Events',
      preset: 'square',
      bg: '#fff0c5',
      accent: '#217a55',
      title: 'ఉగాది\nశుభాకాంక్షలు',
      sub: 'HAPPY UGADI',
      elements: [
        { type: 'shape', name: 'Green circle', shape: 'ellipse', x: -185, y: 610, w: 700, h: 700, fill: '#217a55', stroke: 'transparent', sw: 0, radius: 0 },
        { type: 'shape', name: 'Sun', shape: 'ellipse', x: 720, y: 70, w: 240, h: 240, fill: '#e68b6f', stroke: 'transparent', sw: 0, radius: 0 },
        { type: 'text', name: 'Telugu greeting', text: 'ఉగాది\nశుభాకాంక్షలు', x: 75, y: 250, w: 900, h: 340, size: 92, weight: 700, font: 'sans', color: '#2d4a3a', align: 'center', lh: 1.35 },
        { type: 'text', name: 'English sign-off', text: 'HAPPY UGADI  ·  A NEW BEGINNING', x: 120, y: 755, w: 840, h: 46, size: 20, weight: 600, font: 'mono', color: '#8b613b', align: 'center', lh: 1.4 },
      ],
    },
    {
      id: 'quiet-certificate',
      name: 'Quiet certificate',
      category: 'Events',
      preset: 'certificate',
      bg: '#fffdf6',
      accent: '#ab9460',
      title: 'Certificate\nof appreciation',
      sub: 'PRESENTED WITH GRATITUDE',
      elements: [
        { type: 'shape', name: 'Outer border', shape: 'rect', x: 28, y: 28, w: 1067, h: 738, fill: 'transparent', stroke: '#ab9460', sw: 3, radius: 0 },
        { type: 'shape', name: 'Inner border', shape: 'rect', x: 43, y: 43, w: 1037, h: 708, fill: 'transparent', stroke: '#e0d5b8', sw: 2, radius: 0 },
        { type: 'text', name: 'Heading', text: 'Certificate\nof appreciation', x: 120, y: 160, w: 880, h: 160, size: 62, weight: 600, font: 'serif', color: '#344c42', align: 'center', lh: 1.1 },
        { type: 'text', name: 'Recipient', text: 'Presented to  /  Recipient Name', x: 160, y: 395, w: 800, h: 45, size: 22, weight: 500, font: 'mono', color: '#947d54', align: 'center', lh: 1.5 },
        { type: 'text', name: 'Reason', text: 'With thanks for your time, care and contribution.', x: 150, y: 470, w: 820, h: 50, size: 25, weight: 400, font: 'serif', color: '#5a645e', align: 'center', lh: 1.5 },
      ],
    },
  ];

  const clone = (val) => JSON.parse(JSON.stringify(val));
  const makeElement = (type, extra = {}) => ({
    id: uid(type[0]),
    type,
    name: type === 'text' ? 'Text' : type === 'shape' ? 'Shape' : 'Image',
    x: 80,
    y: 80,
    w: type === 'text' ? 420 : 180,
    h: type === 'text' ? 90 : 140,
    opacity: 1,
    ...extra,
  });

  const state = {
    view: 'home',
    doc: null,
    selected: null,
    undo: [],
    redo: [],
    dirty: false,
    scale: 1,
    drag: null,
    inspectorTab: 'properties',
    templateCategory: 'All',
    templateQuery: '',
    aiImage: null,
    aiBusy: false,
  };

  function toast(message, error = false) {
    const item = document.createElement('div');
    item.className = `toast${error ? ' error' : ''}`;
    item.textContent = message;
    $('#toast-region').append(item);
    window.setTimeout(() => item.remove(), error ? 6500 : 3500);
  }

  function cleanColor(value, allowTransparent = false) {
    return HEX.test(value) || (allowTransparent && value === 'transparent');
  }

  function validateDocument(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Project JSON must contain an object.');
    if (input.version !== 1) throw new Error('Unsupported project version.');
    if (typeof input.id !== 'string' || input.id.length > 100) throw new Error('Invalid project ID.');
    if (typeof input.name !== 'string' || input.name.length > 120) throw new Error('Project name must be at most 120 characters.');
    const width = Number(input.width), height = Number(input.height);
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 50 || height < 50 || width > 10000 || height > 10000) {
      throw new Error('Canvas dimensions must be whole numbers from 50 to 10000.');
    }
    if (!cleanColor(input.background)) throw new Error('Invalid background color.');
    if (!Array.isArray(input.elements) || input.elements.length > 300) throw new Error('A project may contain at most 300 elements.');

    const seen = new Set();
    const elements = input.elements.map((raw, index) => {
      if (!raw || typeof raw !== 'object' || !['text', 'shape', 'image'].includes(raw.type)) throw new Error(`Invalid element at index ${index}.`);
      if (typeof raw.id !== 'string' || raw.id.length > 100 || seen.has(raw.id)) throw new Error(`Invalid or duplicate element ID at index ${index}.`);
      seen.add(raw.id);

      const num = (key, min, max) => {
        const n = Number(raw[key]);
        if (!Number.isFinite(n) || n < min || n > max) throw new Error(`Invalid ${key} for element ${index}.`);
        return n;
      };

      const element = {
        id: raw.id,
        type: raw.type,
        name: String(raw.name || raw.type).slice(0, 100),
        x: num('x', -100000, 100000),
        y: num('y', -100000, 100000),
        w: num('w', 1, 100000),
        h: num('h', 1, 100000),
        opacity: num('opacity', 0, 1),
      };

      if (raw.type === 'text') {
        if (typeof raw.text !== 'string' || raw.text.length > 12000) throw new Error(`Invalid text content in element ${index}.`);
        if (!cleanColor(raw.color)) throw new Error(`Invalid text color in element ${index}.`);
        element.text = raw.text;
        element.color = raw.color;
        element.size = num('size', 1, 1000);
        element.weight = [400, 500, 600, 700, 800].includes(raw.weight) ? raw.weight : 400;
        element.align = ['left', 'center', 'right'].includes(raw.align) ? raw.align : 'left';
        element.lh = num('lh', 0.5, 3);
        element.font = ['sans', 'serif', 'mono'].includes(raw.font) ? raw.font : 'sans';
      } else if (raw.type === 'shape') {
        if (!['rect', 'ellipse'].includes(raw.shape)) throw new Error(`Invalid shape at element ${index}.`);
        if (!cleanColor(raw.fill, true) || !cleanColor(raw.stroke, true)) throw new Error(`Invalid shape color at element ${index}.`);
        element.shape = raw.shape;
        element.fill = raw.fill;
        element.stroke = raw.stroke;
        element.sw = num('sw', 0, 100);
        element.radius = num('radius', 0, 1000);
      } else {
        if (typeof raw.src !== 'string' || raw.src.length > 8500000 || !/^data:image\/(png|jpeg|webp);base64,/.test(raw.src)) {
          throw new Error(`Images must be embedded PNG, JPEG or WebP files (element ${index}).`);
        }
        element.src = raw.src;
        element.alt = String(raw.alt || '').slice(0, 300);
        element.fit = ['contain', 'cover', 'fill'].includes(raw.fit) ? raw.fit : 'contain';
      }
      return element;
    });

    return {
      id: input.id,
      version: 1,
      name: input.name,
      width,
      height,
      background: input.background,
      elements,
      created: typeof input.created === 'string' && Number.isFinite(Date.parse(input.created)) ? input.created : nowISO(),
      updated: typeof input.updated === 'string' && Number.isFinite(Date.parse(input.updated)) ? input.updated : nowISO(),
    };
  }

  const storage = {
    all() {
      const list = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_PREFIX)) {
            try {
              list.push(validateDocument(JSON.parse(localStorage.getItem(key))));
            } catch (e) {
              console.warn('Skipped invalid project:', e.message);
            }
          }
        }
      } catch (_e) {
        return { ok: false, error: 'Browser storage is unavailable.' };
      }
      return { ok: true, docs: list.sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated)) };
    },
    get(id) {
      try {
        const raw = localStorage.getItem(STORAGE_PREFIX + id);
        if (!raw) return { ok: false, error: 'Project not found in this browser.' };
        return { ok: true, doc: validateDocument(JSON.parse(raw)) };
      } catch (_e) {
        return { ok: false, error: 'Locally saved project could not be read.' };
      }
    },
    save(doc) {
      try {
        doc.updated = nowISO();
        localStorage.setItem(STORAGE_PREFIX + doc.id, JSON.stringify(doc));
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e?.name === 'QuotaExceededError' ? 'Browser storage full. Export JSON to backup.' : 'Could not save project.',
        };
      }
    },
    remove(id) {
      try {
        localStorage.removeItem(STORAGE_PREFIX + id);
        return { ok: true };
      } catch (_e) {
        return { ok: false, error: 'Browser storage unavailable.' };
      }
    },
  };

  function downloadBlob(name, blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function downloadJSON(doc) {
    downloadBlob(`${safeSlug(doc.name)}.aiprintos.json`, new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' }));
  }

  function templateDocument(template) {
    const preset = PRESETS.find((p) => p.id === template.preset) || PRESETS[1];
    return {
      id: uid('project'),
      version: 1,
      name: template.name,
      width: preset.w,
      height: preset.h,
      background: template.bg,
      elements: template.elements.map((el) => makeElement(el.type, { ...clone(el), id: uid(el.type[0]) })),
      created: nowISO(),
      updated: nowISO(),
    };
  }

  function blankDocument(name = 'Untitled design', preset = PRESETS[1]) {
    return {
      id: uid('project'),
      version: 1,
      name,
      width: preset.w,
      height: preset.h,
      background: '#ffffff',
      elements: [],
      created: nowISO(),
      updated: nowISO(),
    };
  }

  // Accessible in-page confirmation modal replacing window.confirm
  let pendingModalAction = null;
  function showConfirmModal(title, message, onConfirm) {
    const modal = $('#confirm-modal');
    $('#confirm-modal-title').textContent = title;
    $('#confirm-modal-message').textContent = message;
    pendingModalAction = onConfirm;
    modal.hidden = false;
  }
  $('#confirm-modal-cancel').addEventListener('click', () => {
    $('#confirm-modal').hidden = true;
    pendingModalAction = null;
  });
  $('#confirm-modal-ok').addEventListener('click', () => {
    $('#confirm-modal').hidden = true;
    if (pendingModalAction) {
      pendingModalAction();
      pendingModalAction = null;
    }
  });

  // --- Virtual Keyboard Initialization ---
  let vKeyboard = null;

  function initVirtualKeyboard() {
    vKeyboard = new VirtualKeyboard({
      container: $('#keyboard-dock'),
      onTextChange: (newText, inputEl) => {
        const el = getElement();
        if (el && el.type === 'text') {
          el.text = newText;
          state.doc.updated = nowISO();
          markDirty();
          renderCanvas();
        }
      },
      onRequestSelectTextLayer: () => {
        // If a text element is already selected, return it
        const current = getElement();
        if (current && current.type === 'text') {
          const textarea = $('#inspector-content textarea[data-property="text"]');
          return { element: current, input: textarea };
        }
        // If another layer is selected or none, find existing text layer or create one
        let textEl = state.doc?.elements.find((i) => i.type === 'text');
        if (!textEl) {
          textEl = addElement('text', false); // don't open keyboard recursively
        } else {
          state.selected = textEl.id;
          state.inspectorTab = 'properties';
          renderCanvas();
          renderInspector();
        }
        const textarea = $('#inspector-content textarea[data-property="text"]');
        return { element: textEl, input: textarea };
      },
    });
  }

  // --- Views & Navigation ---
  function setView(name) {
    if (!$('#view-' + name)) name = 'home';
    state.view = name;
    $$('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
    $$('[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
    $('#current-crumb').textContent =
      {
        home: 'Overview',
        editor: 'Design editor',
        templates: 'Template library',
        projects: 'My projects',
        ai: 'AI image studio',
        integrations: 'Integrations & setup',
      }[name] || 'Workspace';

    if (name === 'editor' && state.doc) requestAnimationFrame(fitCanvas);
    if (name === 'templates') renderTemplateViews();
    if (name === 'projects' || name === 'home') renderProjects();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function updateSavedIndicator() {
    const node = $('#global-save-state');
    node.replaceChildren(Object.assign(document.createElement('i'), { className: '' }), document.createTextNode(state.dirty ? ' Unsaved changes' : ' Saved locally'));
    node.querySelector('i').style.background = state.dirty ? '#e7a34f' : '#5dc49f';
  }

  function markDirty() {
    state.dirty = true;
    updateSavedIndicator();
  }

  function snapshot() {
    return JSON.stringify(state.doc);
  }

  function pushUndo(previous) {
    state.undo.push(previous);
    if (state.undo.length > 80) state.undo.shift();
    state.redo = [];
    updateUndoButtons();
  }

  function mutate(callback, render = true) {
    if (!state.doc) return;
    pushUndo(snapshot());
    callback();
    markDirty();
    if (render) {
      renderCanvas();
      renderInspector();
    }
    updateUndoButtons();
  }

  function restoreSnapshot(json) {
    state.doc = validateDocument(JSON.parse(json));
    $('#design-name').value = state.doc.name;
    if (!state.doc.elements.some((el) => el.id === state.selected)) state.selected = null;
    state.dirty = true;
    renderCanvas();
    renderInspector();
    updateUndoButtons();
    updateSavedIndicator();
  }

  function undo() {
    if (!state.undo.length) return;
    state.redo.push(snapshot());
    restoreSnapshot(state.undo.pop());
  }

  function redo() {
    if (!state.redo.length) return;
    state.undo.push(snapshot());
    restoreSnapshot(state.redo.pop());
  }

  function updateUndoButtons() {
    $('#undo').disabled = !state.undo.length;
    $('#redo').disabled = !state.redo.length;
  }

  function saveProject() {
    if (!state.doc) {
      toast('Open a design first.', true);
      return false;
    }
    state.doc.name = $('#design-name').value.trim().slice(0, 120) || 'Untitled design';
    $('#design-name').value = state.doc.name;
    const res = storage.save(state.doc);
    if (!res.ok) {
      toast(res.error, true);
      return false;
    }
    state.dirty = false;
    state.undo = [];
    state.redo = [];
    updateSavedIndicator();
    updateUndoButtons();
    renderProjects();
    toast(`Saved “${state.doc.name}” in this browser.`);
    return true;
  }

  function openProject(doc) {
    state.doc = validateDocument(doc);
    state.selected = null;
    state.undo = [];
    state.redo = [];
    state.dirty = false;
    state.inspectorTab = 'properties';
    if (vKeyboard) vKeyboard.close();
    $('#design-name').value = state.doc.name;
    $('#canvas-size').textContent = `${state.doc.width} × ${state.doc.height} px`;
    renderCanvas();
    renderInspector();
    fitCanvas();
    updateUndoButtons();
    updateSavedIndicator();
    setView('editor');
  }

  function openSavedProject(id) {
    const res = storage.get(id);
    if (!res.ok) {
      toast(res.error, true);
      return;
    }
    openProject(res.doc);
  }

  function createBlank(name, preset) {
    const doc = blankDocument(name, preset);
    openProject(doc);
    markDirty();
    toast('Blank canvas ready. Save when you want to keep it.');
  }

  function useTemplate(id) {
    const item = TEMPLATE_DATA.find((t) => t.id === id);
    if (!item) return;
    openProject(templateDocument(item));
    markDirty();
    toast(`Loaded “${item.name}”. Edit the text before exporting.`);
  }

  function getElement(id = state.selected) {
    return state.doc?.elements.find((el) => el.id === id) || null;
  }

  function fontFor(el) {
    return el.font === 'serif' ? SERIF_STACK : el.font === 'mono' ? MONO_STACK : FONT_STACK;
  }

  // --- Canvas Rendering & Geometry ---
  function renderElement(el, selected = false) {
    const style = `left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;opacity:${el.opacity};`;
    if (el.type === 'text') {
      const isTe = /[\u0C00-\u0C7F]/.test(el.text);
      return `<div class="design-el${selected ? ' selected' : ''}" data-element-id="${el.id}" lang="${isTe ? 'te' : 'en'}" style="${style}font-family:${fontFor(el)};font-size:${el.size}px;font-weight:${el.weight};color:${el.color};text-align:${el.align};line-height:${el.lh};">${escapeHTML(el.text)}${selected ? '<span class="resize-handle" data-resize="1" aria-label="Resize text"></span>' : ''}</div>`;
    }
    if (el.type === 'shape') {
      return `<div class="design-el${selected ? ' selected' : ''}" data-element-id="${el.id}" style="${style}background:${el.fill};border:${el.sw ? `${el.sw}px solid ${el.stroke}` : '0'};border-radius:${el.shape === 'ellipse' ? '50%' : `${el.radius}px`};">${selected ? '<span class="resize-handle" data-resize="1" aria-label="Resize shape"></span>' : ''}</div>`;
    }
    return `<div class="design-el${selected ? ' selected' : ''}" data-element-id="${el.id}" style="${style}"><img alt="${escapeHTML(el.alt)}" src="${el.src}" style="object-fit:${el.fit}">${selected ? '<span class="resize-handle" data-resize="1" aria-label="Resize image"></span>' : ''}</div>`;
  }

  function renderCanvas() {
    if (!state.doc) return;
    const stage = $('#canvas-stage');
    stage.style.width = state.doc.width + 'px';
    stage.style.height = state.doc.height + 'px';
    stage.style.background = state.doc.background;
    stage.innerHTML = state.doc.elements.map((el) => renderElement(el, el.id === state.selected)).join('');
    $('#canvas-size').textContent = `${state.doc.width} × ${state.doc.height} px`;
    $('#canvas-selection').textContent = getElement()?.name || 'No selection';
  }

  function fitCanvas() {
    if (!state.doc || state.view !== 'editor') return;
    const box = $('#canvas-stage-wrap');
    if (!box) return;
    const maxWidth = Math.max(100, box.clientWidth - 35);
    const maxHeight = Math.max(140, box.clientHeight - 32);
    state.scale = Math.min(maxWidth / state.doc.width, maxHeight / state.doc.height, 1);
    const stage = $('#canvas-stage');
    stage.style.transform = `scale(${state.scale})`;
    stage.style.margin = `${Math.max(0, (state.doc.height * state.scale - state.doc.height) / 2)}px auto`;
    stage.style.transformOrigin = 'center center';
    stage.style.flex = 'none';
  }

  // --- Inspector Panel ---
  function field(label, prop, value, type = 'text', extra = '') {
    return `<label class="form-field"><span>${label}</span><input type="${type}" data-property="${prop}" value="${escapeHTML(value)}" ${extra}></label>`;
  }
  function numberField(label, prop, value, min = -100000, max = 100000, step = 1) {
    return field(label, prop, value, 'number', `min="${min}" max="${max}" step="${step}"`);
  }
  function selectField(label, prop, value, options) {
    return `<label class="form-field"><span>${label}</span><select data-property="${prop}">${options.map(([val, title]) => `<option value="${escapeHTML(val)}" ${String(val) === String(value) ? 'selected' : ''}>${escapeHTML(title)}</option>`).join('')}</select></label>`;
  }
  function colorField(label, prop, value) {
    return `<label class="form-field"><span>${label}</span><input type="color" data-property="${prop}" value="${HEX.test(value) ? value : '#ffffff'}"></label>`;
  }
  function layerList() {
    if (!state.doc.elements.length) return '<p class="inspector-note">No layers yet. Add text, a shape or an image to begin.</p>';
    return `<div class="layers-list">${[...state.doc.elements].reverse().map((el) => `<button type="button" class="layer-row ${el.id === state.selected ? 'selected' : ''}" data-select-element="${el.id}"><span class="layer-type">${el.type === 'text' ? 'T' : el.type === 'shape' ? '▱' : '▧'}</span><span class="layer-title">${escapeHTML(el.name || el.type)}</span><span>${el.id === state.selected ? '●' : ''}</span></button>`).join('')}</div>`;
  }

  function renderInspector() {
    const el = getElement();
    $('#layer-count').textContent = String(state.doc?.elements.length || 0);
    $$('[data-inspector-tab]').forEach((tab) => tab.classList.toggle('active', tab.dataset.inspectorTab === state.inspectorTab));
    const box = $('#inspector-content');
    if (!state.doc) {
      box.innerHTML = '<p class="inspector-note">Start a design to reveal the canvas properties.</p>';
      return;
    }

    if (state.inspectorTab === 'layers') {
      box.innerHTML = `<h3>Object layers</h3><p class="inspector-note">Select a layer to edit it. The list shows frontmost items first.</p>${layerList()}${el ? '<button type="button" class="inspector-action danger" data-delete-element>Delete selected layer</button>' : ''}`;
      return;
    }

    if (!el) {
      const presetIndex = PRESETS.findIndex((p) => p.w === state.doc.width && p.h === state.doc.height);
      box.innerHTML = `<h3>Canvas settings</h3><p class="inspector-note">Choose an element to edit its style, or adjust the canvas below.</p>${selectField('Canvas preset', 'preset', presetIndex >= 0 ? String(presetIndex) : 'custom', [['custom', 'Custom size'], ...PRESETS.map((p, i) => [String(i), `${p.name} (${p.w} × ${p.h})`])])}<div class="form-grid-2">${numberField('Width', 'canvas-width', state.doc.width, 50, 10000)}${numberField('Height', 'canvas-height', state.doc.height, 50, 10000)}</div>${colorField('Background', 'canvas-background', state.doc.background)}<button type="button" class="inspector-action" data-add="text">＋ Add text layer</button><button type="button" class="inspector-action" data-add="rect">＋ Add shape layer</button><button type="button" class="inspector-action" data-add="image">＋ Upload image</button><div class="inspector-note">Canvas sizes are CSS pixels. Print bleeds and CMYK profiles are not included.</div><h3>Layers</h3>${layerList()}`;
      return;
    }

    let body = `<h3>${el.type === 'text' ? 'Text layer' : el.type === 'shape' ? 'Shape layer' : 'Image layer'}</h3>${field('Layer name', 'name', el.name)}<div class="form-grid-2">${numberField('X', 'x', el.x)}${numberField('Y', 'y', el.y)}</div><div class="form-grid-2">${numberField('Width', 'w', el.w, 1, 100000)}${numberField('Height', 'h', el.h, 1, 100000)}</div><label class="form-field"><span>Opacity · <b id="opacity-label">${Math.round(el.opacity * 100)}%</b></span><input type="range" min="0" max="1" step=".05" data-property="opacity" value="${el.opacity}"></label>`;

    if (el.type === 'text') {
      const isTe = /[\u0C00-\u0C7F]/.test(el.text);
      body += `<label class="form-field"><span>Text content</span><textarea data-property="text" rows="4" maxlength="12000" lang="${isTe ? 'te' : 'en'}">${escapeHTML(el.text)}</textarea></label><div class="form-grid-2">${numberField('Font size', 'size', el.size, 1, 1000)}${selectField('Font family', 'font', el.font, [['sans', 'Sans'], ['serif', 'Serif'], ['mono', 'Mono']])}</div><div class="form-grid-2">${selectField('Weight', 'weight', el.weight, [[400, 'Regular'], [500, 'Medium'], [600, 'Semibold'], [700, 'Bold'], [800, 'Extra bold']])}${selectField('Align', 'align', el.align, [['left', 'Left'], ['center', 'Center'], ['right', 'Right']])}</div><div class="form-grid-2">${colorField('Text color', 'color', el.color)}${numberField('Line spacing', 'lh', el.lh, 0.5, 3, 0.1)}</div><button type="button" class="inspector-action" data-focus-keyboard>⌨ Open Gboard Virtual Keyboard</button><p class="inspector-note">Telugu text can be entered directly or using English-to-Telugu phonetic transliteration.</p>`;
    } else if (el.type === 'shape') {
      body += `${selectField('Shape', 'shape', el.shape, [['rect', 'Rectangle'], ['ellipse', 'Ellipse']])}<div class="form-grid-2">${colorField('Fill', 'fill', el.fill === 'transparent' ? '#ffffff' : el.fill)}${colorField('Border', 'stroke', el.stroke === 'transparent' ? '#ffffff' : el.stroke)}</div><div class="form-grid-2">${numberField('Border width', 'sw', el.sw, 0, 100)}${numberField('Corner radius', 'radius', el.radius, 0, 1000)}</div><label class="form-field"><span><input type="checkbox" data-transparent-fill ${el.fill === 'transparent' ? 'checked' : ''}> Transparent fill</span></label>`;
    } else {
      body += `${selectField('Image fit', 'fit', el.fit, [['contain', 'Contain'], ['cover', 'Cover'], ['fill', 'Stretch']])}${field('Alternative text', 'alt', el.alt)}<button type="button" class="inspector-action" data-replace-image>Replace image</button><p class="inspector-note">Use images you own or have permission to print.</p>`;
    }

    body += `<div class="two-action-row"><button type="button" class="inspector-action" data-duplicate-element>Duplicate</button><button type="button" class="inspector-action danger" data-delete-element>Delete</button></div><div class="two-action-row"><button type="button" class="inspector-action" data-layer-move="back">Send backward</button><button type="button" class="inspector-action" data-layer-move="front">Bring forward</button></div><h3>All layers</h3>${layerList()}`;
    box.innerHTML = body;

    // Connect virtual keyboard if text layer is active
    if (el.type === 'text' && vKeyboard) {
      const textarea = box.querySelector('textarea[data-property="text"]');
      if (textarea) vKeyboard.setTargetInput(textarea);
    }
  }

  function addElement(type, openKbd = false) {
    if (!state.doc) {
      createBlank();
      return null;
    }
    if (type === 'image') {
      $('#image-file').click();
      return null;
    }
    const centerX = Math.round(state.doc.width * 0.12);
    const centerY = Math.round(state.doc.height * 0.12);
    let el;
    if (type === 'text') {
      el = makeElement('text', {
        name: 'New text',
        text: 'Your text',
        x: centerX,
        y: centerY,
        w: Math.round(state.doc.width * 0.68),
        h: Math.round(state.doc.height * 0.16),
        size: Math.max(28, Math.round(Math.min(state.doc.width, state.doc.height) * 0.065)),
        weight: 700,
        font: 'sans',
        color: '#202832',
        align: 'left',
        lh: 1.2,
      });
    } else {
      el = makeElement('shape', {
        name: 'Rectangle',
        shape: 'rect',
        x: centerX,
        y: centerY,
        w: Math.round(state.doc.width * 0.36),
        h: Math.round(state.doc.height * 0.22),
        fill: '#75e6d0',
        stroke: 'transparent',
        sw: 0,
        radius: 8,
      });
    }

    mutate(() => {
      state.doc.elements.push(el);
      state.selected = el.id;
      state.inspectorTab = 'properties';
    });

    if (openKbd && type === 'text' && vKeyboard) {
      const textarea = $('#inspector-content textarea[data-property="text"]');
      vKeyboard.open(textarea);
    }
    return el;
  }

  function setCanvasProperty(prop, value) {
    if (!state.doc) return;
    if (prop === 'preset') {
      if (value === 'custom') return;
      const preset = PRESETS[Number(value)];
      if (!preset) return;
      mutate(() => {
        state.doc.width = preset.w;
        state.doc.height = preset.h;
      });
      fitCanvas();
      return;
    }
    if (prop === 'canvas-width' || prop === 'canvas-height') {
      const num = Number(value);
      if (!Number.isInteger(num) || num < 50 || num > 10000) {
        toast('Canvas dimension must be a whole number from 50 to 10000.', true);
        renderInspector();
        return;
      }
      mutate(() => {
        state.doc[prop === 'canvas-width' ? 'width' : 'height'] = num;
      });
      fitCanvas();
      return;
    }
    if (prop === 'canvas-background') {
      if (!cleanColor(value)) return;
      mutate(() => {
        state.doc.background = value.toUpperCase();
      });
    }
  }

  function propertyInput(target) {
    const el = getElement();
    if (!el) return;
    const prop = target.dataset.property;
    if (!prop) return;
    let value = target.value;
    if (['x', 'y', 'w', 'h', 'size', 'lh', 'sw', 'radius', 'opacity'].includes(prop)) {
      value = Number(value);
      if (!Number.isFinite(value)) return;
      const ranges = {
        x: [-100000, 100000],
        y: [-100000, 100000],
        w: [1, 100000],
        h: [1, 100000],
        size: [1, 1000],
        lh: [0.5, 3],
        sw: [0, 100],
        radius: [0, 1000],
        opacity: [0, 1],
      };
      value = clamp(value, ...ranges[prop]);
    }
    if (prop === 'weight') value = Number(value);
    if (['color', 'fill', 'stroke'].includes(prop) && !cleanColor(value, true)) return;

    mutate(() => {
      el[prop] = value;
    });

    if (prop === 'name') $('#canvas-selection').textContent = el.name;
    if (prop === 'opacity') $('#opacity-label').textContent = `${Math.round(value * 100)}%`;
  }

  function moveLayer(dir) {
    const idx = state.doc.elements.findIndex((el) => el.id === state.selected);
    if (idx < 0) return;
    const target = dir === 'front' ? idx + 1 : idx - 1;
    if (target < 0 || target >= state.doc.elements.length) return;
    mutate(() => {
      const [el] = state.doc.elements.splice(idx, 1);
      state.doc.elements.splice(target, 0, el);
    });
  }

  function duplicateSelected() {
    const el = getElement();
    if (!el) return;
    const copy = clone(el);
    copy.id = uid(el.type[0]);
    copy.name = `${copy.name} copy`.slice(0, 100);
    copy.x += 18;
    copy.y += 18;
    mutate(() => {
      state.doc.elements.push(copy);
      state.selected = copy.id;
    });
  }

  function deleteSelected() {
    const el = getElement();
    if (!el) return;
    mutate(() => {
      state.doc.elements = state.doc.elements.filter((item) => item.id !== el.id);
      state.selected = null;
    });
    toast('Layer deleted. Use Undo to restore it.');
  }

  // --- High Resolution PNG Canvas Export ---
  function imageLoad(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('The image could not be decoded.'));
      img.src = src;
    });
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const lines = [];
    for (const paragraph of text.split('\n')) {
      if (!paragraph) {
        lines.push('');
        continue;
      }
      let line = '';
      for (const word of paragraph.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width <= maxWidth || !line) {
          line = next;
        } else {
          lines.push(line);
          line = word;
        }
      }
      lines.push(line);
    }
    return lines;
  }

  async function exportPNG() {
    const doc = state.doc;
    if (!doc) throw new Error('No design is open.');
    const scale = Number($('#export-scale').value) || 1;
    const width = Math.round(doc.width * scale);
    const height = Math.round(doc.height * scale);

    if (width > 16000 || height > 16000 || width * height > 120000000) {
      throw new Error('Export dimensions are too large. Try a smaller scale.');
    }
    if (document.fonts?.ready) await document.fonts.ready;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas export unavailable.');

    ctx.scale(scale, scale);
    ctx.fillStyle = doc.background;
    ctx.fillRect(0, 0, doc.width, doc.height);

    for (const el of doc.elements) {
      ctx.save();
      ctx.globalAlpha = el.opacity;
      if (el.type === 'shape') {
        ctx.beginPath();
        if (el.shape === 'ellipse') {
          ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2, el.w / 2, el.h / 2, 0, 0, Math.PI * 2);
        } else if (ctx.roundRect) {
          ctx.roundRect(el.x, el.y, el.w, el.h, Math.min(el.radius, el.w / 2, el.h / 2));
        } else {
          ctx.rect(el.x, el.y, el.w, el.h);
        }
        if (el.fill !== 'transparent') {
          ctx.fillStyle = el.fill;
          ctx.fill();
        }
        if (el.sw && el.stroke !== 'transparent') {
          ctx.lineWidth = el.sw;
          ctx.strokeStyle = el.stroke;
          ctx.stroke();
        }
      } else if (el.type === 'image') {
        const img = await imageLoad(el.src);
        let x = el.x, y = el.y, w = el.w, h = el.h;
        if (el.fit === 'fill') {
          ctx.drawImage(img, x, y, w, h);
        } else {
          const r = img.width / img.height;
          const box = el.w / el.h;
          if ((el.fit === 'cover') === r > box) {
            h = el.h;
            w = h * r;
          } else {
            w = el.w;
            h = w / r;
          }
          x = el.x + (el.w - w) / 2;
          y = el.y + (el.h - h) / 2;
          ctx.beginPath();
          ctx.rect(el.x, el.y, el.w, el.h);
          ctx.clip();
          ctx.drawImage(img, x, y, w, h);
        }
      } else {
        ctx.beginPath();
        ctx.rect(el.x, el.y, el.w, el.h);
        ctx.clip();
        ctx.fillStyle = el.color;
        ctx.font = `${el.weight} ${el.size}px ${fontFor(el)}`;
        ctx.textBaseline = 'top';
        ctx.textAlign = el.align;
        const x = el.align === 'left' ? el.x : el.align === 'center' ? el.x + el.w / 2 : el.x + el.w;
        const lines = wrapCanvasText(ctx, el.text, el.w);
        lines.forEach((line, i) => ctx.fillText(line, x, el.y + i * el.size * el.lh, el.w));
      }
      ctx.restore();
    }

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    if (!blob) throw new Error('Browser could not produce PNG.');
    downloadBlob(`${safeSlug(doc.name)}.png`, blob);
  }

  // --- Templates & Projects Views Rendering ---
  function thumbHTML(t) {
    return `<div class="template-thumb" style="background:${t.bg};--thumb-accent:${t.accent}" aria-hidden="true"><span class="thumb-label" style="color:${t.bg === '#172a32' ? '#f7f6ef' : t.bg === '#34334b' ? '#fff' : t.bg === '#fffdf6' ? '#344c42' : t.bg === '#fbf4e8' ? '#3a5146' : t.bg === '#f1eddf' ? '#263f35' : t.bg === '#fff0c5' ? '#2d4a3a' : '#27343b'}">${escapeHTML(t.title)}</span></div>`;
  }

  function renderTemplateViews() {
    const home = $('#home-templates');
    home.innerHTML = TEMPLATE_DATA.slice(0, 3)
      .map((t) => `<button type="button" class="template-tile" data-use-template="${t.id}">${thumbHTML(t)}<span class="tile-name">${escapeHTML(t.name)}</span><span class="tile-meta">${escapeHTML(t.category)} · Editable</span></button>`)
      .join('');

    const categories = ['All', ...new Set(TEMPLATE_DATA.map((t) => t.category))];
    $('#template-filters').innerHTML = categories
      .map((cat) => `<button type="button" class="filter-chip ${state.templateCategory === cat ? 'active' : ''}" data-template-category="${escapeHTML(cat)}" aria-pressed="${state.templateCategory === cat}">${escapeHTML(cat)}</button>`)
      .join('');

    const q = state.templateQuery.trim().toLowerCase();
    const filtered = TEMPLATE_DATA.filter(
      (t) => (state.templateCategory === 'All' || t.category === state.templateCategory) && (!q || `${t.name} ${t.category}`.toLowerCase().includes(q))
    );

    $('#template-grid').innerHTML = filtered.length
      ? filtered.map((t) => `<button type="button" class="template-card" data-use-template="${t.id}">${thumbHTML(t)}<div class="template-card-footer"><strong>${escapeHTML(t.name)}</strong><span>${escapeHTML(t.category)}</span></div></button>`).join('')
      : '<div class="no-results"><strong>No templates found</strong>Try a different search or category.</div>';
  }

  function renderProjects() {
    const res = storage.all();
    const home = $('#home-projects');
    const grid = $('#project-grid');
    if (!res.ok) {
      home.innerHTML = `<div class="empty-inline">${escapeHTML(res.error)}</div>`;
      grid.innerHTML = `<div class="no-results">${escapeHTML(res.error)}</div>`;
      return;
    }
    const docs = res.docs;
    home.innerHTML = docs.length
      ? docs.slice(0, 4).map((d) => `<div class="recent-row"><div class="recent-thumb" style="background:${d.background}">${escapeHTML((d.elements.find((el) => el.type === 'text')?.text || d.name).slice(0, 2))}</div><div class="recent-main"><strong>${escapeHTML(d.name)}</strong><small>${d.width} × ${d.height}px · ${new Date(d.updated).toLocaleDateString()}</small></div><button type="button" class="text-button" data-open-project="${d.id}">Open ↗</button></div>`).join('')
      : '<div class="empty-inline">No projects saved yet. Start a design to see it here.</div>';

    grid.innerHTML = docs.length
      ? docs.map((d) => `<article class="project-card"><div class="template-thumb" style="background:${d.background};aspect-ratio:1/.75" aria-hidden="true"><span class="thumb-label" style="color:${d.elements.find((el) => el.type === 'text')?.color || '#26313b'}">${escapeHTML((d.elements.find((el) => el.type === 'text')?.text || d.name).slice(0, 34))}</span></div><div class="project-card-footer"><div style="min-width:0"><strong>${escapeHTML(d.name)}</strong><div class="tile-meta">${d.width} × ${d.height}px</div></div><button type="button" data-download-project="${d.id}" aria-label="Download ${escapeHTML(d.name)} JSON" title="Download project JSON">⇩</button></div><div class="two-action-row" style="margin-top:7px"><button type="button" class="inspector-action" data-open-project="${d.id}">Open project</button><button type="button" class="inspector-action danger" data-delete-project="${d.id}">Delete</button></div></article>`).join('')
      : '<div class="no-results"><strong>No projects saved yet</strong>Create a design, then save it to this browser.</div>';
  }

  // --- Global Event Listeners & Interaction ---
  document.addEventListener('click', (event) => {
    const viewBtn = event.target.closest('[data-view]');
    if (viewBtn) {
      setView(viewBtn.dataset.view);
      return;
    }
    const goto = event.target.closest('[data-goto]');
    if (goto) {
      setView(goto.dataset.goto);
      return;
    }
    const product = event.target.closest('[data-product]');
    if (product) {
      const preset = { 'Business card': 'business', Poster: 'poster', Invitation: 'invite', 'Social post': 'square' }[product.dataset.product] || 'a4';
      createBlank(product.dataset.product, PRESETS.find((p) => p.id === preset));
      return;
    }
    const tmpl = event.target.closest('[data-use-template]');
    if (tmpl) {
      useTemplate(tmpl.dataset.useTemplate);
      return;
    }
    const cat = event.target.closest('[data-template-category]');
    if (cat) {
      state.templateCategory = cat.dataset.templateCategory;
      renderTemplateViews();
      return;
    }
    const open = event.target.closest('[data-open-project]');
    if (open) {
      openSavedProject(open.dataset.openProject);
      return;
    }
    const saveDl = event.target.closest('[data-download-project]');
    if (saveDl) {
      const r = storage.get(saveDl.dataset.downloadProject);
      if (r.ok) downloadJSON(r.doc);
      else toast(r.error, true);
      return;
    }
    const del = event.target.closest('[data-delete-project]');
    if (del) {
      const id = del.dataset.deleteProject;
      showConfirmModal('Delete saved project?', 'This will delete this project from your browser local storage. This action cannot be undone.', () => {
        const r = storage.remove(id);
        if (r.ok) {
          renderProjects();
          toast('Saved project deleted.');
        } else {
          toast(r.error, true);
        }
      });
      return;
    }
    const add = event.target.closest('[data-add]');
    if (add) {
      addElement(add.dataset.add);
      return;
    }
    const select = event.target.closest('[data-select-element]');
    if (select) {
      state.selected = select.dataset.selectElement;
      state.inspectorTab = 'properties';
      renderCanvas();
      renderInspector();
      return;
    }
    if (event.target.closest('[data-inspector-tab]')) {
      state.inspectorTab = event.target.closest('[data-inspector-tab]').dataset.inspectorTab;
      renderInspector();
      return;
    }
    if (event.target.closest('[data-duplicate-element]')) {
      duplicateSelected();
      return;
    }
    if (event.target.closest('[data-delete-element]')) {
      deleteSelected();
      return;
    }
    if (event.target.closest('[data-layer-move]')) {
      moveLayer(event.target.closest('[data-layer-move]').dataset.layerMove);
      return;
    }
    if (event.target.closest('[data-focus-keyboard]')) {
      if (vKeyboard) {
        const textarea = $('#inspector-content textarea[data-property="text"]');
        vKeyboard.open(textarea);
      }
      return;
    }
    if (event.target.closest('[data-replace-image]')) {
      $('#replace-image-file').click();
      return;
    }
  });

  // Editor Toolbar Buttons
  $('#top-new').addEventListener('click', () => createBlank());
  $('#hero-new').addEventListener('click', () => createBlank());
  $('#projects-new').addEventListener('click', () => createBlank());
  $('#editor-save').addEventListener('click', saveProject);
  $('#undo').addEventListener('click', undo);
  $('#redo').addEventListener('click', redo);

  $('#editor-keyboard').addEventListener('click', () => {
    if (vKeyboard) {
      vKeyboard.toggle();
    }
  });

  $('#test-keyboard').addEventListener('click', () => {
    if (!state.doc) createBlank('Keyboard practice', PRESETS[1]);
    setView('editor');
    const el = getElement();
    if (!el || el.type !== 'text') {
      addElement('text', true);
    } else if (vKeyboard) {
      const textarea = $('#inspector-content textarea[data-property="text"]');
      vKeyboard.open(textarea);
    }
  });

  $('#export-png').addEventListener('click', async (event) => {
    const btn = event.currentTarget;
    if (!state.doc) return toast('Open a design first.', true);
    btn.disabled = true;
    try {
      await exportPNG();
      toast('PNG export downloaded.');
    } catch (e) {
      console.error(e);
      toast(`PNG export failed: ${e.message}`, true);
    } finally {
      btn.disabled = false;
    }
  });

  $('#design-name').addEventListener('input', (e) => {
    if (!state.doc) return;
    state.doc.name = e.target.value.slice(0, 120) || 'Untitled design';
    markDirty();
  });

  $('#template-search').addEventListener('input', (e) => {
    state.templateQuery = e.target.value;
    renderTemplateViews();
  });

  $('#inspector-content').addEventListener('change', (event) => {
    const target = event.target;
    if (target.matches('[data-transparent-fill]')) {
      const el = getElement();
      if (!el || el.type !== 'shape') return;
      mutate(() => {
        el.fill = target.checked ? 'transparent' : '#75e6d0';
      });
      return;
    }
    if (target.dataset.property) {
      if (['preset', 'canvas-width', 'canvas-height', 'canvas-background'].includes(target.dataset.property)) {
        setCanvasProperty(target.dataset.property, target.value);
      } else {
        propertyInput(target);
      }
    }
  });

  let propertyTypingSnapshot = null;
  $('#inspector-content').addEventListener('input', (event) => {
    const target = event.target;
    if (!target.dataset.property) return;
    const prop = target.dataset.property;
    if (['preset', 'canvas-width', 'canvas-height'].includes(prop)) return;
    if (prop === 'canvas-background') {
      const color = target.value;
      if (state.doc && cleanColor(color)) {
        if (!propertyTypingSnapshot) propertyTypingSnapshot = snapshot();
        state.doc.background = color.toUpperCase();
        state.doc.updated = nowISO();
        markDirty();
        renderCanvas();
      }
      return;
    }

    const el = getElement();
    if (!el) return;
    let value = target.value;
    if (['x', 'y', 'w', 'h', 'size', 'lh', 'sw', 'radius', 'opacity'].includes(prop)) {
      value = Number(value);
      if (!Number.isFinite(value)) return;
      const ranges = {
        x: [-100000, 100000],
        y: [-100000, 100000],
        w: [1, 100000],
        h: [1, 100000],
        size: [1, 1000],
        lh: [0.5, 3],
        sw: [0, 100],
        radius: [0, 1000],
        opacity: [0, 1],
      };
      value = clamp(value, ...ranges[prop]);
    }
    if (prop === 'weight') value = Number(value);
    if (['color', 'fill', 'stroke'].includes(prop) && !cleanColor(value, true)) return;

    if (!propertyTypingSnapshot) propertyTypingSnapshot = snapshot();
    el[prop] = value;
    state.doc.updated = nowISO();
    markDirty();
    renderCanvas();
    $('#canvas-selection').textContent = el.name;
    if (prop === 'opacity') $('#opacity-label').textContent = `${Math.round(value * 100)}%`;
  });

  $('#inspector-content').addEventListener('focusout', (event) => {
    if (!propertyTypingSnapshot) return;
    if (event.target.matches('[data-property]')) {
      pushUndo(propertyTypingSnapshot);
      propertyTypingSnapshot = null;
      renderInspector();
      updateUndoButtons();
    }
  });

  // Pointer dragging & resizing on stage
  $('#canvas-stage').addEventListener('pointerdown', (event) => {
    const node = event.target.closest('[data-element-id]');
    if (!node) {
      state.selected = null;
      renderCanvas();
      renderInspector();
      return;
    }
    const id = node.dataset.elementId;
    state.selected = id;
    state.inspectorTab = 'properties';
    renderCanvas();
    renderInspector();
    const el = getElement();
    if (!el) return;
    const resize = Boolean(event.target.closest('[data-resize]'));
    state.drag = {
      pointerId: event.pointerId,
      mode: resize ? 'resize' : 'move',
      x: event.clientX,
      y: event.clientY,
      ox: el.x,
      oy: el.y,
      w: el.w,
      h: el.h,
      snapshot: snapshot(),
      moved: false,
    };
    try {
      $('#canvas-stage-wrap').setPointerCapture(event.pointerId);
    } catch (_e) {}
    event.preventDefault();
  });

  $('#canvas-stage-wrap').addEventListener('pointermove', (event) => {
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const el = getElement();
    if (!el) return;
    const dx = (event.clientX - drag.x) / state.scale;
    const dy = (event.clientY - drag.y) / state.scale;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    if (!drag.moved) return;

    if (drag.mode === 'move') {
      el.x = Math.round(drag.ox + dx);
      el.y = Math.round(drag.oy + dy);
    } else {
      el.w = Math.max(1, Math.round(drag.w + dx));
      el.h = Math.max(1, Math.round(drag.h + dy));
    }
    const dom = $(`[data-element-id="${CSS.escape(el.id)}"]`);
    if (dom) {
      dom.style.left = el.x + 'px';
      dom.style.top = el.y + 'px';
      dom.style.width = el.w + 'px';
      dom.style.height = el.h + 'px';
    }
  });

  function endPointer(event) {
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (drag.moved) {
      pushUndo(drag.snapshot);
      markDirty();
      renderInspector();
      $('#canvas-selection').textContent = getElement()?.name || 'No selection';
    }
    state.drag = null;
  }
  $('#canvas-stage-wrap').addEventListener('pointerup', endPointer);
  $('#canvas-stage-wrap').addEventListener('pointercancel', endPointer);
  window.addEventListener('resize', () => requestAnimationFrame(fitCanvas));

  // Physical Keyboard Shortcuts
  document.addEventListener('keydown', (event) => {
    if (state.view === 'editor' && state.doc) {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveProject();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        if (typing) return;
        event.preventDefault();
        event.shiftKey ? redo() : undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      if (typing) return;

      const n = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (n && getElement()) {
        event.preventDefault();
        const el = getElement();
        mutate(() => {
          el.x += n[0] * (event.shiftKey ? 10 : 1);
          el.y += n[1] * (event.shiftKey ? 10 : 1);
        });
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && getElement()) {
        event.preventDefault();
        deleteSelected();
      }
    }
  });

  // Image Upload Handlers
  $('#image-file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !state.doc) return;
    if (!IMAGE_TYPES.has(file.type)) return toast('Choose a PNG, JPEG or WebP image.', true);
    if (file.size > 3 * 1024 * 1024) return toast('Images must be 3 MB or smaller.', true);

    try {
      const data = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const img = await imageLoad(data);
      const factor = Math.min((state.doc.width * 0.7) / img.width, (state.doc.height * 0.7) / img.height, 1);
      const w = Math.max(1, Math.round(img.width * factor));
      const h = Math.max(1, Math.round(img.height * factor));
      const el = makeElement('image', {
        name: file.name.slice(0, 100),
        src: data,
        alt: file.name.replace(/\.[^.]+$/, '').slice(0, 250),
        x: Math.round((state.doc.width - w) / 2),
        y: Math.round((state.doc.height - h) / 2),
        w,
        h,
        fit: 'contain',
      });
      mutate(() => {
        state.doc.elements.push(el);
        state.selected = el.id;
      });
      toast('Image added to design.');
    } catch (e) {
      toast(`Upload failed: ${e.message}`, true);
    }
  });

  $('#replace-image-file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    const el = getElement();
    if (!file || !el || el.type !== 'image') return;
    if (!IMAGE_TYPES.has(file.type)) return toast('Choose a PNG, JPEG or WebP image.', true);
    if (file.size > 3 * 1024 * 1024) return toast('Images must be 3 MB or smaller.', true);

    try {
      const data = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      mutate(() => {
        el.src = data;
      });
      toast('Image replaced.');
    } catch (e) {
      toast(`Replacement failed: ${e.message}`, true);
    }
  });

  // Project Import Handler
  function clickImport() {
    if (state.dirty) {
      showConfirmModal('Discard unsaved changes?', 'Importing another project will replace your current open unsaved design. Proceed?', () => {
        $('#project-file').click();
      });
      return;
    }
    $('#project-file').click();
  }
  $('#import-project').addEventListener('click', clickImport);
  $('#projects-import').addEventListener('click', clickImport);

  $('#project-file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast('Project JSON must be 10 MB or smaller.', true);
    try {
      const parsed = JSON.parse(await file.text());
      const doc = validateDocument(parsed);
      doc.id = uid('project');
      doc.name = doc.name.slice(0, 110) + ' (imported)';
      doc.created = nowISO();
      doc.updated = nowISO();
      const res = storage.save(doc);
      if (!res.ok) throw new Error(res.error);
      renderProjects();
      openProject(doc);
      toast('Validated project imported and saved locally.');
    } catch (e) {
      toast(`Import failed: ${e.message}`, true);
    }
  });

  // AI Studio Image Generation
  async function checkAIEndpoint() {
    const status = $('#ai-status');
    const pill = $('#ai-state');
    const integration = $('#gemini-integration-state');
    try {
      const res = await fetch('/api/generate-image', { method: 'OPTIONS', headers: { Accept: 'application/json' } });
      if (res.ok || res.status === 405 || res.status === 204) {
        status.textContent = 'A serverless route exists. Run a real request to verify model access.';
        pill.textContent = 'Endpoint detected';
        integration.textContent = 'Endpoint detected';
        return true;
      }
      throw new Error('no endpoint');
    } catch (_e) {
      status.textContent = 'Not configured. Set GEMINI_API_KEY in server environment.';
      pill.textContent = 'Not configured';
      integration.textContent = 'Not configured';
      return false;
    }
  }

  $('#generate-image').addEventListener('click', async (event) => {
    const prompt = $('#ai-prompt').value.trim();
    if (!prompt) {
      toast('Enter an image description first.', true);
      $('#ai-prompt').focus();
      return;
    }
    if (prompt.length > 2000) return toast('The prompt must be 2000 characters or shorter.', true);

    const btn = event.currentTarget;
    btn.disabled = true;
    state.aiBusy = true;
    $('#ai-status').textContent = 'Requesting a real image from the serverless endpoint…';
    $('#ai-state').textContent = 'Generating';
    $('#ai-result').innerHTML = '<div class="ai-result-placeholder"><span>◌</span><strong>Generating image…</strong><p>This may take a moment. Do not close the tab.</p></div>';

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio: $('#ai-aspect').value }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Image endpoint returned HTTP ${response.status}.`);
      if (typeof data.imageDataUrl !== 'string' || !/^data:image\/(png|jpeg|webp);base64,/.test(data.imageDataUrl)) {
        throw new Error('The server did not return a valid image data URL.');
      }
      const blob = await (await fetch(data.imageDataUrl)).blob();
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(blob.type) || blob.size > 15 * 1024 * 1024) {
        throw new Error('Returned image type or size is not supported.');
      }
      state.aiImage = { blob, src: data.imageDataUrl, type: blob.type, prompt };
      $('#ai-result').innerHTML = '';
      const image = document.createElement('img');
      image.alt = `Generated visual: ${prompt.slice(0, 120)}`;
      image.src = URL.createObjectURL(blob);
      image.onload = () => URL.revokeObjectURL(image.src);
      $('#ai-result').append(image);
      $('#ai-status').textContent = 'Image returned by the server endpoint.';
      $('#ai-state').textContent = 'Generated';
      $('#ai-download').disabled = false;
      $('#ai-add-to-design').disabled = false;
      toast('Image generation completed.');
    } catch (error) {
      console.error('Gemini image request failed:', error);
      $('#ai-status').textContent = error.message;
      $('#ai-state').textContent = 'Request failed';
      $('#ai-result').innerHTML = `<div class="ai-result-placeholder"><span>!</span><strong>Image was not generated</strong><p>${escapeHTML(error.message)}</p><button class="button button-secondary" id="ai-retry" type="button" style="margin-top:10px">Retry request</button></div>`;
      $('#ai-retry').addEventListener('click', () => $('#generate-image').click());
      toast(error.message, true);
    } finally {
      btn.disabled = false;
      state.aiBusy = false;
    }
  });

  $('#ai-download').addEventListener('click', () => {
    if (!state.aiImage) return;
    downloadBlob(`aiprintos-ai-${Date.now()}.${state.aiImage.type === 'image/jpeg' ? 'jpg' : state.aiImage.type.split('/')[1]}`, state.aiImage.blob);
  });

  $('#ai-add-to-design').addEventListener('click', async () => {
    if (!state.aiImage) return;
    if (!state.doc) createBlank('AI generated design', PRESETS[1]);
    const file = new File([state.aiImage.blob], `ai-generated.${state.aiImage.type.split('/')[1]}`, { type: state.aiImage.type });
    const data = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
    const img = await imageLoad(data);
    const factor = Math.min((state.doc.width * 0.8) / img.width, (state.doc.height * 0.65) / img.height, 1);
    const el = makeElement('image', {
      name: 'AI generated image',
      src: data,
      alt: state.aiImage.prompt.slice(0, 250),
      x: Math.round((state.doc.width - img.width * factor) / 2),
      y: Math.round((state.doc.height - img.height * factor) / 2),
      w: Math.max(1, Math.round(img.width * factor)),
      h: Math.max(1, Math.round(img.height * factor)),
      fit: 'contain',
    });
    mutate(() => {
      state.doc.elements.push(el);
      state.selected = el.id;
    });
    setView('editor');
    toast('Image added to design. Save to keep it.');
  });

  window.addEventListener('beforeunload', (event) => {
    if (state.dirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  });

  // --- Initialization ---
  initVirtualKeyboard();
  renderTemplateViews();
  renderProjects();
  checkAIEndpoint();
  setView('home');
  updateUndoButtons();
})();
