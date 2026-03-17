import type { BlobConfig, BlobState, BlobShape, BlendMode } from './types';
import { computeAnimation } from './animations';
import { parseColor, createOffscreenCanvas, getContext2D, clamp, degToRad } from './utils';

interface TextureResult {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  width: number;
  height: number;
}

function createCircleTexture(r: number, g: number, b: number, radius: number): TextureResult {
  const size = Math.ceil(radius * 2);
  const canvas = createOffscreenCanvas(size, size);
  const ctx = getContext2D(canvas);
  if (ctx) {
    const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
    gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.8)`);
    gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.3)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return { canvas, width: size, height: size };
}

function createEllipseTexture(
  r: number, g: number, b: number,
  radius: number, scaleX: number, scaleY: number, rotation: number
): TextureResult {
  const baseSize = Math.ceil(radius * 2);
  const diagonal = Math.ceil(baseSize * Math.max(scaleX, scaleY) * 1.42);
  const tw = diagonal;
  const th = diagonal;
  const canvas = createOffscreenCanvas(tw, th);
  const ctx = getContext2D(canvas);
  if (ctx) {
    const cx = tw / 2;
    const cy = th / 2;
    ctx.translate(cx, cy);
    ctx.rotate(degToRad(rotation));
    ctx.scale(scaleX, scaleY);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
    gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.8)`);
    gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.3)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
  }
  return { canvas, width: tw, height: th };
}

function createBeamTexture(
  r: number, g: number, b: number,
  radius: number, scaleX: number, scaleY: number, rotation: number
): TextureResult {
  const beamLength = Math.ceil(radius * 2 * scaleX);
  const beamWidth = Math.ceil(radius * 2 * scaleY);
  const diagonal = Math.ceil(Math.sqrt(beamLength * beamLength + beamWidth * beamWidth));
  const tw = diagonal;
  const th = diagonal;
  const canvas = createOffscreenCanvas(tw, th);
  const ctx = getContext2D(canvas);
  if (ctx) {
    const cx = tw / 2;
    const cy = th / 2;
    ctx.translate(cx, cy);
    ctx.rotate(degToRad(rotation));

    const halfLen = beamLength / 2;
    const halfWid = beamWidth / 2;

    const hGrad = ctx.createLinearGradient(-halfLen, 0, halfLen, 0);
    hGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
    hGrad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.8)`);
    hGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 1)`);
    hGrad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.8)`);
    hGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = hGrad;
    ctx.fillRect(-halfLen, -halfWid, beamLength, beamWidth);

    ctx.globalCompositeOperation = 'destination-in';
    const vGrad = ctx.createLinearGradient(0, -halfWid, 0, halfWid);
    vGrad.addColorStop(0, `rgba(255,255,255,0)`);
    vGrad.addColorStop(0.3, `rgba(255,255,255,1)`);
    vGrad.addColorStop(0.5, `rgba(255,255,255,1)`);
    vGrad.addColorStop(0.7, `rgba(255,255,255,1)`);
    vGrad.addColorStop(1, `rgba(255,255,255,0)`);
    ctx.fillStyle = vGrad;
    ctx.fillRect(-halfLen, -halfWid, beamLength, beamWidth);
  }
  return { canvas, width: tw, height: th };
}

function createRingTexture(r: number, g: number, b: number, radius: number): TextureResult {
  const size = Math.ceil(radius * 2);
  const canvas = createOffscreenCanvas(size, size);
  const ctx = getContext2D(canvas);
  if (ctx) {
    const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
    gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.1)`);
    gradient.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.9)`);
    gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 1)`);
    gradient.addColorStop(0.85, `rgba(${r}, ${g}, ${b}, 0.4)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return { canvas, width: size, height: size };
}

function createPolygonTexture(
  r: number, g: number, b: number,
  radius: number, sides: number,
  scaleX: number, scaleY: number, rotation: number
): TextureResult {
  const maxScale = Math.max(scaleX, scaleY);
  const dim = Math.ceil(radius * 2 * maxScale * 1.42);
  const canvas = createOffscreenCanvas(dim, dim);
  const ctx = getContext2D(canvas);
  if (ctx) {
    const cx = dim / 2;
    const cy = dim / 2;
    ctx.translate(cx, cy);
    ctx.rotate(degToRad(rotation));
    ctx.scale(scaleX, scaleY);

    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const vx = Math.cos(angle) * radius;
      const vy = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.clip();

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
    gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.8)`);
    gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.3)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
  }
  return { canvas, width: dim, height: dim };
}

