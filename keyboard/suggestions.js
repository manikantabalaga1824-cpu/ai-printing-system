/**
 * Suggestion & Transliteration Engine
 * Provides word completion, autocorrection, Telugu phonetic transliteration,
 * and contextual candidates for Gboard-style input.
 */

// Common English words for suggestions & completion
const ENGLISH_DICTIONARY = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  // Design & Print specific terms
  'card', 'cards', 'business', 'poster', 'posters', 'flyer', 'flyers', 'invitation',
  'invitations', 'design', 'studio', 'print', 'printing', 'color', 'colors', 'text',
  'font', 'typography', 'branding', 'brand', 'celebrate', 'celebration', 'party',
  'wedding', 'birthday', 'event', 'events', 'save', 'date', 'thanks', 'thank',
  'gratitude', 'certificate', 'welcome', 'special', 'creative', 'modern', 'minimal',
  'art', 'artist', 'bold', 'header', 'headline', 'quote', 'layout', 'paper', 'format',
  'create', 'created', 'repeat', 'shine', 'glow', 'warm', 'green', 'coral', 'cyan',
  'grand', 'opening', 'offer', 'exclusive', 'discount', 'quality', 'custom', 'craft'
];

// Telugu word vocabulary & English Latin-to-Telugu phonetic dictionary
const TELUGU_DICTIONARY = {
  // Common greetings & everyday words
  namaskaram: 'నమస్కారం',
  namaste: 'నమస్తే',
  telugu: 'తెలుగు',
  bhasha: 'భాష',
  swagatham: 'స్వాగతం',
  dhanyavadalu: 'ధన్యవాదాలు',
  subhakankshalu: 'శుభాకాంక్షలు',
  shubhakankshalu: 'శుభాకాంక్షలు',
  subhodayam: 'శుభోదయం',
  shubhodayam: 'శుభోదయం',
  shubham: 'శుభం',
  subham: 'శుభం',
  ugadi: 'ఉగాది',
  sankranthi: 'సంక్రాంతి',
  deepavali: 'దీపావళి',
  diwali: 'దీపావళి',
  aahvanam: 'ఆహ్వానం',
  ahvanam: 'ఆహ్వానం',
  pelli: 'పెళ్లి',
  vivaham: 'వివాహం',
  puttinaroju: 'పుట్టినరోజు',
  janmadinam: 'జన్మదినం',
  amma: 'అమ్మ',
  nanna: 'నాన్న',
  akka: 'అక్క',
  chelli: 'చెల్లి',
  anna: 'అన్న',
  thammudu: 'తమ్ముడు',
  tammudu: 'తమ్ముడు',
  andaru: 'అందరూ',
  andariki: 'అందరికీ',
  prem: 'ప్రేమ',
  prema: 'ప్రేమ',
  santosham: 'సంతోషం',
  anandam: 'ఆనందం',
  manchi: 'మంచి',
  meeru: 'మీరు',
  nuvvu: 'నువ్వు',
  nenu: 'నేను',
  memu: 'మేము',
  manamu: 'మనము',
  ela: 'ఎలా',
  unnaru: 'ఉన్నారు',
  unnanu: 'ఉన్నాను',
  bagunnara: 'బాగున్నారా',
  bagundi: 'బాగుంది',
  chesuko: 'చేసుకో',
  chala: 'చాలా',
  sare: 'సరే',
  avunu: 'అవును',
  kaadu: 'కాదు',
  kotha: 'కొత్త',
  roju: 'రోజు',
  raatri: 'రాత్రి',
  snehithulu: 'స్నేహితులు',
  mithrudu: 'మిత్రుడు',
  mitrudu: 'మిత్రుడు',
  welcome: 'స్వాగతం',
  thankyou: 'ధన్యవాదాలు',
  thanks: 'ధన్యవాదాలు',
  vijayam: 'విజయం',
  bhavan: 'భవన్',
  patrika: 'పత్రిక',
  veduka: 'వేడుక',
  utsavam: 'ఉత్సవం',
  sahithi: 'సాహితి',
  kavitha: 'కవిత',
  kala: 'కళ',
  chithram: 'చిత్రం',
  chitram: 'చిత్రం',
  mudrana: 'ముద్రణ',
  lekha: 'లేఖ',
};

// Common misspellings for basic autocorrect
const AUTOCORRECT_MAP = {
  teh: 'the',
  adn: 'and',
  waht: 'what',
  thier: 'their',
  dont: "don't",
  cant: "can't",
  wont: "won't",
  youre: "you're",
  im: "I'm",
  ive: "I've",
  recieve: 'receive',
  seperate: 'separate',
  untill: 'until',
  occured: 'occurred',
  definately: 'definitely',
  desing: 'design',
  prnit: 'print',
  posetr: 'poster',
  buisness: 'business',
  invitaion: 'invitation',
};

/**
 * Phonetic transliterator fallback algorithm for any Latin string to Telugu
 */
