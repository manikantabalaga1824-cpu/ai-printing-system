/**
 * Gboard-style Virtual Keyboard Layouts
 * Supports English QWERTY, Telugu Unicode (Consonants, Vowels, Matras, Numerals),
 * and Multi-tier Number & Symbol layouts.
 */

export const ENGLISH_LAYOUT = {
  id: 'en',
  name: 'English (US)',
  rows: [
    [
      { key: 'q', alt: '1' },
      { key: 'w', alt: '2' },
      { key: 'e', alt: '3' },
      { key: 'r', alt: '4' },
      { key: 't', alt: '5' },
      { key: 'y', alt: '6' },
      { key: 'u', alt: '7' },
      { key: 'i', alt: '8' },
      { key: 'o', alt: '9' },
      { key: 'p', alt: '0' },
    ],
    [
      { key: 'a', alt: '@' },
      { key: 's', alt: '#' },
      { key: 'd', alt: '$' },
      { key: 'f', alt: '_' },
      { key: 'g', alt: '&' },
      { key: 'h', alt: '-' },
      { key: 'j', alt: '+' },
      { key: 'k', alt: '(' },
      { key: 'l', alt: ')' },
    ],
    [
      { key: 'shift', action: 'shift', label: '⇧', width: 1.4, isSpecial: true },
      { key: 'z', alt: '*' },
      { key: 'x', alt: '"' },
      { key: 'c', alt: "'" },
      { key: 'v', alt: ':' },
      { key: 'b', alt: ';' },
      { key: 'n', alt: '!' },
      { key: 'm', alt: '?' },
      { key: 'backspace', action: 'backspace', label: '⌫', width: 1.4, isSpecial: true },
    ],
    [
      { key: '?123', action: 'symbols', label: '?123', width: 1.3, isSpecial: true },
      { key: 'lang', action: 'lang', label: '🌐', width: 1.1, isSpecial: true, ariaLabel: 'Switch language' },
      { key: 'emoji', action: 'emoji', label: '😊', width: 1.1, isSpecial: true, ariaLabel: 'Open emojis' },
      { key: ' ', action: 'space', label: 'English', width: 3.8, isSpace: true },
      { key: '.', label: '.' },
      { key: 'enter', action: 'enter', label: '↵', width: 1.4, isSpecial: true, isAction: true },
    ],
  ],
};

export const TELUGU_LAYOUT = {
  id: 'te',
  name: 'తెలుగు (Unicode)',
  rows: [
    [
      { key: 'అ' }, { key: 'ఆ' }, { key: 'ఇ' }, { key: 'ఈ' },
      { key: 'ఉ' }, { key: 'ఊ' }, { key: 'ఎ' }, { key: 'ఏ' },
      { key: 'ఐ' }, { key: 'ఒ' }, { key: 'ఓ' }, { key: 'ఔ' },
    ],
    [
      { key: 'క' }, { key: 'ఖ' }, { key: 'గ' }, { key: 'ఘ' },
      { key: 'చ' }, { key: 'ఛ' }, { key: 'జ' }, { key: 'ఝ' },
      { key: 'ట' }, { key: 'ఠ' }, { key: 'డ' }, { key: 'ఢ' },
    ],
    [
      { key: 'త' }, { key: 'థ' }, { key: 'ద' }, { key: 'ధ' },
      { key: 'న' }, { key: 'ప' }, { key: 'ఫ' }, { key: 'బ' },
      { key: 'భ' }, { key: 'మ' }, { key: 'య' }, { key: 'ర' },
    ],
    [
      { key: 'te-matra', action: 'toggle-te-matra', label: 'గుణింతాలు', width: 1.6, isSpecial: true },
      { key: 'ల' }, { key: 'వ' }, { key: 'శ' }, { key: 'ష' },
      { key: 'స' }, { key: 'హ' }, { key: 'ళ' }, { key: 'క్ష' },
      { key: 'ఱ' },
      { key: 'backspace', action: 'backspace', label: '⌫', width: 1.4, isSpecial: true },
    ],
    [
      { key: '?123', action: 'symbols', label: '?123', width: 1.2, isSpecial: true },
      { key: 'lang', action: 'lang', label: '🌐', width: 1.1, isSpecial: true, ariaLabel: 'Switch language' },
      { key: 'emoji', action: 'emoji', label: '😊', width: 1.1, isSpecial: true, ariaLabel: 'Open emojis' },
      { key: ' ', action: 'space', label: 'తెలుగు', width: 3.5, isSpace: true },
      { key: '్', label: '్ (విరామం)', alt: '్' },
      { key: 'ం', label: 'ం', alt: 'ం' },
      { key: 'enter', action: 'enter', label: '↵', width: 1.3, isSpecial: true, isAction: true },
    ],
  ],
};

