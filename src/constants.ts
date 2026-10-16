import { Preset, TemplateData } from './types';

export const STORAGE_PREFIX = 'aiprintos:workspace:v1:';
export const HEX_REGEX = /^#[0-9a-f]{6}$/i;
export const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export const FONT_STACK = "'DM Sans',system-ui,-apple-system,'Noto Sans Telugu','Nirmala UI','Gautami',sans-serif";
export const SERIF_STACK = "Georgia,'Noto Serif Telugu','Nirmala UI',serif";
export const MONO_STACK = "'DM Mono',ui-monospace,monospace";

export const PRESETS: Preset[] = [
  { id: 'business', name: 'Business card', w: 1050, h: 600, category: 'Branding' },
  { id: 'a4', name: 'A4 portrait', w: 794, h: 1123, category: 'Print' },
  { id: 'poster', name: 'Poster', w: 900, h: 1200, category: 'Print' },
  { id: 'square', name: 'Social post', w: 1080, h: 1080, category: 'Digital' },
  { id: 'story', name: 'Story', w: 1080, h: 1920, category: 'Digital' },
  { id: 'invite', name: 'Invitation', w: 720, h: 1008, category: 'Events' },
  { id: 'flyer', name: 'Flyer', w: 794, h: 1123, category: 'Print' },
  { id: 'certificate', name: 'Certificate', w: 1123, h: 794, category: 'Events' },
];

export const TEMPLATE_DATA: TemplateData[] = [
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

export const TELUGU_BASIC_ROWS = [
  ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఎ', 'ఏ', 'ఐ', 'ఒ'],
  ['క', 'ఖ', 'గ', 'ఘ', 'చ', 'జ', 'ట', 'డ', 'త', 'ద'],
  ['న', 'ప', 'బ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'స'],
  ['ా', 'ి', 'ీ', 'ు', 'ూ', 'ె', 'ే', 'ై', 'ం', 'ః'],
  ['?123', 'English', '😊', 'space', '⌫', '↵'],
];

export const TELUGU_EXTRA_ROWS = [
  ['౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯', '౦'],
  ['!', '@', '#', '$', '%', '&', '-', '+', '(', ')'],
  ['*', '"', "'", ':', ';', '/', '?', '⌫'],
  ['ABC', ',', '😊', 'space', '.', '↵'],
];

export const ENGLISH_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
  ['?123', ',', '😊', 'space', '.', '↵'],
];

export const ENGLISH_SYMBOL_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['@', '#', '$', '%', '&', '-', '+', '(', ')'],
  ['*', '"', "'", ':', ';', '/', '?', '⌫'],
  ['ABC', ',', '😊', 'space', '.', '↵'],
];

export const WORD_MAP: Record<string, string> = {
  namaskaram: 'నమస్కారం',
  namaste: 'నమస్తే',
  telugu: 'తెలుగు',
  bhasha: 'భాష',
  swagatham: 'స్వాగతం',
  dhanyavadalu: 'ధన్యవాదాలు',
  subhakankshalu: 'శుభాకాంక్షలు',
  ugadi: 'ఉగాది',
  aahvanam: 'ఆహ్వానం',
  pelli: 'పెళ్లి',
  puttinaroju: 'పుట్టినరోజు',
  amma: 'అమ్మ',
  nanna: 'నాన్న',
  andaru: 'అందరూ',
  prem: 'ప్రేమ',
  santosham: 'సంతోషం',
  manchi: 'మంచి',
  meeru: 'మీరు',
  ela: 'ఎలా',
  unnaru: 'ఉన్నారు',
  bagunnara: 'బాగున్నారా',
  chesuko: 'చేసుకో',
  chala: 'చాలా',
  sare: 'సరే',
  avunu: 'అవును',
  kaadu: 'కాదు',
  kotha: 'కొత్త',
  roju: 'రోజు',
  subhodayam: 'శుభోదయం',
  raatri: 'రాత్రి',
  snehithulu: 'స్నేహితులు',
  welcome: 'స్వాగతం',
  thankyou: 'ధన్యవాదాలు',
};

export const EMOJIS = ['😀', '😃', '😄', '😁', '😊', '😍', '🥳', '🎉', '✨', '❤️', '🙏', '👍', '🌿', '🌸', '🎨', '🖨️', '💐', '⭐', '🔥', '💫'];