function createBlobTexture(config: BlobConfig, radius: number): TextureResult {
  const { r, g, b } = parseColor(config.color);
  const shape: BlobShape = config.shape ?? 'circle';
  const scaleX = config.scaleX ?? 1;
  const scaleY = config.scaleY ?? 1;
  const rotation = config.rotation ?? 0;

  switch (shape) {
    case 'ellipse':
      return createEllipseTexture(r, g, b, radius, scaleX, scaleY, rotation);
    case 'beam':
      return createBeamTexture(r, g, b, radius, scaleX, scaleY, rotation);
    case 'ring':
      return createRingTexture(r, g, b, radius);
    case 'triangle':
      return createPolygonTexture(r, g, b, radius, 3, 1, 1, rotation);
    case 'scalene':
      return createPolygonTexture(r, g, b, radius, 3, scaleX, scaleY, rotation);
    case 'square':
      return createPolygonTexture(r, g, b, radius, 4, 1, 1, rotation);
    case 'pentagon':
      return createPolygonTexture(r, g, b, radius, 5, 1, 1, rotation);
    case 'circle':
    default:
      return createCircleTexture(r, g, b, radius);
  }
}

const DEFAULT_BLOB_STATE_TEXTURE = {
  texture: null,
  textureColor: '',
  textureSize: 0,
  textureShape: 'circle' as BlobShape,
  textureScaleX: 1,
  textureScaleY: 1,
  textureRotation: 0,
  textureWidth: 0,
  textureHeight: 0,
  interactionOffsetX: 0,
  interactionOffsetY: 0,
};

function initialOpacity(op: number | [number, number] | undefined): number {
  if (Array.isArray(op)) return op[0];
  return op ?? 1;
}

/** Initialize runtime blob states from configs */
export function initBlobStates(blobs: BlobConfig[]): BlobState[] {
  return blobs.map((config, i) => ({
    config,
    currentX: config.x,
    currentY: config.y,
    currentSize: config.size,
    currentOpacity: initialOpacity(config.opacity),
    phase: config.animation?.phase ?? 0,
    noiseOffsetX: i * 73.7,
    noiseOffsetY: i * 31.3,
    ...DEFAULT_BLOB_STATE_TEXTURE,
  }));
}

/** Sync blob states when configs change (preserves animation continuity) */
export function syncBlobStates(
  existing: BlobState[],
  newConfigs: BlobConfig[]
): BlobState[] {
  return newConfigs.map((config, i) => {
    const prev = existing.find(
      (b) => b.config.id != null && b.config.id === config.id
    ) ?? existing[i];
    if (prev) {
      return {
        ...prev,
        config,
        currentX: config.x,
        currentY: config.y,
        currentSize: config.size,
        currentOpacity: initialOpacity(config.opacity),
      };
    }
    return {
      config,
      currentX: config.x,
      currentY: config.y,
      currentSize: config.size,
      currentOpacity: initialOpacity(config.opacity),
      phase: config.animation?.phase ?? 0,
      noiseOffsetX: i * 73.7,
      noiseOffsetY: i * 31.3,
      ...DEFAULT_BLOB_STATE_TEXTURE,
    };
  });
}

export interface RenderParams {
  canvas: HTMLCanvasElement;
  blobs: BlobState[];
  time: number;
  globalSpeed: number;
  blendMode: BlendMode;
  background: string;
  resolution: number;
  mouseX: number | null;
  mouseY: number | null;
  interactive: boolean;
  interactionStrength: number;
}

