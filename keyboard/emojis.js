/**
 * Categorized and Searchable Emoji Catalog for Gboard-style Picker
 */

export const EMOJI_CATEGORIES = [
  { id: 'smileys', name: 'Smileys', icon: '😄' },
  { id: 'gestures', name: 'Gestures', icon: '👋' },
  { id: 'nature', name: 'Nature', icon: '🌿' },
  { id: 'design', name: 'Design & Craft', icon: '🎨' },
  { id: 'celebrate', name: 'Celebration', icon: '🎉' },
  { id: 'symbols', name: 'Symbols', icon: '❤️' },
];

export const EMOJI_DATA = [
  // Smileys & Emotion
  { char: '😀', name: 'grinning face', cat: 'smileys' },
  { char: '😃', name: 'smiling face with big eyes', cat: 'smileys' },
  { char: '😄', name: 'smiling face with smiling eyes', cat: 'smileys' },
  { char: '😁', name: 'beaming face', cat: 'smileys' },
  { char: '😆', name: 'grinning squinting face', cat: 'smileys' },
  { char: '😅', name: 'grinning face with sweat', cat: 'smileys' },
  { char: '😂', name: 'face with tears of joy', cat: 'smileys' },
  { char: '🤣', name: 'rolling on the floor laughing', cat: 'smileys' },
  { char: '😊', name: 'smiling face', cat: 'smileys' },
  { char: '😇', name: 'smiling face with halo', cat: 'smileys' },
  { char: '🙂', name: 'slightly smiling face', cat: 'smileys' },
  { char: '😉', name: 'winking face', cat: 'smileys' },
  { char: '😍', name: 'heart eyes', cat: 'smileys' },
  { char: '🥰', name: 'smiling face with hearts', cat: 'smileys' },
  { char: '😘', name: 'face blowing a kiss', cat: 'smileys' },
  { char: '😋', name: 'face savoring food', cat: 'smileys' },
  { char: '😎', name: 'smiling face with sunglasses', cat: 'smileys' },
  { char: '🥳', name: 'partying face celebration', cat: 'smileys' },
  { char: '🤩', name: 'star struck', cat: 'smileys' },
  { char: '🥺', name: 'pleading face', cat: 'smileys' },
  { char: '🤗', name: 'hugging face', cat: 'smileys' },
  { char: '🤔', name: 'thinking face', cat: 'smileys' },
  { char: '😌', name: 'relieved face', cat: 'smileys' },
  { char: '😴', name: 'sleeping face', cat: 'smileys' },

  // Gestures & People
  { char: '👋', name: 'waving hand hello', cat: 'gestures' },
  { char: '🤚', name: 'raised back of hand', cat: 'gestures' },
  { char: '✋', name: 'raised hand', cat: 'gestures' },
  { char: '👌', name: 'OK hand sign', cat: 'gestures' },
  { char: '🤌', name: 'pinched fingers', cat: 'gestures' },
  { char: '✌️', name: 'peace victory hand', cat: 'gestures' },
  { char: '🤞', name: 'crossed fingers good luck', cat: 'gestures' },
  { char: '🤟', name: 'love you gesture', cat: 'gestures' },
  { char: '👍', name: 'thumbs up like approve', cat: 'gestures' },
  { char: '👎', name: 'thumbs down', cat: 'gestures' },
  { char: '👏', name: 'clapping hands applause', cat: 'gestures' },
  { char: '🙌', name: 'raising hands celebration', cat: 'gestures' },
  { char: '🤝', name: 'handshake deal partner', cat: 'gestures' },
  { char: '🙏', name: 'folded hands prayer please thank you namaskaram namaste', cat: 'gestures' },
  { char: '✍️', name: 'writing hand note', cat: 'gestures' },
  { char: '💪', name: 'flexed biceps muscle strength', cat: 'gestures' },

  // Nature & Floral
  { char: '🌿', name: 'herb leaf greenery botanic', cat: 'nature' },
  { char: '🌱', name: 'seedling sprout plant grow', cat: 'nature' },
  { char: '☘️', name: 'shamrock clover', cat: 'nature' },
  { char: '🍀', name: 'four leaf clover luck', cat: 'nature' },
  { char: '🍃', name: 'leaf fluttering in wind', cat: 'nature' },
  { char: '🍂', name: 'fallen leaf autumn', cat: 'nature' },
  { char: '🌸', name: 'cherry blossom flower pink', cat: 'nature' },
  { char: '🌺', name: 'hibiscus flower tropical', cat: 'nature' },
  { char: '🌻', name: 'sunflower yellow sunny', cat: 'nature' },
  { char: '🌹', name: 'rose flower red romantic', cat: 'nature' },
  { char: '🌷', name: 'tulip flower spring', cat: 'nature' },
  { char: '🌼', name: 'blossom flower yellow', cat: 'nature' },
  { char: '💐', name: 'bouquet flowers celebration wedding gift', cat: 'nature' },
  { char: '☀️', name: 'sun sunny warm bright day', cat: 'nature' },
  { char: '🌙', name: 'crescent moon night evening', cat: 'nature' },
  { char: '⭐', name: 'star gold shine rating', cat: 'nature' },
  { char: '🌟', name: 'glowing star sparkle', cat: 'nature' },
  { char: '✨', name: 'sparkles magic shine clean', cat: 'nature' },
  { char: '⚡', name: 'high voltage lightning bolt energy', cat: 'nature' },
  { char: '🔥', name: 'fire flame hot trendy', cat: 'nature' },
  { char: '🌈', name: 'rainbow colors creative', cat: 'nature' },

  // Design & Craft Tools
  { char: '🎨', name: 'artist palette colors paint art design studio', cat: 'design' },
  { char: '🖌️', name: 'paintbrush artist draw sketch', cat: 'design' },
  { char: '🖍️', name: 'crayon draw color', cat: 'design' },
  { char: '✒️', name: 'black nib fountain pen calligraphy ink', cat: 'design' },
  { char: '🖋️', name: 'fountain pen writing', cat: 'design' },
  { char: '🖊️', name: 'pen ballpoint write note', cat: 'design' },
  { char: '✏️', name: 'pencil sketch design write', cat: 'design' },
  { char: '📝', name: 'memo paper note write draft', cat: 'design' },
  { char: '📏', name: 'straight ruler measure layout size dimension', cat: 'design' },
  { char: '📐', name: 'triangular ruler angle geometry design', cat: 'design' },
  { char: '✂️', name: 'scissors cut crop trim bleed', cat: 'design' },
  { char: '🖨️', name: 'printer printing print press paper machine', cat: 'design' },
  { char: '📷', name: 'camera photo image capture', cat: 'design' },
  { char: '📸', name: 'camera with flash photograph', cat: 'design' },
  { char: '💻', name: 'laptop computer desktop digital', cat: 'design' },
  { char: '📱', name: 'mobile phone smartphone screen social', cat: 'design' },
  { char: '💡', name: 'light bulb idea creative thinking innovation', cat: 'design' },
  { char: '📦', name: 'package parcel deliver box product', cat: 'design' },
  { char: '🏷️', name: 'label tag brand price', cat: 'design' },
  { char: '📜', name: 'scroll certificate invitation decree parchment', cat: 'design' },
  { char: '📄', name: 'page document flyer sheet paper', cat: 'design' },
  { char: '🖼️', name: 'framed picture poster art photo portrait', cat: 'design' },

  // Celebrations & Events
  { char: '🎉', name: 'party popper celebration festival invite event', cat: 'celebrate' },
  { char: '🎊', name: 'confetti ball celebration congrats', cat: 'celebrate' },
  { char: '🎈', name: 'balloon birthday party celebration', cat: 'celebrate' },
  { char: '🎂', name: 'birthday cake celebration anniversary party', cat: 'celebrate' },
  { char: '🍰', name: 'shortcake slice dessert', cat: 'celebrate' },
  { char: '🥂', name: 'clinking glasses toast cheers wedding drinks celebration', cat: 'celebrate' },
  { char: '🍾', name: 'bottle with popping cork champagne wine celebration', cat: 'celebrate' },
  { char: '🎁', name: 'wrapped gift present surprise package birthday', cat: 'celebrate' },
  { char: '🎀', name: 'ribbon decoration bow cute', cat: 'celebrate' },
  { char: '🎆', name: 'fireworks celebration festival diwali new year', cat: 'celebrate' },
  { char: '🎇', name: 'sparkler celebration fireworks', cat: 'celebrate' },
  { char: '🏆', name: 'trophy prize award winner champion certificate', cat: 'celebrate' },
  { char: '🥇', name: '1st place medal gold award winner', cat: 'celebrate' },
  { char: '👑', name: 'crown royal king queen luxury elegance', cat: 'celebrate' },
  { char: '💍', name: 'ring diamond wedding engagement jewelry', cat: 'celebrate' },
  { char: '🎟️', name: 'admission tickets concert event invite pass', cat: 'celebrate' },

  // Symbols & Hearts
  { char: '❤️', name: 'red heart love passion romance', cat: 'symbols' },
  { char: '🧡', name: 'orange heart warm friendly', cat: 'symbols' },
  { char: '💛', name: 'yellow heart friendship happiness', cat: 'symbols' },
  { char: '💚', name: 'green heart organic botanical eco', cat: 'symbols' },
  { char: '💙', name: 'blue heart calm trust studio', cat: 'symbols' },
  { char: '💜', name: 'purple lilac heart creative luxury', cat: 'symbols' },
  { char: '🖤', name: 'black heart dark modern minimal', cat: 'symbols' },
  { char: '🤍', name: 'white heart pure clean peace', cat: 'symbols' },
  { char: '💖', name: 'sparkling heart love shine', cat: 'symbols' },
  { char: '💯', name: 'hundred points perfect top quality', cat: 'symbols' },
  { char: '✔️', name: 'check mark verified success complete ok', cat: 'symbols' },
  { char: '💫', name: 'dizzy star shooting sparkle', cat: 'symbols' },
  { char: '✦', name: 'four pointed star diamond asterisk', cat: 'symbols' },
  { char: '✳', name: 'eight spoked asterisk star burst brand', cat: 'symbols' },
];

export function searchEmojis(query, category = 'all') {
  const q = String(query || '').trim().toLowerCase();
  return EMOJI_DATA.filter((item) => {
    const matchCat = category === 'all' || item.cat === category;
    const matchQuery = !q || item.name.includes(q) || item.char === q;
    return matchCat && matchQuery;
  });
}
