import { DesignElement, ProjectDoc, TextElement, ShapeElement, ImageElement, Preset, TemplateData } from '../types';
import { STORAGE_PREFIX, HEX_REGEX, PRESETS, FONT_STACK, SERIF_STACK, MONO_STACK } from '../constants';

export const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36).slice(-4)}`;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const safeSlug = (value: string) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'design';

export const nowISO = () => new Date().toISOString();

export function cleanColor(value: any, allowTransparent = false): boolean {
  if (typeof value !== 'string') return false;
  return HEX_REGEX.test(value) || (allowTransparent && value === 'transparent');
}

export function validateDocument(input: any): ProjectDoc {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Project JSON must contain an object.');
  }
  if (input.version !== 1) {
    throw new Error('Unsupported project version.');
  }
  if (typeof input.id !== 'string' || input.id.length > 100) {
    throw new Error('Invalid project ID.');
  }
  if (typeof input.name !== 'string' || input.name.length > 120) {
    throw new Error('Project name must be at most 120 characters.');
  }
  const width = Number(input.width);
  const height = Number(input.height);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 50 || height < 50 || width > 10000 || height > 10000) {
    throw new Error('Canvas dimensions must be whole numbers from 50 to 10000.');
  }
  if (!cleanColor(input.background)) {
    throw new Error('Invalid background color.');
  }
  if (!Array.isArray(input.elements) || input.elements.length > 300) {
    throw new Error('A project may contain at most 300 elements.');
  }

  const seen = new Set<string>();
  const elements: DesignElement[] = input.elements.map((raw: any, index: number) => {
    if (!raw || typeof raw !== 'object' || !['text', 'shape', 'image'].includes(raw.type)) {
      throw new Error(`Invalid element at index ${index}.`);
    }
    if (typeof raw.id !== 'string' || raw.id.length > 100 || seen.has(raw.id)) {
      throw new Error(`Invalid or duplicate element ID at index ${index}.`);
    }
    seen.add(raw.id);

    const getNum = (key: string, min: number, max: number) => {
      const n = Number(raw[key]);
      if (!Number.isFinite(n) || n < min || n > max) throw new Error(`Invalid ${key} for element ${index}.`);
      return n;
    };

    const base = {
      id: raw.id,
      type: raw.type as 'text' | 'shape' | 'image',
      name: String(raw.name || raw.type).slice(0, 100),
      x: getNum('x', -100000, 100000),
      y: getNum('y', -100000, 100000),
      w: getNum('w', 1, 100000),
      h: getNum('h', 1, 100000),
      opacity: getNum('opacity', 0, 1),
    };

    if (raw.type === 'text') {
      if (typeof raw.text !== 'string' || raw.text.length > 12000) {
        throw new Error(`Invalid text content in element ${index}.`);
      }
      if (!cleanColor(raw.color)) throw new Error(`Invalid text color in element ${index}.`);
      const validWeights = [400, 500, 600, 700, 800];
      const validAligns = ['left', 'center', 'right'];
      const validFonts = ['sans', 'serif', 'mono'];

      return {
        ...base,
        type: 'text',
        text: raw.text,
        color: raw.color,
        size: getNum('size', 1, 1000),
        weight: validWeights.includes(raw.weight) ? raw.weight : 400,
        align: validAligns.includes(raw.align) ? raw.align : 'left',
        lh: getNum('lh', 0.5, 3),
        font: validFonts.includes(raw.font) ? raw.font : 'sans',
      } as TextElement;
    } else if (raw.type === 'shape') {
      if (!['rect', 'ellipse'].includes(raw.shape)) throw new Error(`Invalid shape at element ${index}.`);
      if (!cleanColor(raw.fill, true) || !cleanColor(raw.stroke, true)) {
        throw new Error(`Invalid shape color at element ${index}.`);
      }
      return {
        ...base,
        type: 'shape',
        shape: raw.shape,
        fill: raw.fill,
        stroke: raw.stroke,
        sw: getNum('sw', 0, 100),
        radius: getNum('radius', 0, 1000),
      } as ShapeElement;
    } else {
      if (typeof raw.src !== 'string' || raw.src.length > 8500000 || !/^data:image\/(png|jpeg|webp);base64,/.test(raw.src)) {
        throw new Error(`Images in imported projects must be embedded PNG, JPEG or WebP files (element ${index}).`);
      }
      const validFits = ['contain', 'cover', 'fill'];
      return {
        ...base,
        type: 'image',
        src: raw.src,
        alt: String(raw.alt || '').slice(0, 300),
        fit: validFits.includes(raw.fit) ? raw.fit : 'contain',
      } as ImageElement;
    }
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

export const storage = {
  all(): { ok: boolean; docs: ProjectDoc[]; error?: string } {
    const list: ProjectDoc[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              list.push(validateDocument(JSON.parse(raw)));
            }
          } catch (e: any) {
            console.warn('Skipped invalid locally stored project:', e?.message);
          }
        }
      }
      return { ok: true, docs: list.sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated)) };
    } catch (_e) {
      return { ok: false, docs: [], error: 'Browser storage is unavailable in this context.' };
    }
  },

  get(id: string): { ok: boolean; doc?: ProjectDoc; error?: string } {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + id);
      if (!raw) return { ok: false, error: 'This project was not found in this browser.' };
      return { ok: true, doc: validateDocument(JSON.parse(raw)) };
    } catch (_e) {
      return { ok: false, error: 'This locally saved project could not be read.' };
    }
  },

  save(doc: ProjectDoc): { ok: boolean; error?: string } {
    try {
      doc.updated = nowISO();
      localStorage.setItem(STORAGE_PREFIX + doc.id, JSON.stringify(doc));
      return { ok: true };
    } catch (e: any) {
      return {
        ok: false,
        error: e?.name === 'QuotaExceededError'
          ? 'Browser storage is full. Export JSON or remove old projects.'
          : 'The browser could not save this project.',
      };
    }
  },

  remove(id: string): { ok: boolean; error?: string } {
    try {
      localStorage.removeItem(STORAGE_PREFIX + id);
      return { ok: true };
    } catch (_e) {
      return { ok: false, error: 'Browser storage is unavailable.' };
    }
  },
};

export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadJSON(doc: ProjectDoc) {
  downloadBlob(`${safeSlug(doc.name)}.aiprintos.json`, new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' }));
}

export function blankDocument(name = 'Untitled design', preset: Preset = PRESETS[1]): ProjectDoc {
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

export function templateDocument(template: TemplateData): ProjectDoc {
  const preset = PRESETS.find((p) => p.id === template.preset) || PRESETS[1];
  const elements: DesignElement[] = template.elements.map((el) => {
    const id = uid(el.type[0]);
    if (el.type === 'text') {
      return {
        id,
        type: 'text',
        name: el.name || 'Text',
        x: el.x || 60,
        y: el.y || 60,
        w: el.w || 400,
        h: el.h || 100,
        opacity: el.opacity ?? 1,
        text: (el as any).text || '',
        color: (el as any).color || '#1b2a31',
        size: (el as any).size || 32,
        weight: (el as any).weight || 700,
        align: (el as any).align || 'left',
        lh: (el as any).lh || 1.2,
        font: (el as any).font || 'sans',
      } as TextElement;
    } else if (el.type === 'shape') {
      return {
        id,
        type: 'shape',
        name: el.name || 'Shape',
        shape: (el as any).shape || 'rect',
        x: el.x || 60,
        y: el.y || 60,
        w: el.w || 200,
        h: el.h || 200,
        opacity: el.opacity ?? 1,
        fill: (el as any).fill || '#75e6d0',
        stroke: (el as any).stroke || 'transparent',
        sw: (el as any).sw || 0,
        radius: (el as any).radius || 0,
      } as ShapeElement;
    } else {
      return {
        id,
        type: 'image',
        name: el.name || 'Image',
        x: el.x || 60,
        y: el.y || 60,
        w: el.w || 300,
        h: el.h || 300,
        opacity: el.opacity ?? 1,
        src: (el as any).src || '',
        alt: (el as any).alt || '',
        fit: (el as any).fit || 'contain',
      } as ImageElement;
    }
  });

  return {
    id: uid('project'),
    version: 1,
    name: template.name,
    width: preset.w,
    height: preset.h,
    background: template.bg,
    elements,
    created: nowISO(),
    updated: nowISO(),
  };
}

export function fontFor(el: TextElement): string {
  return el.font === 'serif' ? SERIF_STACK : el.font === 'mono' ? MONO_STACK : FONT_STACK;
}

export function imageLoad(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The image could not be decoded.'));
    img.src = src;
  });
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
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

export async function exportPNG(doc: ProjectDoc, scale = 2) {
  const width = Math.round(doc.width * scale);
  const height = Math.round(doc.height * scale);
  if (width > 16000 || height > 16000 || width * height > 120000000) {
    throw new Error('The export dimensions are too large. Try a smaller scale.');
  }

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas export is unavailable.');

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
      } else if ((ctx as any).roundRect) {
        (ctx as any).roundRect(el.x, el.y, el.w, el.h, Math.min(el.radius, el.w / 2, el.h / 2));
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
      let x = el.x;
      let y = el.y;
      let w = el.w;
      let h = el.h;
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
      lines.forEach((line, index) => ctx.fillText(line, x, el.y + index * el.size * el.lh, el.w));
    }
    ctx.restore();
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('The browser could not produce a PNG.');
  downloadBlob(`${safeSlug(doc.name)}.png`, blob);
}
