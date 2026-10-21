/**
 * Gboard-Style Virtual Keyboard Controller
 * Modular, Accessible, and Integrated with AI PrintOS Design Editor
 */

import {
  ENGLISH_LAYOUT,
  TELUGU_LAYOUT,
  TELUGU_MATRA_LAYOUT,
  SYMBOLS_LAYOUT,
  MORE_SYMBOLS_LAYOUT,
} from './layouts.js';
import { getSuggestions, getCurrentWordInfo } from './suggestions.js';
import { EMOJI_CATEGORIES, EMOJI_DATA, searchEmojis } from './emojis.js';

export class VirtualKeyboard {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('keyboard-dock');
    this.onTextChange = options.onTextChange || (() => {});
    this.onRequestSelectTextLayer = options.onRequestSelectTextLayer || (() => null);

    this.isOpen = false;
    this.isMinimized = false;
    this.theme = 'light';
    this.language = 'en'; // 'en' | 'te'
    this.layoutMode = 'alpha'; // 'alpha' | 'symbols' | 'more-symbols' | 'emoji' | 'te-matra'
    this.isShift = false;
    this.isCapsLock = false;
    this.activeEmojiCategory = 'all';
    this.emojiSearchQuery = '';

    // Active text input tracking
    this.targetInput = null; // HTMLInputElement or HTMLTextAreaElement
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.cachedText = '';

