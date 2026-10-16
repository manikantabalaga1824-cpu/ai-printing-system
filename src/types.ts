export type ViewType = 'home' | 'editor' | 'templates' | 'projects' | 'ai' | 'integrations';

export type ElementType = 'text' | 'shape' | 'image';
export type ShapeKind = 'rect' | 'ellipse';
export type TextAlign = 'left' | 'center' | 'right';
export type FontFamily = 'sans' | 'serif' | 'mono';
export type ImageFit = 'contain' | 'cover' | 'fill';

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  color: string;
  size: number;
  weight: number;
  align: TextAlign;
  lh: number;
  font: FontFamily;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: ShapeKind;
  fill: string;
  stroke: string;
  sw: number;
  radius: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt: string;
  fit: ImageFit;
}

export type DesignElement = TextElement | ShapeElement | ImageElement;

export interface ProjectDoc {
  id: string;
  version: 1;
  name: string;
  width: number;
  height: number;
  background: string;
  elements: DesignElement[];
  created: string;
  updated: string;
}

export interface Preset {
  id: string;
  name: string;
  w: number;
  h: number;
  category: string;
}

export interface TemplateData {
  id: string;
  name: string;
  category: string;
  preset: string;
  bg: string;
  accent: string;
  title: string;
  sub: string;
  elements: Array<Partial<DesignElement> & { type: ElementType }>;
}

export interface ToastMessage {
  id: string;
  message: string;
  isError?: boolean;
}
