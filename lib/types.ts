import type { CSSProperties } from 'react';

export type AnimationType =
  | 'drift'
  | 'pulse'
  | 'orbit'
  | 'breathe'
  | 'wander'
  | 'none';

export type EasingType = 'sine' | 'ease' | 'linear';

export type BlendMode = GlobalCompositeOperation;

export type BlobShape =
  | 'circle'
  | 'ellipse'
  | 'beam'
  | 'ring'
  | 'triangle'
  | 'scalene'
  | 'square'
  | 'pentagon'
  | 'poly';

export interface AnimationConfig {
  /** Animation movement type */
  type: AnimationType;
  /** Per-blob speed multiplier (default: 1) */
  speed?: number;
  /** Movement amplitude as percentage of container (default: 20) */
  range?: number;
  /** Starting phase offset in degrees 0-360 (default: 0) */
  phase?: number;
  /** Easing function for the animation (default: 'sine') */
  easing?: EasingType;
  /** Full cycle duration in seconds. Overrides the default frequency for every animation type. */
  duration?: number;
}

export interface BlobConfig {
  /** Unique identifier for the blob */
  id?: string;
  /** Blob color - any valid CSS color string */
  color: string;
  /** Horizontal position as percentage 0-100 of container width */
  x: number;
  /** Vertical position as percentage 0-100 of container height */
  y: number;
  /** Blob radius as percentage of min(container width, height). Typical range: 10-80 */
  size: number;
  /** Blob opacity: a single value 0-1 or a [min, max] range that oscillates over opacityDuration (default: 1) */
  opacity?: number | [number, number];
  /** Duration in seconds for one full opacity oscillation when opacity is a range (default: 10) */
  opacityDuration?: number;
  /** Blob shape (default: 'circle') */
  shape?: BlobShape;
  /** Horizontal scale factor for ellipse/beam shapes (default: 1) */
  scaleX?: number;
  /** Vertical scale factor for ellipse/beam shapes (default: 1) */
  scaleY?: number;
  /** Rotation in degrees 0-360 (default: 0) */
  rotation?: number;
  /** Number of vertices for 'poly' shape (default: 6, range 3-12) */
  corners?: number;
  /** Morph speed for 'poly' shape — controls how fast vertices shift (default: 0.3) */
  morphSpeed?: number;
  /** Max vertex displacement multiplier for 'poly' shape (default: 2.5, meaning vertices can grow up to 2.5× base radius) */
  morphRange?: number;
  /** Animation configuration for this blob */
  animation?: AnimationConfig;
}

export interface ZenColorsProps {
  /** Width of the container. CSS value or number in px (default: '100%') */
  width?: string | number;
  /** Height of the container. CSS value or number in px (default: '100%') */
  height?: string | number;
  /** Additional CSS class name for the wrapper */
  className?: string;
  /** Inline styles for the wrapper div */
  style?: CSSProperties;
  /** Background color (default: '#000000') */
  background?: string;
  /** Array of blob configurations */
  blobs: BlobConfig[];
  /** CSS blur amount in pixels applied to the canvas (default: 60) */
  blur?: number;
  /** Canvas composite operation for blending blobs (default: 'lighter') */
  blendMode?: BlendMode;
  /** Global animation speed multiplier (default: 1). Set to 0 to render a static frame and stop the animation loop. */
  speed?: number;
  /** Enable mouse/touch interaction with blobs (default: false) */
  interactive?: boolean;
  /** Strength of mouse interaction 0-100 (default: 30) */
  interactionStrength?: number;
  /** Target frames per second. Supports fractional values (e.g. 0.5 = 1 frame every 2s). Lower values reduce CPU/GPU load (default: 15) */
  targetFps?: number;
  /** Canvas resolution scale factor. Lower values improve performance (default: 1) */
  resolution?: number;
  /** Overflow padding in pixels to prevent blur clipping at edges (default: equals blur value) */
  overflowPadding?: number;
  /** Children rendered on top of the canvas */
  children?: React.ReactNode;
}

/** Internal runtime state for a single blob during animation */
export interface BlobState {
  config: BlobConfig;
  currentX: number;
  currentY: number;
  currentSize: number;
  currentOpacity: number;
  phase: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  texture: OffscreenCanvas | HTMLCanvasElement | null;
  textureColor: string;
  textureSize: number;
  textureShape: BlobShape;
  textureScaleX: number;
  textureScaleY: number;
  textureRotation: number;
  /** Actual pixel dimensions of the cached texture */
  textureWidth: number;
  textureHeight: number;
  /** Persistent interaction offset that lerps smoothly */
  interactionOffsetX: number;
  interactionOffsetY: number;
}

/** A complete preset: partial ZenColorsProps with blobs pre-configured */
export type ZenColorsPreset = Omit<ZenColorsProps, 'children' | 'className' | 'style' | 'width' | 'height'>;
