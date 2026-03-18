import {
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
} from 'react';
import type { ZenColorsProps, BlobState } from './types';
import { initBlobStates, syncBlobStates, renderFrame } from './canvas-renderer';

const DEFAULT_BLUR = 60;
const DEFAULT_BACKGROUND = '#000000';
const DEFAULT_BLEND_MODE = 'lighter' as GlobalCompositeOperation;
const DEFAULT_SPEED = 1;
const DEFAULT_RESOLUTION = 1;
const DEFAULT_INTERACTION_STRENGTH = 30;

export function ZenColors({
  width = '100%',
  height = '100%',
  className,
  style,
  background = DEFAULT_BACKGROUND,
  blobs,
  blur = DEFAULT_BLUR,
  blendMode = DEFAULT_BLEND_MODE,
  speed = DEFAULT_SPEED,
  paused = false,
  interactive = false,
  interactionStrength = DEFAULT_INTERACTION_STRENGTH,
  targetFps = 15,
  resolution = DEFAULT_RESOLUTION,
  overflowPadding,
  children,
}: ZenColorsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blobStatesRef = useRef<BlobState[]>([]);
  const rafIdRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });
  const smoothMouseRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  const padding = overflowPadding ?? blur;

  // Sync blob states when config changes
  useEffect(() => {
    if (blobStatesRef.current.length === 0) {
      blobStatesRef.current = initBlobStates(blobs);
    } else {
      blobStatesRef.current = syncBlobStates(blobStatesRef.current, blobs);
    }
  }, [blobs]);

  // Resize canvas to match container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = resolution * (typeof window !== 'undefined' ? window.devicePixelRatio : 1);
    const canvasW = Math.round((rect.width + padding * 2) * dpr);
    const canvasH = Math.round((rect.height + padding * 2) * dpr);

    if (canvas.width !== canvasW || canvas.height !== canvasH) {
      canvas.width = canvasW;
      canvas.height = canvasH;
      // Invalidate all textures on resize so they regenerate at proper scale
      for (const blob of blobStatesRef.current) {
        blob.texture = null;
      }
    }
  }, [resolution, padding]);

  // Animation loop
  useEffect(() => {
    if (typeof window === 'undefined') return;

    startTimeRef.current = performance.now();

    const MOUSE_LERP = 0.04;

    const frameInterval = 1000 / Math.max(0.01, targetFps);

    const tick = (now: number) => {
      const delta = now - lastFrameTimeRef.current;
      if (!paused && delta >= frameInterval) {
        lastFrameTimeRef.current = now - (delta % frameInterval);

        resizeCanvas();

        const raw = mouseRef.current;
        const sm = smoothMouseRef.current;
        if (raw.x != null && raw.y != null) {
          sm.x = sm.x == null ? raw.x : sm.x + (raw.x - sm.x) * MOUSE_LERP;
          sm.y = sm.y == null ? raw.y : sm.y + (raw.y - sm.y) * MOUSE_LERP;
        } else {
          sm.x = null;
          sm.y = null;
        }

        const canvas = canvasRef.current;
        if (canvas) {
          const elapsed = (performance.now() - startTimeRef.current) / 1000;
          renderFrame({
            canvas,
            blobs: blobStatesRef.current,
            time: elapsed,
            globalSpeed: speed,
            blendMode,
            background,
            resolution,
            mouseX: sm.x,
            mouseY: sm.y,
            interactive,
            interactionStrength,
          });
        }
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };

    lastFrameTimeRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [paused, speed, blendMode, background, resolution, interactive, interactionStrength, targetFps, resizeCanvas]);

  // ResizeObserver for responsive sizing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(container);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  // Mouse/touch tracking
  useEffect(() => {
    if (!interactive || typeof window === 'undefined') return;
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left + padding;
      mouseRef.current.y = e.clientY - rect.top + padding;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = touch.clientX - rect.left + padding;
      mouseRef.current.y = touch.clientY - rect.top + padding;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive, padding]);

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    overflow: 'hidden',
    background,
    ...style,
  };

  const canvasStyle: CSSProperties = {
    position: 'absolute',
    top: -padding,
    left: -padding,
    width: `calc(100% + ${padding * 2}px)`,
    height: `calc(100% + ${padding * 2}px)`,
    filter: `blur(${blur}px)`,
    pointerEvents: 'none',
  };

  const childrenStyle: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    height: '100%',
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      <canvas ref={canvasRef} style={canvasStyle} />
      {children && <div style={childrenStyle}>{children}</div>}
    </div>
  );
}
