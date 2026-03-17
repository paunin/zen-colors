import type { AnimationConfig, BlobState, EasingType } from './types';
import { degToRad, noise2D } from './utils';

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
  const t = time * speed;

  switch (animation.type) {
    case 'drift': {
      const rawX = Math.sin(t * 0.4 + phase);
      const rawY = Math.cos(t * 0.3 + phase + 0.7);
      return {
        dx: applyEasing(rawX, easing) * range,
        dy: applyEasing(rawY, easing) * range,
        dSize: 0,
        dOpacity: 0,
      };
    }

    case 'pulse': {
      const raw = Math.sin(t * 0.8 + phase);
      const sizeChange = applyEasing(raw, easing) * range * 0.5;
      return {
        dx: 0,
        dy: 0,
        dSize: sizeChange,
        dOpacity: 0,
      };
    }

    case 'orbit': {
      const angle = t * 0.5 + phase;
      return {
        dx: Math.cos(angle) * range,
        dy: Math.sin(angle) * range,
        dSize: 0,
        dOpacity: 0,
      };
    }

    case 'breathe': {
      const rawSize = Math.sin(t * 0.5 + phase);
      const rawOpacity = Math.sin(t * 0.5 + phase + Math.PI * 0.25);
      return {
        dx: 0,
        dy: 0,
        dSize: applyEasing(rawSize, easing) * range * 0.4,
        dOpacity: applyEasing(rawOpacity, easing) * 0.3,
      };
    }

    case 'wander': {
      const noiseScale = 0.15 * speed;
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