function needsTextureRebuild(blob: BlobState, drawRadius: number): boolean {
  if (blob.texture == null) return true;
  if (blob.textureColor !== blob.config.color) return true;
  if (Math.abs(blob.textureSize - drawRadius) > drawRadius * 0.1) return true;
  if (blob.textureShape !== (blob.config.shape ?? 'circle')) return true;
  if (blob.textureScaleX !== (blob.config.scaleX ?? 1)) return true;
  if (blob.textureScaleY !== (blob.config.scaleY ?? 1)) return true;
  if (blob.textureRotation !== (blob.config.rotation ?? 0)) return true;
  return false;
}

export function renderFrame(params: RenderParams): void {
  const {
    canvas,
    blobs,
    time,
    globalSpeed,
    blendMode,
    background,
    resolution,
    mouseX,
    mouseY,
    interactive,
    interactionStrength,
  } = params;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const minDim = Math.min(w, h);
  const adjustedTime = time * globalSpeed;

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = blendMode;

  for (const blob of blobs) {
    const anim = computeAnimation(blob, adjustedTime, blob.config.animation);

    blob.currentX = blob.config.x + anim.dx;
    blob.currentY = blob.config.y + anim.dy;
    blob.currentSize = Math.max(1, blob.config.size + anim.dSize);
    const opCfg = blob.config.opacity ?? 1;
    if (Array.isArray(opCfg)) {
      const [minO, maxO] = opCfg;
      const opDur = blob.config.opacityDuration ?? 10;
      const opFreq = (Math.PI * 2) / opDur;
      const raw = Math.sin(adjustedTime * opFreq + blob.phase);
      const n = (raw + 1) / 2;
      const smooth = n * n * (3 - 2 * n);
      blob.currentOpacity = clamp(minO + (maxO - minO) * smooth + anim.dOpacity, 0, 1);
    } else {
      blob.currentOpacity = clamp(opCfg + anim.dOpacity, 0, 1);
    }

    let targetOffsetX = 0;
    let targetOffsetY = 0;

    if (interactive && mouseX != null && mouseY != null) {
      const bx = (blob.currentX / 100) * w;
      const by = (blob.currentY / 100) * h;
      const dx = bx - mouseX * resolution;
      const dy = by - mouseY * resolution;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = (blob.currentSize / 100) * minDim;
      if (dist < radius * 1.5 && dist > 0) {
        const force = ((1 - dist / (radius * 1.5)) * interactionStrength) / 100;
        targetOffsetX = (dx / dist) * force * 20;
        targetOffsetY = (dy / dist) * force * 20;
      }
    }

    const offsetLerp = 0.04;
    blob.interactionOffsetX += (targetOffsetX - blob.interactionOffsetX) * offsetLerp;
    blob.interactionOffsetY += (targetOffsetY - blob.interactionOffsetY) * offsetLerp;

    if (Math.abs(blob.interactionOffsetX) < 0.001) blob.interactionOffsetX = 0;
    if (Math.abs(blob.interactionOffsetY) < 0.001) blob.interactionOffsetY = 0;

    blob.currentX += blob.interactionOffsetX;
    blob.currentY += blob.interactionOffsetY;

    const radius = (blob.currentSize / 100) * minDim;
    const drawRadius = Math.max(1, Math.round(radius));

    if (needsTextureRebuild(blob, drawRadius)) {
      const result = createBlobTexture(blob.config, drawRadius);
      blob.texture = result.canvas;
      blob.textureColor = blob.config.color;
      blob.textureSize = drawRadius;
      blob.textureShape = blob.config.shape ?? 'circle';
      blob.textureScaleX = blob.config.scaleX ?? 1;
      blob.textureScaleY = blob.config.scaleY ?? 1;
      blob.textureRotation = blob.config.rotation ?? 0;
      blob.textureWidth = result.width;
      blob.textureHeight = result.height;
    }

    const scale = blob.textureSize > 0 ? drawRadius / blob.textureSize : 1;
    const drawW = blob.textureWidth * scale;
    const drawH = blob.textureHeight * scale;
    const px = (blob.currentX / 100) * w - drawW / 2;
    const py = (blob.currentY / 100) * h - drawH / 2;

    ctx.globalAlpha = blob.currentOpacity;
    ctx.drawImage(blob.texture!, px, py, drawW, drawH);
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
