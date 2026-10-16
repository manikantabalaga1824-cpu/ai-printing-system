import React, { useState } from 'react';
import {
  TELUGU_BASIC_ROWS,
  TELUGU_EXTRA_ROWS,
  ENGLISH_ROWS,
  ENGLISH_SYMBOL_ROWS,
  WORD_MAP,
  EMOJIS,
} from '../constants';
import { clamp } from '../utils/storage';

interface BilingualKeyboardProps {
  onInsert: (text: string) => void;
  onDelete: () => void;
  onClose: () => void;
  currentText: string;
}

export const BilingualKeyboard: React.FC<BilingualKeyboardProps> = ({
  onInsert,
  onDelete,
  onClose,
  currentText,
}) => {
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [isSymbols, setIsSymbols] = useState(false);
  const [isShift, setIsShift] = useState(false);
  const [showEmojiDrawer, setShowEmojiDrawer] = useState(false);

  // Extract last word for dictionary suggestions
  const getLastWord = (text: string) => {
    const match = text.match(/[A-Za-z]+$/);
    return match ? match[0].toLowerCase() : '';
  };

  const lastWord = getLastWord(currentText);
  let candidates: string[] = [];
  if (lastWord) {
    const translated = WORD_MAP[lastWord];
    if (translated) {
      candidates = [translated, lastWord[0].toUpperCase() + lastWord.slice(1), lastWord];
    } else {
      candidates = [lastWord[0].toUpperCase() + lastWord.slice(1), lastWord.toUpperCase(), lastWord];
    }
  } else {
    candidates = ['తెలుగు', 'నమస్కారం', '✨'];
  }

  const handleKeyClick = (key: string) => {
    if (key === '⇧') {
      setIsShift(!isShift);
      return;
    }
    if (key === '⌫') {
      onDelete();
      return;
    }
    if (key === '?123') {
      setIsSymbols(true);
      setShowEmojiDrawer(false);
      return;
    }
    if (key === 'ABC') {
      setIsSymbols(false);
      setShowEmojiDrawer(false);
      return;
    }
    if (key === 'English') {
      setLanguage('en');
      setIsSymbols(false);
      setShowEmojiDrawer(false);
      return;
    }
    if (key === '😊') {
      setShowEmojiDrawer(!showEmojiDrawer);
      return;
    }
    if (key === 'space') {
      onInsert(' ');
      return;
    }
    if (key === '↵') {
      onInsert('\n');
      return;
    }

    if (language === 'en' && key.length === 1 && /[a-z]/i.test(key)) {
      onInsert(isShift ? key.toUpperCase() : key);
      if (isShift) setIsShift(false);
      return;
    }

    onInsert(key);
  };

  const handleCandidateClick = (candidate: string) => {
    // If there's an active typed word, replace it; otherwise just insert candidate
    if (lastWord) {
      // Delete the characters of the last typed word, then insert candidate
      for (let i = 0; i < lastWord.length; i++) {
        onDelete();
      }
      onInsert(candidate);
    } else {
      onInsert(candidate);
    }
  };

  let rows: string[][];
  if (isSymbols) {
    rows = language === 'te' ? TELUGU_EXTRA_ROWS : ENGLISH_SYMBOL_ROWS;
  } else if (language === 'en') {
    rows = ENGLISH_ROWS;
  } else {
    rows = TELUGU_BASIC_ROWS;
  }

  return (
    <div className="keyboard-dock" role="region" aria-label="Bilingual on-screen keyboard">
      <div className="keyboard-titlebar">
        <div>
          <strong>PrintType</strong>
          <span>Glass keyboard · English + తెలుగు</span>
        </div>
        <div className="keyboard-actions">
          <button
            type="button"
            className="kbd-mode"
            onClick={() => {
              setLanguage(language === 'en' ? 'te' : 'en');
              setIsSymbols(false);
              setShowEmojiDrawer(false);
            }}
            aria-label="Switch keyboard language"
          >
            {language === 'en' ? 'EN / తెలుగు' : 'తెలుగు / EN'}
          </button>
          <button
            type="button"
            className="kbd-close"
            onClick={onClose}
            aria-label="Hide keyboard"
          >
            ×
          </button>
        </div>
      </div>

      <div className="suggestion-row" id="suggestion-row">
        {showEmojiDrawer ? (
          EMOJIS.slice(0, 10).map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onInsert(emoji)}
            >
              {emoji}
            </button>
          ))
        ) : (
          candidates.slice(0, 3).map((candidate) => (
            <button
              key={candidate}
              type="button"
              onClick={() => handleCandidateClick(candidate)}
            >
              {candidate}
            </button>
          ))
        )}
      </div>

      <div className="virtual-keyboard">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="key-row">
            {row.map((key) => {
              const isSpecial = ['⇧', '⌫', '?123', 'ABC', 'English', '😊', 'space', '↵'].includes(key);
              const isAccent = ['↵', 'English', 'ABC'].includes(key);
              const isSpace = key === 'space';
              const isEnter = key === '↵';

              let cls = 'vk-key';
              if (isSpecial) cls += ' special';
              if (isAccent) cls += ' accent';
              if (isSpace) cls += ' space';
              if (isEnter) cls += ' enter';

              const displayLabel = isSpace
                ? 'English / తెలుగు · Space'
                : (language === 'en' && isShift && key.length === 1 && /[a-z]/i.test(key))
                ? key.toUpperCase()
                : key;

              return (
                <button
                  key={key}
                  type="button"
                  className={cls}
                  onClick={() => handleKeyClick(key)}
                  aria-label={key === '⌫' ? 'Backspace' : key === '↵' ? 'Enter' : key === 'space' ? 'Space' : key}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="keyboard-footnote">
        Telugu script keys use Unicode characters. English-word transliteration is a compact dictionary, not full Gboard prediction.
      </div>
    </div>
  );
};
