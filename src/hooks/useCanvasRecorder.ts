import { useState, useRef, useCallback, useEffect } from 'react';

const MIME_CANDIDATES = [
  { mime: 'video/mp4;codecs=avc1.42E01E', ext: 'mp4', type: 'video/mp4' },
  { mime: 'video/webm;codecs=vp9', ext: 'webm', type: 'video/webm' },
  { mime: 'video/webm', ext: 'webm', type: 'video/webm' },
];

function pickFormat() {
  for (const c of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(c.mime)) return c;
  }
  return MIME_CANDIDATES[MIME_CANDIDATES.length - 1]!;
}

export function useCanvasRecorder(
  containerRef: React.RefObject<HTMLElement | null>,
  blur: number,
  fps: number = 30,
) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const sourceCanvas = container.querySelector('canvas');
    if (!sourceCanvas) return;

    const rect = container.getBoundingClientRect();
    const outW = Math.round(rect.width);
    const outH = Math.round(rect.height);

    const output = document.createElement('canvas');
    output.width = outW;
    output.height = outH;
    outputCanvasRef.current = output;

    const ctx = output.getContext('2d')!;

    const pump = () => {
      ctx.clearRect(0, 0, outW, outH);
      ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none';
      const sw = sourceCanvas.width;
      const sh = sourceCanvas.height;
      const dpr = sw / (rect.width + blur * 2) || 1;
      const padPx = blur * dpr;
      const srcW = sw - padPx * 2;
      const srcH = sh - padPx * 2;
      ctx.drawImage(sourceCanvas, padPx, padPx, srcW, srcH, 0, 0, outW, outH);
      ctx.filter = 'none';
      rafRef.current = requestAnimationFrame(pump);
    };
    pump();

    const captureFps = Math.max(1, Math.round(fps));
    const stream = output.captureStream(captureFps);
    const fmt = pickFormat();
    const recorder = new MediaRecorder(stream, { mimeType: fmt.mime });

    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      cancelAnimationFrame(rafRef.current);
      const blob = new Blob(chunksRef.current, { type: fmt.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zen-colors-${Date.now()}.${fmt.ext}`;
      a.click();
      URL.revokeObjectURL(url);
    };

    recorder.start(100);
    recorderRef.current = recorder;
    startTimeRef.current = Date.now();
    setElapsed(0);
    setRecording(true);

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [containerRef, blur, fps]);

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { recording, elapsed, start, stop };
}