export const TELUGU_MATRA_LAYOUT = {
  id: 'te-matra',
  name: 'తెలుగు గుణింతాలు & సంఖ్యలు',
  rows: [
    [
      { key: 'ా', label: 'ా' }, { key: 'ి', label: 'ి' }, { key: 'ీ', label: 'ీ' },
      { key: 'ు', label: 'ు' }, { key: 'ూ', label: 'ూ' }, { key: 'ృ', label: 'ృ' },
      { key: 'ె', label: 'ె' }, { key: 'ే', label: 'ే' }, { key: 'ై', label: 'ై' },
      { key: 'ొ', label: 'ొ' }, { key: 'ో', label: 'ో' }, { key: 'ౌ', label: 'ౌ' },
    ],
    [
      { key: '్', label: '్ (విరామం)' },
      { key: 'ం', label: 'ం (అనుస్వార)' },
      { key: 'ః', label: 'ః (విసర్గ)' },
      { key: 'ఁ', label: 'ఁ (అర్ధానుస్వార)' },
      { key: 'ౘ', label: 'ౘ' },
      { key: 'ౙ', label: 'ౙ' },
      { key: 'ౠ', label: 'ౠ' },
      { key: 'ౡ', label: 'ౡ' },
      { key: '।', label: '।' },
      { key: '॥', label: '॥' },
    ],
    [
      { key: '౧', label: '౧' }, { key: '౨', label: '౨' }, { key: '౩', label: '౩' },
      { key: '౪', label: '౪' }, { key: '౫', label: '౫' }, { key: '౬', label: '౬' },
      { key: '౭', label: '౭' }, { key: '౮', label: '౮' }, { key: '౯', label: '౯' },
      { key: '౦', label: '౦' },
      { key: 'backspace', action: 'backspace', label: '⌫', width: 1.4, isSpecial: true },
    ],
    [
      { key: 'te-base', action: 'toggle-te-base', label: 'అక్షరాలు', width: 1.5, isSpecial: true },
      { key: 'lang', action: 'lang', label: '🌐', width: 1.1, isSpecial: true },
      { key: 'emoji', action: 'emoji', label: '😊', width: 1.1, isSpecial: true },
      { key: ' ', action: 'space', label: 'తెలుగు', width: 3.5, isSpace: true },
      { key: '!', label: '!' },
      { key: '?', label: '?' },
      { key: 'enter', action: 'enter', label: '↵', width: 1.3, isSpecial: true, isAction: true },
    ],
  ],
};

export const SYMBOLS_LAYOUT = {
  id: 'symbols',
  name: 'Numbers & Symbols',
  rows: [
    [
      { key: '1' }, { key: '2' }, { key: '3' }, { key: '4' }, { key: '5' },
      { key: '6' }, { key: '7' }, { key: '8' }, { key: '9' }, { key: '0' },
    ],
    [
      { key: '@' }, { key: '#' }, { key: '$' }, { key: '_' }, { key: '&' },
      { key: '-' }, { key: '+' }, { key: '(' }, { key: ')' }, { key: '/' },
    ],
    [
      { key: '=\\<', action: 'more-symbols', label: '=\\<', width: 1.4, isSpecial: true },
      { key: '*' }, { key: '"' }, { key: "'" }, { key: ':' }, { key: ';' },
      { key: '!' }, { key: '?' },
      { key: 'backspace', action: 'backspace', label: '⌫', width: 1.4, isSpecial: true },
    ],
    [
      { key: 'abc', action: 'alpha', label: 'ABC', width: 1.4, isSpecial: true },
      { key: ',' },
      { key: 'emoji', action: 'emoji', label: '😊', width: 1.1, isSpecial: true },
      { key: ' ', action: 'space', label: 'Space', width: 3.5, isSpace: true },
      { key: '.' },
      { key: 'enter', action: 'enter', label: '↵', width: 1.4, isSpecial: true, isAction: true },
    ],
  ],
};

export const MORE_SYMBOLS_LAYOUT = {
  id: 'more-symbols',
  name: 'Additional Symbols',
  rows: [
    [
      { key: '~' }, { key: '`' }, { key: '|' }, { key: '^' }, { key: '=' },
      { key: '{' }, { key: '}' }, { key: '[' }, { key: ']' }, { key: '%' },
    ],
    [
      { key: '\\' }, { key: '<' }, { key: '>' }, { key: '€' }, { key: '£' },
      { key: '¥' }, { key: '₹' }, { key: '¢' }, { key: '©' }, { key: '®' },
    ],
    [
      { key: '?123', action: 'symbols', label: '?123', width: 1.4, isSpecial: true },
      { key: '§' }, { key: '°' }, { key: '·' }, { key: '…' }, { key: '«' },
      { key: '»' }, { key: '±' },
      { key: 'backspace', action: 'backspace', label: '⌫', width: 1.4, isSpecial: true },
    ],
    [
      { key: 'abc', action: 'alpha', label: 'ABC', width: 1.4, isSpecial: true },
      { key: '<' },
      { key: 'emoji', action: 'emoji', label: '😊', width: 1.1, isSpecial: true },
      { key: ' ', action: 'space', label: 'Space', width: 3.5, isSpace: true },
      { key: '>' },
      { key: 'enter', action: 'enter', label: '↵', width: 1.4, isSpecial: true, isAction: true },
    ],
  ],
};