    this.initDOM();
    this.attachGlobalListeners();
  }

  initDOM() {
    if (!this.container) return;
    this.container.className = 'gboard-dock';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Virtual Keyboard');
    this.render();
  }

  attachGlobalListeners() {
    // Listen for physical typing inside inputs to keep caret position and suggestion strip synchronized
    document.addEventListener('selectionchange', () => {
      if (document.activeElement === this.targetInput && this.targetInput) {
        this.updateCaretFromTarget();
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target === this.targetInput) {
        this.updateCaretFromTarget();
        this.renderSuggestions();
      }
    });

    document.addEventListener('focusin', (e) => {
      if (e.target.matches('textarea, input[type="text"], input[type="search"]')) {
        // If it's not a keyboard internal input, remember target
        if (!this.container.contains(e.target)) {
          this.setTargetInput(e.target);
        }
      }
    });
  }

  setTargetInput(inputElement) {
    if (!inputElement) return;
    this.targetInput = inputElement;
    this.selectionStart = inputElement.selectionStart || inputElement.value.length;
    this.selectionEnd = inputElement.selectionEnd || inputElement.value.length;
    this.cachedText = inputElement.value || '';
    if (this.isOpen) {
      this.renderSuggestions();
    }
  }

  updateCaretFromTarget() {
    if (!this.targetInput) return;
    try {
      this.selectionStart = this.targetInput.selectionStart || 0;
      this.selectionEnd = this.targetInput.selectionEnd || 0;
      this.cachedText = this.targetInput.value || '';
    } catch (_e) {}
  }

  open(inputElement = null) {
    if (inputElement) {
      this.setTargetInput(inputElement);
    } else if (!this.targetInput) {
      // Check if design editor can provide a text layer
      const textEl = this.onRequestSelectTextLayer();
      if (textEl && textEl.input) {
        this.setTargetInput(textEl.input);
      }
    }

    this.isOpen = true;
    this.isMinimized = false;
    this.container.hidden = false;
    this.render();
    this.focusTarget();
  }

  close() {
    this.isOpen = false;
    this.container.hidden = true;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.container.classList.toggle('gkbd-minimized', this.isMinimized);
    this.render();
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.container.classList.toggle('gkbd-dark', this.theme === 'dark');
    this.render();
  }

  switchLanguage(lang) {
    this.language = lang;
    this.layoutMode = 'alpha';
    this.isShift = false;
    this.render();
  }

  focusTarget() {
    if (this.targetInput && document.activeElement !== this.targetInput) {
      try {
        this.targetInput.focus();
        this.targetInput.setSelectionRange(this.selectionStart, this.selectionEnd);
      } catch (_e) {}
    }
  }

  getActiveLayout() {
    if (this.layoutMode === 'symbols') return SYMBOLS_LAYOUT;
    if (this.layoutMode === 'more-symbols') return MORE_SYMBOLS_LAYOUT;
    if (this.layoutMode === 'te-matra') return TELUGU_MATRA_LAYOUT;
    if (this.language === 'te') return TELUGU_LAYOUT;
    return ENGLISH_LAYOUT;
  }

  insertText(textToInsert) {
    if (!this.targetInput) {
      // Attempt to retrieve or create text layer in editor
      const textEl = this.onRequestSelectTextLayer();
      if (textEl && textEl.input) {
        this.setTargetInput(textEl.input);
      } else {
        return;
      }
    }

    const value = this.targetInput.value || '';
    const start = Math.min(this.selectionStart, this.selectionEnd);
    const end = Math.max(this.selectionStart, this.selectionEnd);

    const newValue = value.slice(0, start) + textToInsert + value.slice(end);
    const newPos = start + textToInsert.length;

    this.targetInput.value = newValue;
    this.selectionStart = newPos;
    this.selectionEnd = newPos;
    this.cachedText = newValue;

    try {
      this.targetInput.setSelectionRange(newPos, newPos);
    } catch (_e) {}

    // Dispatch input event for natural editor synchronization
    this.targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    this.onTextChange(newValue, this.targetInput);

    // Auto-reset non-locked Shift
    if (this.isShift && !this.isCapsLock) {
      this.isShift = false;
      this.renderKeys();
    }

    this.renderSuggestions();
  }

  deleteText() {
    if (!this.targetInput) return;
    const value = this.targetInput.value || '';
    let start = Math.min(this.selectionStart, this.selectionEnd);
    let end = Math.max(this.selectionStart, this.selectionEnd);

    if (start === end) {
      if (start === 0) return;
      // Handle surrogate pairs or unicode grapheme clusters
      const prefix = value.slice(0, start);
      const match = prefix.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]$|.$/u);
      const cut = match ? match[0].length : 1;
      start -= cut;
    }

    const newValue = value.slice(0, start) + value.slice(end);
    this.targetInput.value = newValue;
    this.selectionStart = start;
    this.selectionEnd = start;
    this.cachedText = newValue;

    try {
      this.targetInput.setSelectionRange(start, start);
    } catch (_e) {}

    this.targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    this.onTextChange(newValue, this.targetInput);
    this.renderSuggestions();
  }

  applyCandidate(candidateObj) {
    if (!this.targetInput) return;
    const textToInsert = candidateObj.actualValue !== undefined ? candidateObj.actualValue : candidateObj.text;
    const value = this.targetInput.value || '';
    const { start, end } = getCurrentWordInfo(value, this.selectionStart);

    // Replace the current word with the chosen candidate + trailing space
    const withSpace = textToInsert + ' ';
    const newValue = value.slice(0, start) + withSpace + value.slice(end);
    const newPos = start + withSpace.length;

    this.targetInput.value = newValue;
    this.selectionStart = newPos;
    this.selectionEnd = newPos;
    this.cachedText = newValue;

    try {
      this.targetInput.setSelectionRange(newPos, newPos);
    } catch (_e) {}

    this.targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    this.onTextChange(newValue, this.targetInput);
    this.renderSuggestions();
  }

  handleKeyAction(action, key) {
    switch (action) {
      case 'shift':
        if (this.isShift) {
          if (this.isCapsLock) {
            this.isShift = false;
            this.isCapsLock = false;
          } else {
            this.isCapsLock = true;
          }
        } else {
          this.isShift = true;
          this.isCapsLock = false;
        }
        this.renderKeys();
        break;

      case 'backspace':
        this.deleteText();
        break;

      case 'space':
        this.insertText(' ');
        break;

      case 'enter':
        this.insertText('\n');
        break;

      case 'lang':
        this.switchLanguage(this.language === 'en' ? 'te' : 'en');
        break;

      case 'symbols':
        this.layoutMode = 'symbols';
        this.render();
        break;

      case 'more-symbols':
        this.layoutMode = 'more-symbols';
        this.render();
        break;

      case 'alpha':
        this.layoutMode = 'alpha';
        this.render();
        break;

      case 'emoji':
        this.layoutMode = this.layoutMode === 'emoji' ? 'alpha' : 'emoji';
        this.render();
        break;

      case 'toggle-te-matra':
        this.layoutMode = 'te-matra';
        this.render();
        break;

      case 'toggle-te-base':
        this.layoutMode = 'alpha';
        this.render();
        break;

      default:
        if (key) {
          const finalChar = this.isShift ? key.toUpperCase() : key;
          this.insertText(finalChar);
        }
        break;
    }
  }

  render() {
    if (!this.container) return;

    if (this.isMinimized) {
      this.container.innerHTML = `
        <div class="gkbd-titlebar" style="margin-bottom:0;border-bottom:none">
          <div class="gkbd-title-info">
            <span class="gkbd-drag-handle">⠿</span>
            <strong>PrintType Gboard</strong>
            <small>Minimized</small>
          </div>
          <div class="gkbd-title-actions">
            <button class="gkbd-chip-btn" data-gkbd="expand">Restore ↗</button>
            <button class="gkbd-icon-btn" data-gkbd="close" aria-label="Close keyboard">×</button>
          </div>
        </div>
      `;
      this.bindTitlebarEvents();
      return;
    }

    const layout = this.getActiveLayout();
    const isTe = this.language === 'te';

    this.container.innerHTML = `
      <div class="gkbd-titlebar">
        <div class="gkbd-title-info">
          <span class="gkbd-drag-handle" title="Drag keyboard">⠿</span>
          <strong>PrintType</strong>
          <small>${layout.name}</small>
        </div>
        <div class="gkbd-title-actions">
          <button class="gkbd-chip-btn" data-gkbd="toggle-lang" title="Toggle English & Telugu">
            <span>🌐</span> ${isTe ? 'తెలుగు' : 'English'}
          </button>
          <button class="gkbd-icon-btn" data-gkbd="toggle-theme" title="Toggle Light/Dark Theme">
            ${this.theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button class="gkbd-icon-btn" data-gkbd="minimize" title="Minimize keyboard">_</button>
          <button class="gkbd-icon-btn" data-gkbd="close" title="Close keyboard">×</button>
        </div>
      </div>

      <div class="gkbd-suggestion-strip" id="gkbd-suggestions" role="toolbar" aria-label="Word suggestions"></div>

      <div class="gkbd-main-body">
        ${this.layoutMode === 'emoji' ? this.renderEmojiPanelHTML() : '<div class="gkbd-keys-container" id="gkbd-keys"></div>'}
      </div>

      <div class="gkbd-footnote">
        <span>Bilingual Gboard · Unicode Telugu + English</span>
        <span>${this.targetInput ? 'Editing active text' : 'No target selected'}</span>
      </div>
    `;

    this.bindTitlebarEvents();
    this.renderSuggestions();

    if (this.layoutMode === 'emoji') {
      this.bindEmojiEvents();
    } else {
      this.renderKeys();
    }
  }

  renderSuggestions() {
    const strip = this.container.querySelector('#gkbd-suggestions');
    if (!strip) return;

    const text = this.targetInput ? this.targetInput.value : '';
    const caret = this.selectionStart;
    const suggestions = getSuggestions(text, caret, this.language);

    strip.innerHTML = suggestions
      .map(
        (cand, idx) => `
        <button
          type="button"
          class="gkbd-candidate ${cand.isPrimary ? 'primary' : ''}"
          data-cand-idx="${idx}"
        >
          <span>${cand.text}</span>
          ${cand.label ? `<span class="gkbd-candidate-badge">${cand.label}</span>` : ''}
        </button>
      `
      )
      .join('');

    strip.querySelectorAll('[data-cand-idx]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = Number(btn.dataset.candIdx);
        if (suggestions[idx]) {
          this.applyCandidate(suggestions[idx]);
        }
      });
    });
  }

  renderKeys() {
    const keysWrap = this.container.querySelector('#gkbd-keys');
    if (!keysWrap) return;

    const layout = this.getActiveLayout();
    keysWrap.innerHTML = layout.rows
      .map((row) => {
        return `
        <div class="gkbd-row">
          ${row
            .map((item) => {
              const action = item.action || '';
              const key = item.key;
              const isSpecial = Boolean(item.isSpecial || action);
              const isSpace = Boolean(item.isSpace);
              const isAction = Boolean(item.isAction);

              let classes = ['gkbd-key'];
              if (isSpecial) classes.push('special');
              if (isSpace) classes.push('space-key');
              if (isAction) classes.push('action');
              if (this.language === 'te' && !isSpecial) classes.push('te-char');

              if (action === 'shift') {
                if (this.isCapsLock) classes.push('caps-locked');
                else if (this.isShift) classes.push('shift-active');
              }

              let display = item.label || key;
              if (!isSpecial && this.language === 'en') {
                display = this.isShift ? key.toUpperCase() : key.toLowerCase();
              }

              const widthAttr = item.width ? `data-w="${item.width}"` : '';

              return `
                <button
                  type="button"
                  class="${classes.join(' ')}"
                  ${widthAttr}
                  data-action="${action}"
                  data-key="${key}"
                  aria-label="${item.ariaLabel || display}"
                >
                  <span class="gkbd-key-main">${display}</span>
                  ${item.alt ? `<span class="gkbd-key-alt">${item.alt}</span>` : ''}
                </button>
              `;
            })
            .join('')}
        </div>
      `;
      })
      .join('');

    // Attach click and touch interactions to keys
    keysWrap.querySelectorAll('.gkbd-key').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        const action = btn.dataset.action;
        const key = btn.dataset.key;
        this.handleKeyAction(action, key);
      });

      const release = () => btn.classList.remove('pressed');
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
    });
  }

  renderEmojiPanelHTML() {
    const emojis = searchEmojis(this.emojiSearchQuery, this.activeEmojiCategory);

    return `
      <div class="gkbd-emoji-panel">
        <div class="gkbd-emoji-topbar">
          <div class="gkbd-emoji-search">
            <span>⌕</span>
            <input
              type="search"
              id="gkbd-emoji-input"
              placeholder="Search emojis…"
              value="${this.emojiSearchQuery}"
            />
          </div>
          <button class="gkbd-chip-btn" data-gkbd="back-to-abc">ABC ↵</button>
        </div>

        <div class="gkbd-emoji-categories">
          <button class="gkbd-emoji-cat-btn ${this.activeEmojiCategory === 'all' ? 'active' : ''}" data-cat="all">All</button>
          ${EMOJI_CATEGORIES.map(
            (c) => `
            <button class="gkbd-emoji-cat-btn ${this.activeEmojiCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
              ${c.icon} ${c.name}
            </button>
          `
          ).join('')}
        </div>

        <div class="gkbd-emoji-grid" id="gkbd-emoji-grid">
          ${emojis
            .map(
              (e) => `
            <button type="button" class="gkbd-emoji-item" data-emoji="${e.char}" title="${e.name}">
              ${e.char}
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  bindEmojiEvents() {
    const searchInput = this.container.querySelector('#gkbd-emoji-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.emojiSearchQuery = e.target.value;
        const grid = this.container.querySelector('#gkbd-emoji-grid');
        if (grid) {
          const results = searchEmojis(this.emojiSearchQuery, this.activeEmojiCategory);
          grid.innerHTML = results
            .map(
              (item) => `
              <button type="button" class="gkbd-emoji-item" data-emoji="${item.char}" title="${item.name}">
                ${item.char}
              </button>
            `
            )
            .join('');
          this.bindEmojiGridClicks();
        }
      });
    }

    this.container.querySelectorAll('[data-cat]').forEach((catBtn) => {
      catBtn.addEventListener('click', () => {
        this.activeEmojiCategory = catBtn.dataset.cat;
        this.render();
      });
    });

    const backBtn = this.container.querySelector('[data-gkbd="back-to-abc"]');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.layoutMode = 'alpha';
        this.render();
      });
    }

    this.bindEmojiGridClicks();
  }

  bindEmojiGridClicks() {
    this.container.querySelectorAll('[data-emoji]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.insertText(btn.dataset.emoji);
      });
    });
  }

  bindTitlebarEvents() {
    const toggleLang = this.container.querySelector('[data-gkbd="toggle-lang"]');
    if (toggleLang) {
      toggleLang.addEventListener('click', () => {
        this.switchLanguage(this.language === 'en' ? 'te' : 'en');
      });
    }

    const toggleTheme = this.container.querySelector('[data-gkbd="toggle-theme"]');
    if (toggleTheme) {
      toggleTheme.addEventListener('click', () => this.toggleTheme());
    }

    const minimizeBtn = this.container.querySelector('[data-gkbd="minimize"]');
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => this.toggleMinimize());
    }

    const expandBtn = this.container.querySelector('[data-gkbd="expand"]');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => this.toggleMinimize());
    }

    const closeBtn = this.container.querySelector('[data-gkbd="close"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }
}