function phoneticTelugu(latin) {
  const str = latin.toLowerCase();
  if (TELUGU_DICTIONARY[str]) {
    return TELUGU_DICTIONARY[str];
  }

  // Multi-character consonant and vowel replacements
  const mapping = [
    // Special prefixes
    ['ksh', 'క్ష'], ['shh', 'ష'], ['sh', 'శ'], ['ch', 'చ'], ['chh', 'ఛ'],
    ['th', 'థ'], ['dh', 'ధ'], ['ph', 'ఫ'], ['bh', 'భ'], ['gh', 'ఘ'],
    ['jh', 'ఝ'], ['kh', 'ఖ'],
    // Vowels
    ['aa', 'ా'], ['ee', 'ీ'], ['oo', 'ూ'], ['ai', 'ై'], ['au', 'ౌ'],
    ['a', ''], ['i', 'ి'], ['e', 'ె'], ['u', 'ు'], ['o', 'ొ'],
    // Single consonants
    ['k', 'క'], ['g', 'గ'], ['j', 'జ'], ['t', 'ట'], ['d', 'డ'],
    ['n', 'న'], ['p', 'ప'], ['b', 'బ'], ['m', 'మ'], ['y', 'య'],
    ['r', 'ర'], ['l', 'ల'], ['v', 'వ'], ['w', 'వ'], ['s', 'స'],
    ['h', 'హ'], ['f', 'ఫ']
  ];

  let result = '';
  let i = 0;
  while (i < str.length) {
    let matched = false;
    for (const [seq, char] of mapping) {
      if (str.startsWith(seq, i)) {
        result += char;
        i += seq.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // If no phonetic match, preserve or append virama if consonant
      result += str[i];
      i++;
    }
  }

  return result || latin;
}

/**
 * Extract current word being typed at caret index
 */
export function getCurrentWordInfo(text, caretPos) {
  const safeText = String(text || '');
  const pos = Math.max(0, Math.min(caretPos, safeText.length));

  // Find start of current word (delimiter: whitespace or punctuation)
  let start = pos;
  while (start > 0 && /[^\s,.;:!?\n\r]/.test(safeText[start - 1])) {
    start--;
  }

  // Find end of current word
  let end = pos;
  while (end < safeText.length && /[^\s,.;:!?\n\r]/.test(safeText[end])) {
    end++;
  }

  const word = safeText.slice(start, pos);
  const fullWord = safeText.slice(start, end);

  return {
    word,
    fullWord,
    start,
    end,
    hasPrefix: word.length > 0,
  };
}

/**
 * Generate intelligent Gboard-style candidates
 * @param {string} text - The full text in active element
 * @param {number} caret - Current cursor position
 * @param {string} lang - 'en' | 'te'
 * @returns {Array<{ text: string, type: 'autocorrect'|'completion'|'transliteration'|'literal'|'fallback', isPrimary: boolean, label?: string }>}
 */
export function getSuggestions(text, caret, lang = 'en') {
  const { word } = getCurrentWordInfo(text, caret);

  if (!word || word.trim().length === 0) {
    // Context-sensitive starter suggestions when starting a line or sentence
    if (lang === 'te') {
      return [
        { text: 'నమస్కారం', type: 'literal', isPrimary: true },
        { text: 'స్వాగతం', type: 'literal', isPrimary: false },
        { text: 'శుభాకాంక్షలు', type: 'literal', isPrimary: false },
        { text: 'ధన్యవాదాలు', type: 'literal', isPrimary: false },
      ];
    }
    return [
      { text: 'Welcome', type: 'literal', isPrimary: true },
      { text: 'Studio', type: 'literal', isPrimary: false },
      { text: 'Print', type: 'literal', isPrimary: false },
      { text: 'Design', type: 'literal', isPrimary: false },
    ];
  }

  const lower = word.toLowerCase();
  const isCapitalized = word[0] === word[0].toUpperCase() && word.length > 1 && word[1] === word[1].toLowerCase();
  const isAllUpper = word.length > 1 && word === word.toUpperCase();

  const formatCase = (str) => {
    if (!str || typeof str !== 'string') return '';
    if (isAllUpper) return str.toUpperCase();
    if (isCapitalized) return str[0].toUpperCase() + str.slice(1);
    return str;
  };

  const candidates = [];

  // 1. Check Telugu Transliteration dictionary
  if (TELUGU_DICTIONARY[lower]) {
    candidates.push({
      text: TELUGU_DICTIONARY[lower],
      type: 'transliteration',
      isPrimary: true,
      label: 'తెలుగు',
    });
  }

  // 2. Check Autocorrect
  if (AUTOCORRECT_MAP[lower]) {
    const corrected = formatCase(AUTOCORRECT_MAP[lower]);
    candidates.push({
      text: corrected,
      type: 'autocorrect',
      isPrimary: candidates.length === 0,
      label: 'Correction',
    });
  }

  // 3. Word completion from English dictionary
  const completions = ENGLISH_DICTIONARY
    .filter((w) => w.startsWith(lower) && w !== lower)
    .slice(0, 3)
    .map((w) => ({
      text: formatCase(w),
      type: 'completion',
      isPrimary: candidates.length === 0,
    }));

  candidates.push(...completions);

  // 4. If language is Telugu and not yet matched, try phonetic transliteration
  if (lang === 'te' && !TELUGU_DICTIONARY[lower] && /[a-z]/i.test(lower)) {
    const phonetic = phoneticTelugu(lower);
    if (phonetic && phonetic !== lower) {
      candidates.unshift({
        text: phonetic,
        type: 'transliteration',
        isPrimary: true,
        label: 'తెలుగు (ధ్వని)',
      });
    }
  }

  // 5. Always include the literal typed word (allows user to reject correction/completion)
  const hasLiteral = candidates.some((c) => c.text.toLowerCase() === word.toLowerCase());
  if (!hasLiteral) {
    candidates.push({
      text: `“${word}”`,
      actualValue: word,
      type: 'literal',
      isPrimary: candidates.length === 0,
      label: 'Keep typed',
    });
  }

  // 6. Alternative title case or uppercase
  if (!isCapitalized && word.length > 1 && /^[a-z]+$/.test(word)) {
    const title = word[0].toUpperCase() + word.slice(1);
    if (!candidates.some((c) => c.text === title)) {
      candidates.push({ text: title, type: 'fallback', isPrimary: false });
    }
  }

  return candidates.slice(0, 4);
}
