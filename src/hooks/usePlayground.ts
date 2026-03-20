import { useState, useMemo, useEffect, useCallback } from 'react';
import type { BlobConfig, BlobShape, AnimationType } from 'zen-colors';

export function usePlayground() {
  const [blur, setBlur] = useState(70);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [blobCount, setBlobCount] = useState(3);
  const [shape, setShape] = useState<BlobShape>('ellipse');
  const [interactive, setInteractive] = useState(true);
  const [sizeAdjust, setSizeAdjust] = useState(0);
  const [targetFps, setTargetFps] = useState(15);

  const playgroundBlobs = useMemo<BlobConfig[]>(() => {
    const minDim = Math.min(window.innerWidth, window.innerHeight);
    const s = Math.min(1, Math.max(0, (minDim - 320) / 1600));

    const baseSize = Math.round(25 + s * 15);
    const sizeStep = Math.round(2 + s * 2);
    const baseRange = Math.round(10 + s * 8);
    const rangeStep = Math.round(2 + s * 2);
    const baseSpeed = Math.round((0.3 + (1 - s) * 0.15) * 100) / 100;
    const speedStep = Math.round((0.08 + s * 0.04) * 100) / 100;
    const baseDur = Math.round(12 + s * 8);
    const durStep = Math.round(2 + s * 2);

    const colors = ['#ff0055', '#8800ff', '#0066ff', '#00cc88', '#ff8800'];
    const animTypes: AnimationType[] = ['drift', 'breathe', 'wander', 'orbit', 'pulse'];
    const rotations = [0, -30, 45, -15, 60];
    const scales: [number, number][] = [[1.5, 0.8], [1.3, 0.9], [1.8, 0.6], [1.2, 1.0], [1.6, 0.7]];
    return Array.from({ length: blobCount }, (_, i) => {
      const [sx, sy] = scales[i % 5] ?? [1, 1];
      return {
        id: `pg-${i}`,
        color: colors[i % colors.length] ?? '#ff0055',
        x: 15 + (i * 70) / Math.max(blobCount - 1, 1),
        y: 25 + (i % 2 === 0 ? 0 : 40),
        size: baseSize - i * sizeStep,
        opacity: 0.85 - i * 0.05,
        shape,
        scaleX: shape === 'circle' || shape === 'ring' ? 1 : sx,
        scaleY: shape === 'circle' || shape === 'ring' ? 1 : sy,
        rotation: shape === 'circle' || shape === 'ring' ? 0 : (rotations[i % 5] ?? 0),
        animation: {
          type: animTypes[i % 5] ?? ('drift' as const),
          speed: Math.round((baseSpeed + i * speedStep) * 100) / 100,
          range: baseRange + i * rangeStep,
          phase: i * 72,
          duration: baseDur + i * durStep,
        },
      };
    });
  }, [blobCount, shape]);

  const [liveBlobs, setLiveBlobs] = useState<BlobConfig[]>(playgroundBlobs);
  const [blobsJson, setBlobsJson] = useState(() => JSON.stringify(playgroundBlobs, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    setLiveBlobs(playgroundBlobs);
    setBlobsJson(JSON.stringify(playgroundBlobs, null, 2));
    setJsonError(null);
  }, [playgroundBlobs]);

  const applyJson = useCallback(() => {
    try {
      const parsed: unknown = JSON.parse(blobsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setLiveBlobs(parsed as BlobConfig[]);
        setJsonError(null);
      } else {
        setJsonError('Must be a non-empty array of blob configs');
      }
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  }, [blobsJson]);

  const randomizeBlobs = useCallback(() => {
    const shapes: BlobShape[] = ['circle', 'ellipse', 'beam', 'ring', 'triangle', 'scalene', 'square', 'pentagon', 'poly'];
    const anims: AnimationType[] = ['drift', 'breathe', 'wander', 'orbit', 'pulse'];
    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const minDim = Math.min(vw, vh);

    // Scale factor: 0 at 320px, 1 at 1920px — clamped to [0,1]
    const scale = Math.min(1, Math.max(0, (minDim - 320) / 1600));

    // Bigger screens → fewer but larger blobs, slower & wider motion
    const count = Math.round(2 + (1 - scale) * 2 + Math.random() * 2);
    const sizeMin = Math.round(18 + scale * 15);
    const sizeMax = Math.round(40 + scale * 25);
    const rangeMin = Math.round(8 + scale * 6);
    const rangeMax = Math.round(16 + scale * 12);
    const speedMin = Math.round((0.15 + (1 - scale) * 0.1) * 10) / 10;
    const speedMax = Math.round((0.6 + (1 - scale) * 0.3) * 10) / 10;
    const durMin = Math.round(12 + scale * 8);
    const durMax = Math.round(20 + scale * 12);

    const randNeon = () => {
      const h = Math.floor(Math.random() * 360);
      const s = 85 + Math.floor(Math.random() * 16);
      const l = 50 + Math.floor(Math.random() * 16);
      const hslToHex = (hh: number, ss: number, ll: number) => {
        const a = ss / 100 * Math.min(ll, 100 - ll) / 100;
        const f = (n: number) => {
          const k = (n + hh / 30) % 12;
          const c = ll / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * c).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
      };
      return hslToHex(h, s, l);
    };
    const blobs: BlobConfig[] = Array.from({ length: count }, (_, i) => {
      const sh = shapes[Math.floor(Math.random() * shapes.length)] ?? 'circle';
      const useRange = Math.random() > 0.5;
      const opMin = Math.round(rand(0.3, 0.6) * 100) / 100;
      const opMax = Math.round(rand(0.7, 1.0) * 100) / 100;
      return {
        id: `rand-${i}`,
        color: randNeon(),
        x: Math.round(rand(10, 90)),
        y: Math.round(rand(10, 90)),
        size: Math.round(rand(sizeMin, sizeMax)),
        opacity: useRange ? [opMin, opMax] as [number, number] : Math.round(rand(0.5, 1) * 100) / 100,
        ...(useRange ? { opacityDuration: Math.round(rand(6, 16)) } : {}),
        shape: sh,
        ...(sh === 'poly' ? {
          corners: 3 + Math.floor(Math.random() * 8),
          morphSpeed: Math.round(rand(0.1, 0.8) * 100) / 100,
          morphRange: Math.round(rand(1.5, 4.0) * 10) / 10,
        } : {}),
        scaleX: sh === 'circle' || sh === 'ring' || sh === 'poly' ? 1 : Math.round(rand(0.6, 2.0) * 10) / 10,
        scaleY: sh === 'circle' || sh === 'ring' || sh === 'poly' ? 1 : Math.round(rand(0.5, 1.5) * 10) / 10,
        rotation: sh === 'circle' || sh === 'ring' ? 0 : Math.round(rand(-60, 60)),
        animation: {
          type: anims[Math.floor(Math.random() * anims.length)] ?? ('drift' as const),
          speed: Math.round(rand(speedMin, speedMax) * 10) / 10,
          range: Math.round(rand(rangeMin, rangeMax)),
          phase: Math.round(rand(0, 360)),
          duration: Math.round(rand(durMin, durMax)),
        },
      };
    });
    const json = JSON.stringify(blobs, null, 2);
    setBlobsJson(json);
    setLiveBlobs(blobs);
    setJsonError(null);
  }, []);

  const scaledBlobs = useMemo<BlobConfig[]>(() => {
    if (sizeAdjust === 0) return liveBlobs;
    const multiplier = 1 + sizeAdjust / 100;
    return liveBlobs.map((b) => ({ ...b, size: Math.max(1, Math.round(b.size * multiplier)) }));
  }, [liveBlobs, sizeAdjust]);

  return {
    blur, setBlur,
    speed, setSpeed,
    paused, setPaused,
    blobCount, setBlobCount,
    shape, setShape,
    interactive, setInteractive,
    sizeAdjust, setSizeAdjust,
    targetFps, setTargetFps,
    scaledBlobs,
    blobsJson, setBlobsJson,
    jsonError,
    applyJson,
    randomizeBlobs,
  };
}
