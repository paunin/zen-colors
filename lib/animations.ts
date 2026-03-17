import type { AnimationConfig, BlobState, EasingType } from './types';
import { degToRad, noise2D } from './utils';

const TWO_PI = Math.PI * 2;

/** Apply easing to a normalized sine value */
function applyEasing(t: number, easing: EasingType): number {
  switch (easing) {
    case 'linear':
      return t;
    case 'ease': {
      const s = (t + 1) / 2;
      const eased = s * s * (3 - 2 * s);
      return eased * 2 - 1;
    }
    case 'sine':
    default:
      return t;
  }
}

export interface AnimationResult {
  dx: number;
  dy: number;
  dSize: number;
  dOpacity: number;
}

const EMPTY_RESULT: AnimationResult = { dx: 0, dy: 0, dSize: 0, dOpacity: 0 };

/**
 * Compute animation deltas for a single blob at a given time.
 *
 * @param blob - Current blob runtime state
 * @param time - Elapsed seconds (already multiplied by global speed)
 * @param animation - The blob's animation config
 * @returns Deltas to apply to position, size, opacity
 */
export function computeAnimation(
  blob: BlobState,
  time: number,
  animation: AnimationConfig | undefined
): AnimationResult {
  if (!animation || animation.type === 'none') {
    return EMPTY_RESULT;
  }

  const speed = animation.speed ?? 1;
  const range = animation.range ?? 20;
  const phase = degToRad(animation.phase ?? 0);
  const easing = animation.easing ?? 'sine';
  const dur = animation.duration;
  const t = time * speed;

  switch (animation.type) {
    case 'drift': {
      const freqX = dur != null ? TWO_PI / dur : 0.4;
      const freqY = dur != null ? TWO_PI / dur * 0.75 : 0.3;
      const rawX = Math.sin(t * freqX + phase);
      const rawY = Math.cos(t * freqY + phase + 0.7);
      return {
        dx: applyEasing(rawX, easing) * range,
        dy: applyEasing(rawY, easing) * range,
        dSize: 0,
        dOpacity: 0,
      };
    }

    case 'pulse': {
      const freq = dur != null ? TWO_PI / dur : 0.35;
      const raw = Math.sin(t * freq + phase);
      const n = (raw + 1) / 2;
      const smooth = n * n * (3 - 2 * n);
      const mapped = smooth * 2 - 1;
      const sizeChange = applyEasing(mapped, easing) * range * 0.5;
      return {
        dx: 0,
        dy: 0,
        dSize: sizeChange,
        dOpacity: 0,
      };
    }

    case 'orbit': {
      const freq = dur != null ? TWO_PI / dur : 0.5;
      const angle = t * freq + phase;
      return {
        dx: Math.cos(angle) * range,
        dy: Math.sin(angle) * range,
        dSize: 0,
        dOpacity: 0,
      };
    }

    case 'breathe': {
      const freq = dur != null ? TWO_PI / dur : 0.5;
      const rawSize = Math.sin(t * freq + phase);
      const nS = (rawSize + 1) / 2;
      const smoothS = nS * nS * (3 - 2 * nS);
      const mappedSize = smoothS * 2 - 1;

      const rawOp = Math.sin(t * freq + phase + Math.PI * 0.25);
      const nO = (rawOp + 1) / 2;
      const smoothO = nO * nO * (3 - 2 * nO);
      const mappedOp = smoothO * 2 - 1;

      return {
        dx: 0,
        dy: 0,
        dSize: applyEasing(mappedSize, easing) * range * 0.4,
        dOpacity: applyEasing(mappedOp, easing) * 0.3,
      };
    }

    case 'wander': {
      const noiseFreq = dur != null ? 1 / dur : 0.15;
      const noiseScale = noiseFreq * speed;
      const nx = noise2D(
        blob.noiseOffsetX + t * noiseScale,
        blob.noiseOffsetY
      );
      const ny = noise2D(
        blob.noiseOffsetX,
        blob.noiseOffsetY + t * noiseScale
      );
      return {
        dx: nx * range,
        dy: ny * range,
        dSize: 0,
        dOpacity: 0,
      };
    }

    default:
      return EMPTY_RESULT;
  }
}
