/**
 * Acceptance Test Suite for AI PrintOS Gboard-Style Virtual Keyboard
 */

import { getSuggestions, getCurrentWordInfo } from './keyboard/suggestions.js';
import { searchEmojis, EMOJI_CATEGORIES } from './keyboard/emojis.js';
import {
  ENGLISH_LAYOUT,
  TELUGU_LAYOUT,
  TELUGU_MATRA_LAYOUT,
  SYMBOLS_LAYOUT,
  MORE_SYMBOLS_LAYOUT,
} from './keyboard/layouts.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- Testing Virtual Keyboard Layouts ---');
assert(ENGLISH_LAYOUT.rows.length === 4, 'English layout has 4 rows');
assert(TELUGU_LAYOUT.rows.length === 5, 'Telugu Unicode layout has 5 rows');
assert(TELUGU_MATRA_LAYOUT.rows.length === 4, 'Telugu matra layout has 4 rows');
assert(SYMBOLS_LAYOUT.rows.length === 4, 'Symbols layout has 4 rows');
assert(MORE_SYMBOLS_LAYOUT.rows.length === 4, 'Extended symbols layout has 4 rows');

console.log('--- Testing Word Extraction & Caret Detection ---');
const text1 = 'Hello world design';
const info1 = getCurrentWordInfo(text1, 5); // after 'Hello'
assert(info1.word === 'Hello', `Extracted word '${info1.word}' matches 'Hello'`);

const info2 = getCurrentWordInfo('namaskaram friend', 10);
assert(info2.word === 'namaskaram', `Extracted word '${info2.word}' matches 'namaskaram'`);

console.log('--- Testing Telugu Transliteration ---');
const teSuggestions = getSuggestions('namaskaram', 10, 'te');
assert(teSuggestions.length > 0, 'Suggestions returned for namaskaram');
const tePrimary = teSuggestions[0];
assert(tePrimary.text === 'నమస్కారం', `namaskaram transliterates to '${tePrimary.text}'`);

const teSuggestions2 = getSuggestions('telugu', 6, 'te');
assert(teSuggestions2[0].text === 'తెలుగు', `telugu transliterates to '${teSuggestions2[0].text}'`);

const teSuggestions3 = getSuggestions('dhanyavadalu', 12, 'te');
assert(teSuggestions3[0].text === 'ధన్యవాదాలు', `dhanyavadalu transliterates to '${teSuggestions3[0].text}'`);

console.log('--- Testing English Autocorrect & Completion ---');
const autoSuggestions = getSuggestions('teh', 3, 'en');
assert(autoSuggestions.some((c) => c.text === 'the'), `Autocorrects 'teh' to 'the'`);

const compSuggestions = getSuggestions('des', 3, 'en');
assert(compSuggestions.some((c) => c.text.toLowerCase().startsWith('des')), 'Completion finds word starting with des');

const literalOption = autoSuggestions.find((c) => c.actualValue === 'teh' || c.text === '“teh”');
assert(Boolean(literalOption), 'Literal typed option is present to reject autocorrect');

console.log('--- Testing Emoji Catalog & Search ---');
assert(EMOJI_CATEGORIES.length >= 5, 'At least 5 emoji categories defined');
const heartResults = searchEmojis('heart');
assert(heartResults.length > 0, `Search for 'heart' returns ${heartResults.length} emojis`);
const partyResults = searchEmojis('party');
assert(partyResults.some((e) => e.char === '🎉' || e.char === '🥳'), 'Found celebration party emojis');

console.log(`\n========================================`);
console.log(`Tests Passed: ${passed}, Tests Failed: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
